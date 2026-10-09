import { sql } from 'drizzle-orm';
import { dbClient as db } from './client.js';

const statements = [
  `DO $$ BEGIN CREATE TYPE user_role AS ENUM ('user', 'superadmin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  `ALTER TABLE users ADD COLUMN IF NOT EXISTS weekdaydate text`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date date`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS blessing text`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS picture text`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id varchar(255)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true`,

  `ALTER TABLE temples DROP COLUMN IF EXISTS open_time`,
  `ALTER TABLE temples DROP COLUMN IF EXISTS close_time`,
  `ALTER TABLE temples ADD COLUMN open_time time`,
  `ALTER TABLE temples ADD COLUMN close_time time`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id serial PRIMARY KEY,
    actor_id integer REFERENCES users(id) ON DELETE SET NULL,
    action varchar(100) NOT NULL,
    target_type varchar(50),
    target_id integer,
    details jsonb,
    ip varchar(50),
    created_at timestamp NOT NULL DEFAULT now()
  )`,
];

async function main() {
  for (const s of statements) {
    try {
      await db.execute(sql.raw(s));
      console.log('✅', s.split('\n')[0].slice(0, 80));
    } catch (e: any) {
      console.error('❌', s.split('\n')[0].slice(0, 80));
      console.error('   ', e?.cause?.message ?? e?.message ?? e);
    }
  }
  process.exit(0);
}

main();