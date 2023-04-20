import { FollowedSale, Status } from "@/types";
import pg from "../utils/pg";

export default class Sale {
	id: number;
	sale_id: number;
	address: string;
	follower_email: string;
	start_time: number | null;
	end_time: number | null;
	user_given_name: string | null;

	constructor(row: Sale) {
		this.id = row.id;
		this.sale_id = row.sale_id;
		this.address = row.address;
		this.follower_email = row.follower_email;
		this.start_time = row.start_time ? Number(row.start_time) : null;
		this.end_time = row.end_time ? Number(row.end_time) : null;
		this.user_given_name = row.user_given_name;
	}

	static async followSale(followSale: FollowedSale) {
		const { sale_id, follower_email, user_given_name, address, start_time, end_time } = followSale;
		const { rows } = await pg.query<Sale>(`
		INSERT INTO 
		followed_sales (sale_id, follower_email, user_given_name, address, start_time, end_time) 
		VALUES ($1, $2, $3, $4, $5, $6) 
		-- forces unique email/sale_id
		ON CONFLICT (sale_id, follower_email) DO UPDATE SET status = ${Status.active}
		RETURNING *
		`, [sale_id, follower_email, user_given_name, address, start_time, end_time]);


		const sale = rows[0];
		if (!sale) throw new Error('unable to follow sale');

		return new Sale(sale);
	}

	static async unfollowSale(sale_id: FollowedSale['sale_id'], email: FollowedSale["follower_email"]) {
		const { rows } = await pg.query(`
		UPDATE followed_sales
		SET status = ${Status.inactive}
		WHERE sale_id = $1 
			AND follower_email = $2
		RETURNING *
		`, [sale_id, email]);

		if (!rows[0]) throw new Error('unable to unfollow sale');
	}

	static async bulkUpdateFollowedSales(followedSales: FollowedSale[]) {

		const getBulkValues = () => {
			let sanitizeTicker = 0;
			const values: (string | number)[] = [];

			const handleValue = (value?: number | string) => {
				if (!value) return;

				values.push(value);
				sanitizeTicker++;

				return `$${sanitizeTicker}`;
			};
			const query = followedSales.map(sale => {
				const stringToSanitize = [sale.sale_id, sale.address, sale.start_time, sale.end_time]
					.map(handleValue)
					.filter(el => !!el)
					.join(',');

				return `(${stringToSanitize})`;
			}).join(',');

			return { query, values };
		};

		const { query, values } = getBulkValues();

		const { rows } = await pg.query(`
			UPDATE followed_sales as fs 
			SET
				sale_id = CAST(fsu.sale_id AS int),
				address = fsu.address,
				start_time = CAST(fsu.start_time AS bigint),
				end_time = CAST(fsu.end_time AS bigint)
			FROM (VALUES
				${query} 
			) AS fsu(sale_id, address, start_time, end_time) 
			WHERE CAST(fsu.sale_id AS int) = CAST(fs.sale_id AS int)
			RETURNING fs.follower_email, fs.address
		`, values);

		return rows;
	}


	static async getAllFollowedSales(email: string) {
		const { rows } = await pg.query(`
			SELECT ARRAY(
				SELECT sale_id 
				FROM followed_sales 
				WHERE follower_email = $1 
					AND status = ${Status.active}
			) as sale_ids
		`, [email]);

		return rows[0]?.sale_ids ?? [];
	}

	static async followedSalesBySaleIds(saleIdList: number[]) {
		const { rows } = await pg.query<Sale>(`
		SELECT * 
		FROM followed_sales
		WHERE sale_id = ANY($1)
		AND status = ${Status.active}
		`, [saleIdList]);

		return rows.map(row => new Sale(row));
	}

	static async getAllFutureSalesFollowed() {
		const { rows } = await pg.query<Sale>(`
		SELECT * 
		FROM followed_sales
		WHERE 
			start_time IS NOT NULL 
			-- AND start_time > $1
		AND status = ${Status.active}
		`, []);

		return rows.map(row => new Sale(row));
	}
}