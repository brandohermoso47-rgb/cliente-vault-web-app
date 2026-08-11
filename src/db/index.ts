import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

let poolInstance: Pool | null = null;
let dbInstance: any = null;

export function getPool(): Pool | null {
  if (!process.env.SQL_HOST) {
    return null;
  }
  if (!poolInstance) {
    poolInstance = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    poolInstance.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return poolInstance;
}

export function getDb() {
  if (!dbInstance) {
    const pool = getPool();
    if (pool) {
      dbInstance = drizzle(pool, { schema });
    }
  }
  return dbInstance;
}

export const db = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getDb();
    if (!instance) {
      throw new Error('PostgreSQL database is not configured (SQL_HOST missing).');
    }
    return instance[prop];
  }
});

