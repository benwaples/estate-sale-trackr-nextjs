import { SaleDetails } from "@/types";
import { getHelper } from "./utils";

export async function GetSaleDetails(saleIdList: number[]): Promise<SaleDetails[] | undefined> {
	try {
		const res = await getHelper(`/api/estate-sale/sale-details${saleIdList.map(id => '/' + id).join('')}`);
		return res;
	} catch (error) {
		console.error(error);
	}
}