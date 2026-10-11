import dotenv from 'dotenv';
dotenv.config(); // 🟢 โหลด .env ก่อนใช้งาน process.env ทันที

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema.js';

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle database client', err);
});

// ทดสอบเชื่อมต่อเพื่อรักษารอบ Event Loop
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected successfully!'))
  .catch((err) => console.error('❌ Database connection error:', err.message));

export const dbClient = drizzle(pool, { schema, logger: true });