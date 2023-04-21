import { FollowedSale, NextApiReq, NextApiRes, SaleDetails } from "@/types";
import { allUpcomingSaleIds, getSaleInfo } from "../estate-sale/all-upcoming-sales";
import Sale from "@/models/FollowedSale";
import { toMap } from "@/utils/utils";
import { EmailSender } from "@/models/EmailSender";

function salesAreEqual(saleDetails: SaleDetails, followedSale: FollowedSale) {
	if (saleDetails?.dates?.startTime !== followedSale?.start_time) {
		console.log(followedSale.sale_id, ' startTime does not match', saleDetails?.dates?.startTime, followedSale?.start_time);
		return false;
	}
	if (saleDetails?.dates?.endTime !== followedSale?.end_time) {
		console.log(followedSale.sale_id, ' endTime does not match', saleDetails?.dates?.endTime, followedSale?.end_time);
		return false;
	}
	if (saleDetails?.address !== followedSale.address) {
		console.log(followedSale.sale_id, ' address does not match', saleDetails?.address, followedSale.address);
		return false;
	}
	return true;
}

async function checkFutureSales(req: NextApiReq, res: NextApiRes) {
	if (req.method !== 'GET') return res.status(404).end();
	console.time('checkFutureSalesScrape');

	try {
		// get all future sales that are being followed
		const followedUpcomingSales = await Sale.getAllFutureSalesFollowed();
		if (!followedUpcomingSales.length) return res.status(204).end();

		const followedUpcomingSalesMap = toMap(followedUpcomingSales, 'sale_id');

		//  TODO: this could be a webhook/queue as well
		// scrape those pages again. we should make sure that data returned here is the exact same as what gets inserted into followed_sales
		const saleDetails = await Promise.all(followedUpcomingSales.map(followedSale => getSaleInfo(followedSale.sale_id)));

		const followedSalesToUpdate: FollowedSale[] = [];

		// if new data doesnt match stored data, notify them and then update their row.
		const notifyMap = saleDetails.reduce((a: { [email: string]: { email: string, notifyList: FollowedSale[] } }, c) => {
			const followedSale = followedUpcomingSalesMap[c.id];

			// compare new data against the stored data that they followed from.
			const isEqual = salesAreEqual(c, followedSale);
			// local fallback so I dont accidentally send emails to other people.
			if (![11949, 11768].includes(c.id) && (isEqual || process.env.LOCAL && followedSale.follower_email !== 'benwaples@gmail.com')) return a;

			const updatedFollowedSale = { ...followedSale, address: c.address, start_time: c.dates?.startTime, end_time: c.dates?.endTime };
			followedSalesToUpdate.push(updatedFollowedSale);

			if (a[updatedFollowedSale.follower_email]) {
				a[updatedFollowedSale.follower_email].notifyList.push(updatedFollowedSale);
			} else {
				a[updatedFollowedSale.follower_email] = { email: updatedFollowedSale.follower_email, notifyList: [updatedFollowedSale] };
			}

			return a;
		}, {});

		if (!Object.keys(notifyMap).length) return res.status(200).end();
		console.log('notifications to send', Object.keys(notifyMap).length);

		// TODO: send notification via queue
		await Promise.all(Object.values(notifyMap).map(({ email, notifyList }) => EmailSender.sendFollowedSaleEmail(email, notifyList)));

		//  bulk update the followed sale
		const updatedFollowedSales = await Sale.bulkUpdateFollowedSales(followedSalesToUpdate);
		console.log('updatedFollowedSales', updatedFollowedSales);

		return res.status(200).end();
	} catch (e: any) {
		console.error(checkFutureSales.name, e.message);
		res.status(500).send(e.message);
	} finally {
		console.timeEnd('checkFutureSalesScrape');
	}
}

export default checkFutureSales;