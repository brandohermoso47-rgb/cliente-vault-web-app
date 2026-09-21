import { drizzle } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import pg from 'pg';
import type { Config } from '../config.js';
import * as schema from './schema.js';

export { schema };
// Tipo común: sirve para node-postgres (producción) y PGlite (pruebas).
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export function createPool(cfg: Config): pg.Pool {
  if (cfg.DATABASE_URL) return new pg.Pool({ connectionString: cfg.DATABASE_URL, max: 10 });
  if (cfg.DB_HOST) {
    // IP privada dentro de la VPC: el tráfico va cifrado (TLS) y no sale a Internet.
    return new pg.Pool({ host: cfg.DB_HOST, port: cfg.DB_PORT, user: cfg.DB_USER, password: cfg.DB_PASSWORD, database: cfg.DB_NAME, max: 10, ssl: { rejectUnauthorized: false } });
  }
  if (cfg.INSTANCE_CONNECTION_NAME) {
    // Cloud Run + Cloud SQL: socket unix montado en /cloudsql
    return new pg.Pool({
      host: `/cloudsql/${cfg.INSTANCE_CONNECTION_NAME}`,
      user: cfg.DB_USER,
      password: cfg.DB_PASSWORD,
      database: cfg.DB_NAME,
      max: 10,
    });
  }
  throw new Error('Configura DATABASE_URL, DB_HOST o INSTANCE_CONNECTION_NAME (+ DB_USER, DB_PASSWORD, DB_NAME).');
}

export function createDb(pool: pg.Pool): Db {
  return drizzle(pool, { schema });
}
