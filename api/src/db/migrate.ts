import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../config.js';
import { createPool } from './index.js';

export const MIGRATIONS_DIR = fileURLToPath(new URL('../../drizzle', import.meta.url));

export async function runMigrations(pool = createPool(loadConfig())) {
  await migrate(drizzle(pool), { migrationsFolder: MIGRATIONS_DIR });
}

// npm run db:migrate
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const pool = createPool(loadConfig());
  runMigrations(pool)
    .then(() => { console.log('Migraciones aplicadas.'); return pool.end(); })
    .catch((e) => { console.error(e); process.exit(1); });
}
