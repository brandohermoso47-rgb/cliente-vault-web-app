import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import type { AddressInfo } from 'node:net';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { schema, type Db } from '../src/db/index.js';
import { MIGRATIONS_DIR } from '../src/db/migrate.js';

// Token falso: "tok:<uid>:<email>:<verificado>". Sustituye a Firebase Auth en las pruebas.
export const tok = (uid: string, email = `${uid}@example.com`, verified = true) => `tok:${uid}:${email}:${verified}`;

export async function makeTestApp(env: Record<string, string> = {}) {
  const client = new PGlite();
  const db = drizzle(client, { schema }) as unknown as Db;
  await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_DIR });

  const synced: Array<[string, string]> = [];
  const verifyChecks: boolean[] = []; // por cada verificación de token: ¿se pidió comprobar revocación?
  const stripeCalls: Record<string, any[]> = { checkout: [], portal: [], accounts: [], links: [], customers: [] };
  const stripe: any = {
    // El primer cliente es cus_test1; los siguientes son distintos (Stripe nunca repite IDs).
    customers: { create: async (p: any) => { stripeCalls.customers.push(p); return { id: stripeCalls.customers.length === 1 ? 'cus_test1' : `cus_test${stripeCalls.customers.length}` }; } },
    checkout: { sessions: { create: async (p: any) => { stripeCalls.checkout.push(p); return { url: 'https://checkout.stripe.test/s1' }; } } },
    billingPortal: { sessions: { create: async (p: any) => { stripeCalls.portal.push(p); return { url: 'https://billing.stripe.test/p1' }; } } },
    accounts: { create: async (p: any) => { stripeCalls.accounts.push(p); return { id: 'acct_test1' }; } },
    accountLinks: { create: async (p: any) => { stripeCalls.links.push(p); return { url: 'https://connect.stripe.test/l1' }; } },
    webhooks: {
      // La "firma" válida es la cadena "good"; el cuerpo es el evento en JSON.
      constructEvent: (body: Buffer, sig: string) => { if (sig !== 'good') throw new Error('bad signature'); return JSON.parse(body.toString()); },
    },
  };

  const config = loadConfig({ STRIPE_WEBHOOK_SECRET: 'whsec_test', APP_URL: 'https://app.test', ...env } as NodeJS.ProcessEnv);
  const app = createApp({
    db, config, stripe,
    verify: async (t, opts) => {
      verifyChecks.push(opts?.checkRevoked === true);
      const m = /^tok:([^:]+):([^:]*):(true|false)$/.exec(t);
      if (!m) throw new Error('invalid');
      return { uid: m[1], email: m[2] || undefined, emailVerified: m[3] === 'true', name: m[1] };
    },
    syncRole: async (uid, role) => { synced.push([uid, role]); },
    verifyAppCheck: async (token) => { if (token !== 'appcheck-ok') throw new Error('bad app check'); },
  });
  const server = app.listen(0);
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  async function call(method: string, path: string, opts: { token?: string; body?: unknown; headers?: Record<string, string | null>; raw?: string } = {}) {
    // Por defecto la petición "viene de la app" (origen permitido). Pasa { origin: null } para quitarlo.
    const merged: Record<string, string | null> = { 'content-type': 'application/json', origin: 'https://waack-on.com', ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers };
    const headers = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== null)) as Record<string, string>;
    const res = await fetch(base + path, {
      method,
      headers,
      body: opts.raw ?? (opts.body === undefined ? undefined : JSON.stringify(opts.body)),
    });
    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { /* sin cuerpo JSON */ }
    return { status: res.status, json };
  }

  return { db, base, call, synced, stripeCalls, verifyChecks, close: async () => { server.close(); await client.close(); } };
}
