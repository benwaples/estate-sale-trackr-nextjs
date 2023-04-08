import { Request, Response } from "express";
import fetch from 'node-fetch';
import jsdom from 'jsdom'


export async function allSales(req: Request, res: Response) {
	// const response = await fetch('https://www.estatesale-finder.com/all_sales_list.php?saletypeshow=1&regionsshow=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,31,32,33,34,23,24,25,26,27,28,29,35,36,37&proonly=false&todayonly=false');
	// const body = await response.text();

	// const dom = new jsdom.JSDOM(body)
	// const document = dom.window.document

	// const allSaleLinks = document.querySelectorAll('a.view')

	// const saleIdList: string[] = [];

	// allSaleLinks.forEach(link => {
	// 	const href = link.attributes.getNamedItem('href')
	// 	const saleId = href?.textContent?.split('=')[1]

	// 	if (saleId) saleIdList.push(saleId)
	// })

	// console.log('saleIdList', saleIdList)

	// res.send(body)
}