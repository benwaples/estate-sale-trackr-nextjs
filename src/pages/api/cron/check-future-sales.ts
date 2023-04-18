import { NextApiReq, NextApiRes } from "@/types";
import { allUpcomingSaleIds, getSaleInfo } from "../estate-sale/all-upcoming-sales";
import User from "@/models/User";
import Sale from "@/models/Sale";
import { toMap } from "@/utils/utils";

async function checkFutureSales(req: NextApiReq, res: NextApiRes) {
	if (req.method !== 'GET') return res.status(404).end();
	console.time('checkFutureSalesScrape')
	console.timeEnd('checkFutureSalesScrape')
	try {
		// get future sale ids,
		const upcomingSales = await allUpcomingSaleIds()
		const upcomingSaleIds = upcomingSales.map(sale => sale.id)
		if (!upcomingSaleIds.length) return res.status(204).end();

		// compare against ones that people are following, 
		const followedUpcomingSales = await Sale.followedSalesBySaleIds(upcomingSaleIds)
		const followedUpcomingSalesMap = toMap(followedUpcomingSales, 'sale_id');

		console.log('upcomingSalesFollowed', followedUpcomingSales);

		// scrape those pages again. we should make sure that data returned here is the exact same as what gets inserted into followed_sales
		const saleDetails = await Promise.all(followedUpcomingSales.map(followedSale => getSaleInfo(followedSale.sale_id)))

		// compare new data against the stored data that they followed from.

		// if new data doesnt match stored data, notify them and then update their row.

	} catch (e: any) {
		console.error(checkFutureSales.name, e.message)
		res.status(500).send(e.message)
	} finally {
		console.timeEnd('checkFutureSalesScrape')
	}
}

export default checkFutureSales