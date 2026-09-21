import { sql } from 'drizzle-orm';
import type { Db } from './index.js';

// Contexto de seguridad de cada petición para Row Level Security (ver drizzle/0002_row_level_security.sql).
//  - 'user'  : usuario, instructor o estudio → solo sus filas.
//  - 'admin' : además gestiona usuarios, solicitudes y planes (nunca ve el dinero de otras personas).
//  - 'system': código interno de confianza (inicio de sesión, webhook de Stripe).
export type Ctx = { role: 'user' | 'admin' | 'system'; userId?: string };

// Rol de PostgreSQL sin privilegios ni BYPASSRLS bajo el que corren TODAS las consultas de las peticiones.
export const RUNTIME_ROLE = 'waackon_rt';

// Una transacción por petición: SET LOCAL solo dura hasta el COMMIT/ROLLBACK, así que el contexto
// nunca se filtra a otra petición que reutilice la misma conexión del pool.
export async function withContext<T>(db: Db, ctx: Ctx, fn: (tx: Db) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql.raw(`SET LOCAL ROLE ${RUNTIME_ROLE}`));
    await tx.execute(sql`SELECT set_config('app.user_id', ${ctx.userId ?? ''}, true), set_config('app.role', ${ctx.role}, true)`);
    return fn(tx as unknown as Db);
  });
}

const rowsOf = (r: unknown) => ((r as { rows?: Array<Record<string, unknown>> }).rows ?? []);

// Ejecuta un tramo concreto como 'system' (p. ej. buscar al instructor al que alguien se suscribe) y
// vuelve al contexto anterior. Hay que usarlo lo justo: cada uso es una excepción a RLS.
export async function elevate<T>(db: Db, fn: () => Promise<T>): Promise<T> {
  const prev = String(rowsOf(await db.execute(sql`SELECT coalesce(current_setting('app.role', true), '') AS r`))[0]?.r ?? '');
  await db.execute(sql`SELECT set_config('app.role', 'system', true)`);
  try {
    return await fn();
  } finally {
    try { await db.execute(sql`SELECT set_config('app.role', ${prev}, true)`); } catch { /* transacción ya abortada: se descarta entera */ }
  }
}

// Falla al arrancar si alguna tabla del esquema público no tiene RLS activo y forzado
// (una tabla nueva sin políticas sería legible por el rol de las peticiones).
export async function assertRlsEverywhere(db: Db): Promise<void> {
  const rows = rowsOf(await db.execute(sql`
    SELECT c.relname AS name
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT (c.relrowsecurity AND c.relforcerowsecurity)`));
  if (rows.length) throw new Error('Tablas SIN Row Level Security activo: ' + rows.map((r) => r.name).join(', '));
}
