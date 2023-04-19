import { FollowedSale, NextApiReq, NextApiRes, SaleDetails } from "@/types";
import { allUpcomingSaleIds, getSaleInfo } from "../estate-sale/all-upcoming-sales";
import Sale from "@/models/FollowedSale";
import { toMap } from "@/utils/utils";
import { EmailSender } from "@/models/EmailSender";

function compareSaleDetails(saleDetails: SaleDetails, followedSale: FollowedSale) {
	if (saleDetails?.dates?.startTime !== followedSale?.start_time) {
		console.log('startTime', saleDetails?.dates?.startTime, followedSale?.start_time);
		return false;
	}
	if (saleDetails?.dates?.endTime !== followedSale?.end_time) {
		console.log('endTime', saleDetails?.dates?.endTime, followedSale?.end_time);
		return false;
	}
	if (saleDetails?.address !== followedSale.address) {
		console.log('address', saleDetails?.address, followedSale.address);
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

		// if new data doesnt match stored data, notify them and then update their row.
		const notifyList = saleDetails.reduce((a: FollowedSale[], c) => {
			const followedSale = followedUpcomingSalesMap[c.id];
			// compare new data against the stored data that they followed from.
			const isEqual = compareSaleDetails(c, followedSale);
			// local fallback so I dont accidentally send emails to other people
			if (isEqual || process.env.LOCAL && followedSale.follower_email !== 'benwaples@gmail.com') return a;

			a.push({ ...followedSale, address: c.address, start_time: c.dates?.startTime, end_time: c.dates?.endTime });
			return a;
		}, []);

		console.log('notifyList', notifyList);

		if (!notifyList.length) return res.status(200).end();
		// TODO: bucket emails that should be sent to one person

		// send notification via some sort of queue
		await Promise.all(notifyList.map(EmailSender.sendEmail));
		//  bulk update the followed sale
		const updatedFollowedSales = await Sale.bulkUpdateFollowedSales(notifyList);
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