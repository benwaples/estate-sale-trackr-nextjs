import User from "../../../models/User";
import { NextApiReq, NextApiRes } from "@/types";
import { checkAuthMiddleware } from "../auth/utils";

interface ReqBody {
	saleId: number;
}

async function addFavoriteSale(
	req: NextApiReq<ReqBody>,
	res: NextApiRes
) {
	if (!req.user?.id) return res.status(401).end()
	if (req.method !== 'POST') return res.status(404).end()

	const { saleId } = req.body;
	if (!saleId || isNaN(Number(saleId))) return res.status(400).end()

	console.log(`saving sale ${saleId} for ${req.user.username}`)
	try {
		await User.addFavoriteSale(req.user.id, saleId);
		return res.status(200).end()
	} catch (e: any) {
		console.error(addFavoriteSale.name, e.message)
		res.status(500).send(e.message)
	}
}

export default checkAuthMiddleware(addFavoriteSale)