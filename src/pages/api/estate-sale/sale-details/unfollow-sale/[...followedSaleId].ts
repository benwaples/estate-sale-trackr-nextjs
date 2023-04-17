import Sale from "@/models/Sale";
import { NextApiRequest, NextApiResponse } from "next";

async function unfollowSale(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(404);

	let id = req.query.followedSaleId
	if (!id || typeof id !== 'string' || isNaN(Number(id))) return res.status(403);

	try {
		Sale.unfollowSale(Number(id))
		return res.status(200)
	} catch (e: any) {
		console.error(unfollowSale.name, e.message)
		res.status(500).send(e.message)
	}
}

export default unfollowSale