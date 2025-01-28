import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const POSTGRES_URI = process.env.POSTGRES_URI || '';

export const dbPool = new Pool({ connectionString: POSTGRES_URI });

dbPool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
});
