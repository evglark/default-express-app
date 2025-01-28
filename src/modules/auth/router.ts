import { Router } from 'express';
import { Request, Response } from 'express';

import { authController } from './controller';
import { checkEmailAndPassword, authenticateToken } from './middleware';

export const authRouter = Router()
	.post('/register', checkEmailAndPassword, authController.register)
	.post('/login', checkEmailAndPassword, authController.login)
  .post('/refresh', authController.refresh)
	.get('/getUser', authenticateToken, (req: Request, res: Response) => {
		res.status(200).json({ message: 'Token is valid', user: (req as any).user });
	});
