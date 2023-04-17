import Sale from "@/models/Sale";
import { FollowedSale, NextApiReq, NextApiRes } from "@/types";


async function followSale(req: NextApiReq<FollowedSale>, res: NextApiRes) {
	if (req.method !== 'POST') return res.status(404);

	const body = req.body;

	if (!body) return res.status(403)

	try {
		const followedSale = await Sale.followSale(body)
		console.log('followedSale', followedSale)
		return res.send(followedSale)
	} catch (e: any) {
		console.error(followSale.name, e.message)
		res.status(500).send(e.message)
	}
}

export default followSale