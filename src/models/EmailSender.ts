import { FollowedSale } from '@/types';
import Mailjet from 'node-mailjet';



export class EmailSender {

	static async sendEmail(emailAddress: string, html: string) {
		const client = new Mailjet({ apiKey: process.env.MAILJET_API_KEY, apiSecret: process.env.MAILJET_SECRET });

		const messages = {
			Messages: [
				{
					From: {
						Email: 'benwaples@gmail.com',
						Name: 'Ben'
					},
					To: [
						{
							Email: emailAddress,
						}
					],
					Subject: `Update to an estate sale youre following`,
					HTMLPart: html
				}
			]
		};

		try {
			console.log('sending email to: ', emailAddress);
			await client.post('send', { 'version': 'v3.1' }).request(messages);
		} catch (e) {
			console.error(e);
		}

	}

	static baseHtml(body: string) {
		return (`
		<!DOCTYPE html>
		<html>
		<head>
			<title>Estate Sale Trackr Email</title>
			<style>
				body {
					background-color: #000000;
					font-family: Arial, sans-serif;
					padding: 20px;
				}
				.container {
					background-color: #000000;
					border-radius: 10px;
					box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
					margin: 0 auto 30px;
					max-width: 600px;
					padding: 30px;
					text-align: center;
				}
				h1 {
					color: white;
					font-size: 32px;
					margin-bottom: 20px;
				}
				p {
					color: #ffffff;
					font-size: 18px;
					line-height: 1.5;
					margin-bottom: 30px;
				}
				.btn {
					background-color: lightgreen;
					color: black;
					border: none;
					border-radius: 5px;
					color: black;
					display: inline-block;
					font-size: 18px;
					padding: 10px 20px;
					text-decoration: none;
					transition: background-color 0.3s ease;
				}
				a[href] {
					colore: black
				}
				.btn:hover {
					background-color: green;
				}
				.accent {
					color: lightgreen;
				}
			</style>
		</head>
			<body>
				${body}
			</body>
		</html>
		`);
	}

	static async sendFollowedSaleEmail(emailAddress: string, followedSaleList: FollowedSale[]) {
		const followedSaleHtml = followedSaleList.map(sale => `
		<div class="container">
			<h1 class="accent">Theres been an Update to a Sale youre following!</h1>
			<p><span class="accent">${sale.address}</span></p>
			<a href="https://estate-sale-trackr-nextjs.vercel.app/?sale_id=${sale.sale_id}" class="btn">Go to sale</a>
		</div>
		`).join('');

		const html = this.baseHtml(followedSaleHtml);

		return await this.sendEmail(emailAddress, html);
	}


}