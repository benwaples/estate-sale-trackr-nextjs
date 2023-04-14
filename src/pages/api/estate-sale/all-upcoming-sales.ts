import { Dictionary, Sale } from "@/types";
import { parseResponseBodyIntoDom, parseSaleAddress, parseSaleDateString, removeTabsAndNewLines } from "./utils";
import { NextApiRequest, NextApiResponse } from "next";
import { checkAuthMiddleware } from "../auth/utils";

interface allUpcomingSalesReturn {
	id: number;
	address: string
}
export async function allUpcomingSaleIds(): Promise<allUpcomingSalesReturn[]> {
	const response = await fetch('https://www.estatesale-finder.com/all_sales_list.php?saletypeshow=1&regionsshow=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,31,32,33,34,23,24,25,26,27,28,29,35,36,37&proonly=false&todayonly=false');
	const document = await parseResponseBodyIntoDom(response)

	const saleRows = document.querySelectorAll('.salerow')

	const data: allUpcomingSalesReturn[] = [];

	saleRows.forEach(row => {
		const link = row.querySelector('a.view')
		const address = row.querySelector('.hide-for-small.medium-4.columns p')

		const href = link?.attributes.getNamedItem('href')
		const saleId = href?.textContent?.split('=')[1]
		const addressText = address?.textContent;
		console.log('addressText', addressText)
		console.log('Number(saleId)', Number(saleId))
		if (!saleId || !addressText) return;
		// return {
		// 	id: saleId,
		// 	address
		// }
		data.push({
			id: Number(saleId),
			address: addressText
		})
	})
	console.log('data', data)
	return data;
}

export async function getSaleInfo(id: number): Promise<Sale> {
	const saleURL = `https://www.estatesale-finder.com/viewsale.php?saleid=${id}`;

	const response = await fetch(saleURL);
	const document = await parseResponseBodyIntoDom(response)

	const rows = document.querySelectorAll('.salelist .row')
	const images = document.querySelectorAll('.salelist img')

	const data = { id } as Sale

	rows.forEach(row => {
		const title = removeTabsAndNewLines(row.querySelector('.small-3')?.textContent ?? '')
		const description = removeTabsAndNewLines(row.querySelector('.small-9')?.textContent ?? '')

		if (title && description) {
			if (title === 'Dates') {
				return data[title] = parseSaleDateString(description) ?? ''
			}
			if (title === 'Address') {
				return data[title] = parseSaleAddress(description)
			}

			data[title] = description

		}
	})

	images.forEach(image => {
		const source = image.attributes.getNamedItem('src')?.textContent
		if (!source) return;

		const fullSource = `https://www.estatesale-finder.com/${source}`
		if (!data.Images) {
			return data.Images = [fullSource]
		} else {
			data.Images.push(fullSource)
		}
	})

	return data
}

export async function allUpcomingSalesHandler() {
	const saleIds = await allUpcomingSaleIds();
	const saleInfo = await Promise.all(saleIds.map(data => getSaleInfo(data.id)))

	return saleInfo
}

async function allUpcomingSales(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') return res.status(404);

	try {
		const saleIds = await allUpcomingSaleIds();

		const saleInfo = await allUpcomingSalesHandler()

		res.send(saleInfo)
	} catch (e: any) {
		console.error(allUpcomingSales.name, e.message)
		res.status(500).send(e.message)
	}
}

export default checkAuthMiddleware(allUpcomingSales)
