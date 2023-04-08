import { Request, Response } from "express";
import fetch from 'node-fetch';
import { parseSaleDateString, parseResponseBodyIntoDom, removeTabsAndNewLines, parseSaleAddress } from "../../../utils/utils";
import { Dictionary, ExpressRequest } from "../types";
import User from "../model/User";


export async function allUpcomingSalesIds() {
	const response = await fetch('https://www.estatesale-finder.com/all_sales_list.php?saletypeshow=1&regionsshow=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,31,32,33,34,23,24,25,26,27,28,29,35,36,37&proonly=false&todayonly=false');
	const document = await parseResponseBodyIntoDom(response)

	const allSaleLinks = document.querySelectorAll('a.view')

	const saleIdList: number[] = [];

	allSaleLinks.forEach(link => {
		const href = link.attributes.getNamedItem('href')
		const saleId = href?.textContent?.split('=')[1]

		if (saleId) saleIdList.push(Number(saleId))
	})

	return saleIdList;
}

export async function getSaleInfo(id: number) {
	const saleURL = `https://www.estatesale-finder.com/viewsale.php?saleid=${id}`;

	const response = await fetch(saleURL);
	const document = await parseResponseBodyIntoDom(response)

	const rows = document.querySelectorAll('.salelist .row')
	const images = document.querySelectorAll('.salelist img')

	const data: Dictionary = { id }

	rows.forEach(row => {
		const title = removeTabsAndNewLines(row.querySelector('.small-3')?.textContent ?? '')
		const description = removeTabsAndNewLines(row.querySelector('.small-9')?.textContent ?? '')

		if (title && description) {
			if (title === 'Dates') {
				return data[title] = parseSaleDateString(description)
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
		if (!data.images) {
			return data.images = [fullSource]
		} else {
			data.images.push(fullSource)
		}
	})

	return data
}

export async function allUpcomingSales(req: ExpressRequest, res: Response) {

	try {

		const saleIds = await allUpcomingSalesIds();

		const saleInfo = await Promise.all(saleIds.map(id => getSaleInfo(id)))

		res.send(saleInfo)
	} catch (e: any) {
		console.error(allUpcomingSales.name, e.message)
		res.status(500).send(e.message)
	}
}

export async function addFavoriteSale(req: ExpressRequest<{ saleId: number }>, res: Response) {
	const { saleId } = req.body;

	if (!req.user?.id) return res.sendStatus(401)

	try {
		await User.addFavoriteSale(req.user.id, saleId);
		return res.sendStatus(200)
	} catch (e: any) {
		console.error(addFavoriteSale.name, e.message)
		res.status(500).send(e.message)
	}
}