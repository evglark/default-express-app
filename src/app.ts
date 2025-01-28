import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { router } from './router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.get('/', (req, res) => {
	res.json({ message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄' });
});

app.use('/api', router);

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
