import { BaseSaleData, Dictionary, RadarAddressResponse, RadarGeocodeForwardResponse, SaleDetails } from "@/types";
import { parseResponseBodyIntoDom, parseSaleAddress, parseSaleDateString, removeTabsAndNewLines } from "./utils";
import { NextApiRequest, NextApiResponse } from "next";
import { checkAuthMiddleware } from "../auth/utils";
import { getHelper } from "@/utils/utils";

async function getLatLngFromAddress(address: string): Promise<{ lat: number, lng: number }> {
	const response = await getHelper<RadarGeocodeForwardResponse>(`${process.env.RADAR_API_ENDPOINT}/geocode/forward?query=${address}`, { Authorization: process.env.RADAR_API_KEY });
	//  defaults to generic portland coordinates
	const latitude = response?.addresses?.[0].latitude ?? 45.533467;
	const longitude = response?.addresses?.[0].longitude ?? -122.650095;
	return { lat: latitude, lng: longitude };
}

function getDataFromSaleRow(row: Element, isThisWeek = false): BaseSaleData | undefined {
	const link = row.querySelector('a.view');
	const address = row.querySelector('.hide-for-small.medium-4.columns p');
	const hostTitle = row.querySelector('.small-12 h5');

	const href = link?.attributes.getNamedItem('href');
	const saleId = href?.textContent?.split('=')[1];
	const host = hostTitle?.textContent;
	const hostUrl = hostTitle?.querySelector('a')?.getAttribute('href');

	let addressText = address?.textContent;

	const addressLink = address?.querySelector('a');
	if (!!addressLink?.children.length) {
		addressText = removeTabsAndNewLines(addressLink.innerHTML);
	} else {
		addressText = `Region - ${addressText?.slice(3)}`;
	}

	if (!saleId || !addressText) return;

	// removes any undefined values
	const dataPoint = JSON.parse(JSON.stringify({
		id: Number(saleId),
		address: addressText,
		host,
		hostUrl: hostUrl ? `${process.env.ESTATE_SALE_FINDER_URL}/${hostUrl}` : undefined,
		isThisWeek
	}));

	return dataPoint;
}

export async function allUpcomingSaleIds(shouldIncludeLatLng?: boolean): Promise<BaseSaleData[]> {
	const response = await fetch(`${process.env.ESTATE_SALE_FINDER_URL}/all_sales_list.php?saletypeshow=1&regionsshow=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,31,32,33,34,23,24,25,26,27,28,29,35,36,37&proonly=false&todayonly=false`);
	const document = await parseResponseBodyIntoDom(response);

	const saleRows = document.querySelectorAll('.salerow');
	const salesThisWeek = document.querySelectorAll('.currentsalelist .salerow');
	const upcomingSales = document.querySelectorAll('.upcomingsalelist .salerow');

	const data: BaseSaleData[] = [];

	salesThisWeek.forEach(row => {
		const dataPoint = getDataFromSaleRow(row);
		if (!dataPoint) return;

		data.push(dataPoint);
	});

	upcomingSales.forEach(row => {
		const dataPoint = getDataFromSaleRow(row, true);
		if (!dataPoint) return;

		data.push(dataPoint);
	});

	if (shouldIncludeLatLng) {

		const dataWithCoordinates = await Promise.all(data.map(async (dataPoint) => {

			const address = dataPoint.address.toLowerCase().includes('region')
				? dataPoint.address.match(/\d+/g)?.[0] ?? dataPoint.address
				: dataPoint.address;

			const coordinates = await getLatLngFromAddress(address);
			return {
				...dataPoint,
				coordinates
			};
		}));

		return dataWithCoordinates;
	}

	return data;
}

export async function getSaleInfo(id: number): Promise<SaleDetails> {
	const saleURL = `${process.env.ESTATE_SALE_FINDER_URL}/viewsale.php?saleid=${id}`;

	const response = await fetch(saleURL);
	const document = await parseResponseBodyIntoDom(response);

	const rows = document.querySelectorAll('.salelist .row');
	const images = document.querySelectorAll('.salelist img');

	const data = { id } as SaleDetails;

	rows.forEach(row => {
		const title = removeTabsAndNewLines(row.querySelector('.small-3')?.textContent ?? '')?.toLowerCase();
		const description = removeTabsAndNewLines(row.querySelector('.small-9')?.textContent ?? '');

		if (title && description) {
			if (title === 'dates') {
				return data[title] = parseSaleDateString(description);
			}
			if (title === 'address') {
				return data[title] = parseSaleAddress(description);
			}

			data[title] = description;

		}
	});

	images.forEach(image => {
		const source = image.attributes.getNamedItem('src')?.textContent;
		if (!source) return;

		const fullSource = `${process.env.ESTATE_SALE_FINDER_URL}/${source}`;
		if (!data.images) {
			return data.images = [fullSource];
		} else {
			data.images.push(fullSource);
		}
	});

	return data;
}

export async function allUpcomingSalesHandler() {
	const saleIds = await allUpcomingSaleIds();
	const saleInfo = await Promise.all(saleIds.map(data => getSaleInfo(data.id)));

	return saleInfo;
}

async function allUpcomingSales(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') return res.status(404);

	try {
		const saleInfo = await allUpcomingSalesHandler();

		res.send(saleInfo);
	} catch (e: any) {
		console.error(allUpcomingSales.name, e.message);
		res.status(500).send(e.message);
	}
}

export default checkAuthMiddleware(allUpcomingSales);
