import { NextApiRequest, NextApiResponse } from "next";
import User from "../model/User";
import { NextApiReq } from "@/types";

export default async function addFavoriteSale(
	req: NextApiReq<{ saleId: number }>,
	res: NextApiResponse
) {
	if (req.method !== 'POST') return res.status(404);
	const { saleId } = req.body;

	if (!req.user?.id) return res.status(401)

	try {
		await User.addFavoriteSale(req.user.id, saleId);
		return res.status(200)
	} catch (e: any) {
		console.error(addFavoriteSale.name, e.message)
		res.status(500).send(e.message)
	}

}