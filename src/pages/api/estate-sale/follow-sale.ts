import Sale from "@/models/Sale";
import { FollowedSale, NextApiReq, NextApiRes } from "@/types";


async function followSale(req: NextApiReq<FollowedSale>, res: NextApiRes) {
	if (req.method !== 'POST') return res.status(404).end();
	console.log(req.user)
	const body = req.body;

	if (!body) return res.status(403).end();

	try {
		const followedSale = await Sale.followSale(body)

		return res.send(followedSale)
	} catch (e: any) {
		console.error(followSale.name, e.message)
		res.status(500).send(e.message)
	}
}

export default followSale