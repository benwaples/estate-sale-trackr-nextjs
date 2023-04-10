import pg from "../utils/pg";

export default class Sale {
	id: number;
	sale_id: number;
	address: string;

	constructor(row: Sale) {
		this.id = row.id;
		this.sale_id = row.sale_id;
		this.address = row.address;
	}

	static async addSale(saleId: number, address: string) {
		const { rows } = await pg.query<Sale>(`
		INSERT INTO sales (sale_id, address) VALUES ($1, $2) RETURNING *
		`, [saleId, address]);


		const sale = rows[0];
		if (!sale) throw new Error('unable to create sale');

		return new Sale(sale);
	}

	static async findSaleById(saleId: number) {
		const { rows } = await pg.query<Sale>(`
		SELECT * FROM sales WHERE sale_id = $1;
		`, [saleId])

		if (!rows[0]) return null;
		return new Sale(rows[0]);
	}

	static async findSalesByIDList(saleIdList: number[]) {
		const { rows } = await pg.query<Sale>(`
		SELECT * FROM sales where sale_id = ANY($1)
		`, [saleIdList])

		if (!rows.length) return [];
		return rows.map(row => new Sale(row))
	}
}