import { Sale } from "@/types";
import { parseResponseBodyIntoDom, parseSaleAddress, parseSaleDateString, removeTabsAndNewLines } from "../utils";
import { NextApiRequest, NextApiResponse } from "next";
import { getSaleInfo } from "../all-upcoming-sales";

async function getSaleListInfo(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') return res.status(404);

	let idListReq = req.query.saleId
	if (!idListReq) return res.status(403);

	if (typeof idListReq !== 'object') {
		idListReq = [idListReq]
	}

	try {
		const idList = idListReq.map(Number);

		const data = await Promise.all(idList.map(getSaleInfo))
		res.send(data)
	} catch (e: any) {
		console.error(getSaleListInfo.name, e.message)
		res.status(500).send(e.message)
	}
}

export default getSaleListInfo