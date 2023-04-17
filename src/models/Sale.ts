import { FollowedSale, Status } from "@/types";
import pg from "../utils/pg";

export default class Sale {
	id: number;
	sale_id: number;
	address: string;
	user_given_name: string | null;

	constructor(row: Sale) {
		this.id = row.id;
		this.sale_id = row.sale_id;
		this.address = row.address;
		this.user_given_name = row.user_given_name;
	}

	static async followSale(followSale: FollowedSale) {
		const { sale_id, follower_email, user_given_name, address, start_date, end_date } = followSale;
		const { rows } = await pg.query<FollowedSale>(`
		INSERT INTO followed_sales (sale_id, follower_email, user_given_name, address, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
		`, [sale_id, follower_email, user_given_name, address, start_date, end_date]);


		const sale = rows[0];
		if (!sale) throw new Error('unable to create sale');

		return new Sale(sale);
	}

	static async unfollowSale(id: FollowedSale['id']) {
		const { rows } = await pg.query(`
		UPDATE followed_sales
		SET status = ${Status.inactive}
		WHERE sale = $1
		RETURNING *
		`, [id])

		if (!rows[0]) throw new Error('unable to unfollow sale');
	}
}