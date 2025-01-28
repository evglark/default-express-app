import { dbPool } from '../../db/connection';

export const UsersRepository = {
	async findByEmail(email: string) {
		const client = await dbPool.connect();

		try {
			const userQuery = 'SELECT id, password_hash FROM users WHERE email = $1';
			const result = await client.query(userQuery, [email]);

			return result.rows[0];
		} finally {
			client.release();
		}
	},

	async create(email: string, passwordHash: string) {
		const client = await dbPool.connect();

		try {
			const insertQuery = 'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id';
			const result = await client.query(insertQuery, [email, passwordHash]);

			return result.rows[0];
		} finally {
			client.release();
		}
	},

	async exists(email: string) {
		const client = await dbPool.connect();

		try {
			const userCheckQuery = 'SELECT id FROM users WHERE email = $1';
			const result = await client.query(userCheckQuery, [email]);

			return result.rows.length > 0;
		} finally {
			client.release();
		}
	}
};