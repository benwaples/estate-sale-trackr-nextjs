import Sale from "@/models/Sale";
import { FollowedSale, NextApiReq, NextApiRes } from "@/types";


async function unfollowSale(req: NextApiReq<FollowedSale>, res: NextApiRes) {
	if (req.method !== 'POST') return res.status(404);

	const body = req.body;

	if (!body) return res.status(403)

	try {
		Sale.followSale(body)
		return res.status(200)
	} catch (e: any) {
		console.error(unfollowSale.name, e.message)
		res.status(500).send(e.message)
	}
}

export default unfollowSale