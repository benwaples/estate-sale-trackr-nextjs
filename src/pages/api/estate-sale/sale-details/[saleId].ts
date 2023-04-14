import { Sale } from "@/types";
import { parseResponseBodyIntoDom, parseSaleAddress, parseSaleDateString, removeTabsAndNewLines } from "../utils";
import { NextApiRequest, NextApiResponse } from "next";

async function getSaleInfo(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') return res.status(404);

	const id = req.query.saleId

	try {
		const saleURL = `https://www.estatesale-finder.com/viewsale.php?saleid=${id}`;

		const response = await fetch(saleURL);
		const document = await parseResponseBodyIntoDom(response)

		const rows = document.querySelectorAll('.salelist .row')
		const images = document.querySelectorAll('.salelist img')

		const data = {} as Sale

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

		res.send(data)
	} catch (e: any) {
		console.error(getSaleInfo.name, e.message)
		res.status(500).send(e.message)
	}
}

export default getSaleInfo