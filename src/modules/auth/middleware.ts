import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const checkEmailAndPassword = (req: Request, res: Response, next: NextFunction) => {
	const { email, password } = req.body;

	if (!email || !password) {
		res.status(400).json({ message: 'Email and password are required' });

		return;
	}

	if (!new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email)) {
		res.status(400).json({ message: 'Invalid email format' });

		return;
	}

	next();
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.accessToken;

	if (!token) {
		res.status(401).json({ message: 'Access token required' });

		return;
	}

	try {
		const ACCESS_SECRET = process.env.ACCESS_SECRET as string;
		const payload = jwt.verify(token, ACCESS_SECRET) as { userId: string };

		(req as any).user = payload;

		next();
	} catch (error) {
		res.status(403).json({ message: 'Invalid or expired token' });
	}
};
