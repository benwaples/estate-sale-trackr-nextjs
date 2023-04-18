import Sale from "@/models/Sale";
import { NextApiReq } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";

async function unfollowSale(req: NextApiReq<{ email: string; }>, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(404).end();

	let id = req.query.followId
	const email = req.body.email;

	if (!id
		|| typeof id !== 'string'
		|| isNaN(Number(id))
		|| !email
	) {
		res.status(403).end()
		return
	};

	try {
		await Sale.unfollowSale(Number(id), email)
		return res.status(200).end()
	} catch (e: any) {
		console.error(unfollowSale.name, e.message)
		res.status(500).send(e.message)
	}
}

export default unfollowSale