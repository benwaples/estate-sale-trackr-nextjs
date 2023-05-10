import { SaleDetails } from "@/types";
import { getHelper } from "./utils";

export async function GetSaleDetails(saleIdList: number[]): Promise<SaleDetails[] | undefined> {
	try {
		const saleDetailsParam = saleIdList.map(id => '/' + id).join('');

		const res = await getHelper(`/api/estate-sale/sale-details${saleDetailsParam}`);

		return res;
	} catch (error) {
		console.error(error);
		return [];
	}
}