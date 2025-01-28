import { Response } from 'express';
import jwt from 'jsonwebtoken';

import { dbPool } from '../../db/connection';

export const createTokens = async (userId: string) => {
	const ACCESS_SECRET = process.env.ACCESS_SECRET as string;
	const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
	const MAX_TOKENS = 1;

	const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' });
	const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });

	const client = await dbPool.connect();

	try {
		// Получаем все активные токены пользователя
		const query = 'SELECT id FROM refresh_tokens WHERE user_id = $1 ORDER BY created_at ASC';
		const result = await client.query(query, [userId]);

		if (result.rows.length >= MAX_TOKENS) {
			// Удаляем самый старый токен
			const oldestTokenId = result.rows[0].id;
			await client.query('DELETE FROM refresh_tokens WHERE id = $1', [oldestTokenId]);
		}

		// Сохраняем новый Refresh токен в базе данных
		const insertQuery = 'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)';
		await client.query(insertQuery, [userId, refreshToken]);

		return { accessToken, refreshToken };
	} finally {
		client.release();
	}
};

interface IAuthController {
	httpOnly?: boolean;
	secure?: boolean;
	sameSite?: 'strict';
	maxAge?: number;
};

export const saveInCookies = (res: Response, title: string, value: string, params: IAuthController) => {
	res.cookie(title, value, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production', // HTTPS only
		sameSite: 'strict',
		...params,
	});
};
