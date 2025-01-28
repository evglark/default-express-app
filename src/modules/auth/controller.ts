import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { dbPool } from '../../db/connection';
import { UsersRepository } from './repository';
import { createTokens, saveInCookies } from './utils';

const AuthController = () => {
	const register = async (req: Request, res: Response) => {
		const { email, password } = req.body;

		try {
			const userExists = await UsersRepository.exists(email);

			if (userExists) {
				res.status(409).json({ message: 'User already exists' });
				return;
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			const user = await UsersRepository.create(email, hashedPassword);
			const { accessToken, refreshToken } = await createTokens(user.id);

			saveInCookies(res, 'accessToken', accessToken, { maxAge: 15 * 60 * 1000 });
			saveInCookies(res, 'refreshToken', refreshToken, { maxAge: 7 * 24 * 60 * 60 * 1000 });

			res.status(201).json({ accessToken, message: 'User registered successfully' });
		} catch (error) {
			console.error('Registration error:', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	};

	const login = async (req: Request, res: Response) => {
		const { email, password } = req.body;

		try {
			const user = await UsersRepository.findByEmail(email);

			if (!user) {
				res.status(401).json({ message: 'Invalid email or password' });
				return;
			}

			const isValidPassword = await bcrypt.compare(password, user.password_hash);

			if (!isValidPassword) {
				res.status(401).json({ message: 'Invalid email or password' });
				return;
			}

			const { accessToken, refreshToken } = await createTokens(user.id);

			saveInCookies(res, 'accessToken', accessToken, { maxAge: 15 * 60 * 1000 });
			saveInCookies(res, 'refreshToken', refreshToken, { maxAge: 7 * 24 * 60 * 60 * 1000 });

			res.status(200).json({ accessToken, message: 'Login successful' });
		} catch (error) {
			console.error('Login error:', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	};

	const refresh = async (req: Request, res: Response) => {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			res.status(401).json({ message: 'Refresh token required' });
			return;
		}

		try {
			const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
			const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { userId: string };
	
			// Проверяем, существует ли токен в базе данных
			const client = await dbPool.connect();
			const query = 'SELECT id FROM refresh_tokens WHERE token = $1 AND user_id = $2';
			const result = await client.query(query, [refreshToken, payload.userId]);
			client.release();

			if (result.rows.length === 0) {
				res.status(403).json({ message: 'Invalid or expired refresh token' });
				return;
			}

			// Генерируем новый Access токен
			const { accessToken: newAccessToken } = await createTokens(payload.userId);

			saveInCookies(res, 'accessToken', newAccessToken, { maxAge: 15 * 60 * 1000 });
	
			res.status(200).json({ accessToken: newAccessToken });
		} catch (error) {
			console.error('Refresh token error:', error);
			res.status(403).json({ message: 'Invalid or expired refresh token' });
		}
};

	return ({
		register,
		login,
		refresh,
	});
};

export const authController = AuthController();
