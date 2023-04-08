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

export default checkAuthMiddleware(addFavoriteSale)