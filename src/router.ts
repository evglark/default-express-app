import express from 'express';

import { authRouter } from './modules/auth/router';

export const router = express.Router()
  .use(authRouter);
