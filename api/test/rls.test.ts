import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { assertRlsEverywhere, elevate, RUNTIME_ROLE, withContext, type Ctx } from '../src/db/context.js';
import { schema, type Db } from '../src/db/index.js';
import { makeTestApp } from './helpers.js';

const { users, applications, subscriptions, payments, payoutAccounts, stripeCustomers, plans, stripeEvents } = schema;

let t: Awaited<ReturnType<typeof makeTestApp>>;
let db: Db;
const id: Record<string, string> = {};

const as = <T>(ctx: Ctx, fn: (tx: Db) => Promise<T>) => withContext(db, ctx, fn);
const asUser = (name: string) => ({ role: 'user', userId: id[name] }) as Ctx;
const ADMIN: Ctx = { role: 'admin', userId: '' };
const SYSTEM: Ctx = { role: 'system' };
const code = async (fn: () => Promise<unknown>) => { try { await fn(); return null; } catch (e: any) { return e?.cause?.code ?? e?.code ?? 'error'; } };

beforeAll(async () => {
  t = await makeTestApp();
  db = t.db;
  // Datos de partida con el usuario "postgres" de PGlite (superusuario: no le afecta RLS), como haría una migración o un administrador de la base.
  const mk = async (name: string, role: 'usuario' | 'instructor' | 'estudio' | 'admin' = 'usuario') => {
    const [u] = await db.insert(users).values({ firebaseUid: name, email: `${name}@x.com`, handle: name, role }).returning();
    id[name] = u.id;
  };
  await mk('alice'); await mk('bob'); await mk('carol', 'instructor'); await mk('boss', 'admin');
  ADMIN.userId = id.boss;
  await db.insert(plans).values({ id: 'escuela', kind: 'platform', name: 'Escuela', active: true, prices: { month: 'price_1' } });
  for (const n of ['alice', 'bob']) {
    await db.insert(applications).values({ userId: id[n], kind: 'instructor', orgName: n, contactName: n, countryCode: 'ES', city: 'Madrid', styles: 'Waacking', about: 'x'.repeat(30) });
    await db.insert(stripeCustomers).values({ userId: id[n], stripeCustomerId: 'cus_' + n });
    await db.insert(payoutAccounts).values({ userId: id[n], stripeAccountId: 'acct_' + n });
    const [s] = await db.insert(subscriptions).values({ stripeSubscriptionId: 'sub_' + n, userId: id[n], planId: 'escuela', status: 'active' }).returning();
    await db.insert(payments).values({ stripeInvoiceId: 'in_' + n, userId: id[n], subscriptionId: s.id, amount: 1000, currency: 'EUR', status: 'paid' });
  }
  await db.insert(stripeEvents).values({ id: 'evt_1', type: 'x' });
});
afterAll(async () => { await t.close(); });

describe('RLS está activo en todas las tablas', () => {
  it('todas las tablas del esquema público tienen RLS activo y forzado', async () => { await expect(assertRlsEverywhere(db)).resolves.toBeUndefined(); });
  it('el rol de las peticiones no es superusuario ni se salta RLS', async () => {
    const r: any = await db.execute(sql`SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = ${RUNTIME_ROLE}`);
    expect(r.rows[0]).toEqual({ rolsuper: false, rolbypassrls: false });
  });
});

describe('cada persona ve solo lo suyo', () => {
  it('un usuario ve solo su fila en cada tabla (y el catálogo de planes completo)', async () => {
    const seen = await as(asUser('alice'), async (tx) => ({
      users: await tx.select().from(users),
      applications: await tx.select().from(applications),
      subscriptions: await tx.select().from(subscriptions),
      payments: await tx.select().from(payments),
      payouts: await tx.select().from(payoutAccounts),
      customers: await tx.select().from(stripeCustomers),
      plans: await tx.select().from(plans),
      events: await tx.select().from(stripeEvents),
    }));
    expect(seen.users.map((u) => u.firebaseUid)).toEqual(['alice']);
    expect(seen.applications.map((a) => a.orgName)).toEqual(['alice']);
    expect(seen.subscriptions.map((s) => s.stripeSubscriptionId)).toEqual(['sub_alice']);
    expect(seen.payments.map((p) => p.stripeInvoiceId)).toEqual(['in_alice']);
    expect(seen.payouts.map((p) => p.stripeAccountId)).toEqual(['acct_alice']);
    expect(seen.customers.map((c) => c.stripeCustomerId)).toEqual(['cus_alice']);
    expect(seen.plans).toHaveLength(1);
    expect(seen.events).toHaveLength(0); // eventos de Stripe: solo el sistema
  });

  it('una consulta SIN filtro (el error clásico "se olvidó el WHERE") sigue devolviendo solo lo propio', async () => {
    const all = await as(asUser('bob'), (tx) => tx.select().from(users));
    expect(all).toHaveLength(1);
    expect(all[0].firebaseUid).toBe('bob');
  });

  it('pedir explícitamente la fila de otra persona devuelve vacío', async () => {
    expect(await as(asUser('alice'), (tx) => tx.select().from(users).where(eq(users.id, id.bob)))).toEqual([]);
    expect(await as(asUser('alice'), (tx) => tx.select().from(payments).where(eq(payments.userId, id.bob)))).toEqual([]);
    expect(await as(asUser('alice'), (tx) => tx.select().from(subscriptions).where(eq(subscriptions.userId, id.bob)))).toEqual([]);
  });

  it('un instructor también ve solo lo suyo (RLS es para todos)', async () => {
    const me = await as(asUser('carol'), (tx) => tx.select().from(users));
    expect(me.map((u) => u.firebaseUid)).toEqual(['carol']);
  });

  it('el administrador gestiona usuarios, solicitudes y planes, pero NO ve el dinero de otras personas', async () => {
    const seen = await as(ADMIN, async (tx) => ({
      users: await tx.select().from(users),
      applications: await tx.select().from(applications),
      plans: await tx.select().from(plans),
      subscriptions: await tx.select().from(subscriptions),
      payments: await tx.select().from(payments),
      payouts: await tx.select().from(payoutAccounts),
      customers: await tx.select().from(stripeCustomers),
      events: await tx.select().from(stripeEvents),
    }));
    expect(seen.users).toHaveLength(4);
    expect(seen.applications).toHaveLength(2);
    expect(seen.plans).toHaveLength(1);
    expect(seen.subscriptions).toHaveLength(0);
    expect(seen.payments).toHaveLength(0);
    expect(seen.payouts).toHaveLength(0);
    expect(seen.customers).toHaveLength(0);
    expect(seen.events).toHaveLength(0);
  });

  it("el contexto 'system' (webhook, inicio de sesión) ve todo", async () => {
    const seen = await as(SYSTEM, async (tx) => ({ s: await tx.select().from(subscriptions), p: await tx.select().from(payments), e: await tx.select().from(stripeEvents) }));
    expect([seen.s.length, seen.p.length, seen.e.length]).toEqual([2, 2, 1]);
  });

  it('SIN contexto no se ve nada (falla cerrado)', async () => {
    const rows = await db.transaction(async (tx) => {
      await tx.execute(sql.raw(`SET LOCAL ROLE ${RUNTIME_ROLE}`));
      return { u: await tx.select().from(users), pay: await tx.select().from(payments), pl: await tx.select().from(plans) };
    });
    expect(rows.u).toHaveLength(0);
    expect(rows.pay).toHaveLength(0);
    expect(rows.pl).toHaveLength(1); // el catálogo de planes es público por diseño
  });

  it('el contexto no se filtra a la siguiente petición', async () => {
    await as(asUser('alice'), async (tx) => tx.select().from(users));
    const r: any = await db.execute(sql`SELECT current_setting('app.user_id', true) AS u, current_setting('app.role', true) AS r, current_user AS who`);
    expect(r.rows[0].u || '').toBe('');
    expect(r.rows[0].r || '').toBe('');
    expect(r.rows[0].who).not.toBe(RUNTIME_ROLE);
  });
});

describe('cada persona solo modifica lo suyo', () => {
  it('puede editar su fila pero no la de otra persona (0 filas afectadas)', async () => {
    const own = await as(asUser('alice'), (tx) => tx.update(users).set({ bio: 'hola' }).where(eq(users.id, id.alice)).returning());
    expect(own).toHaveLength(1);
    const other = await as(asUser('alice'), (tx) => tx.update(users).set({ bio: 'hackeado' }).where(eq(users.id, id.bob)).returning());
    expect(other).toHaveLength(0);
    const [bob] = await db.select().from(users).where(eq(users.id, id.bob));
    expect(bob.bio).toBeNull();
  });

  it('un UPDATE sin WHERE solo alcanza su propia fila', async () => {
    await as(asUser('bob'), (tx) => tx.update(users).set({ country: 'x' } as never).where(sql`true`).returning().catch(() => []));
    const rows = await db.select().from(users);
    expect(rows.filter((u) => u.bio === 'zzz')).toHaveLength(0);
    const changed = await as(asUser('bob'), (tx) => tx.update(users).set({ bio: 'zzz' }).where(sql`true`).returning());
    expect(changed).toHaveLength(1);
    expect(changed[0].id).toBe(id.bob);
    await db.update(users).set({ bio: null }).where(eq(users.id, id.bob));
  });

  it('NO puede cambiarse el rol (disparador) ni siquiera en su propia fila', async () => {
    expect(await code(() => as(asUser('alice'), (tx) => tx.update(users).set({ role: 'admin' }).where(eq(users.id, id.alice))))).toBe('42501');
    expect(await code(() => as(asUser('carol'), (tx) => tx.update(users).set({ role: 'admin' }).where(eq(users.id, id.carol))))).toBe('42501');
    const [a] = await db.select().from(users).where(eq(users.id, id.alice));
    expect(a.role).toBe('usuario');
  });

  it('NO puede cambiar su identidad ni "mover" su fila a otro id', async () => {
    expect(await code(() => as(asUser('alice'), (tx) => tx.update(users).set({ firebaseUid: 'boss' }).where(eq(users.id, id.alice))))).toBe('42501');
    expect(await code(() => as(asUser('alice'), (tx) => tx.update(users).set({ id: id.bob }).where(eq(users.id, id.alice))))).toBeTruthy();
  });

  it('el administrador SÍ puede cambiar roles', async () => {
    const r = await as(ADMIN, (tx) => tx.update(users).set({ role: 'estudio' }).where(eq(users.id, id.bob)).returning());
    expect(r[0].role).toBe('estudio');
    // Ni con acceso directo a la base se cambia un rol sin declarar contexto (disparador): la limpieza también lo declara.
    expect(await code(() => db.update(users).set({ role: 'usuario' }).where(eq(users.id, id.bob)))).toBe('42501');
    await as(SYSTEM, (tx) => tx.update(users).set({ role: 'usuario' }).where(eq(users.id, id.bob)));
  });

  it('nadie crea usuarios salvo el sistema; nadie borra usuarios salvo el admin', async () => {
    expect(await code(() => as(asUser('alice'), (tx) => tx.insert(users).values({ firebaseUid: 'nuevo' })))).toBe('42501');
    expect(await code(() => as(ADMIN, (tx) => tx.insert(users).values({ firebaseUid: 'nuevo' })))).toBe('42501');
    expect(await as(asUser('alice'), (tx) => tx.delete(users).where(eq(users.id, id.alice)).returning())).toHaveLength(0);
    expect(await as(asUser('alice'), (tx) => tx.delete(users).where(eq(users.id, id.bob)).returning())).toHaveLength(0);
    expect(await db.select().from(users)).toHaveLength(4);
  });

  it('solicitudes: solo propias, siempre "pendiente", y solo el admin las resuelve', async () => {
    const base = { kind: 'estudio' as const, orgName: 'X', contactName: 'X', countryCode: 'ES', city: 'M', styles: 'W', about: 'x'.repeat(30) };
    await db.delete(applications).where(eq(applications.userId, id.alice));
    expect(await as(asUser('alice'), (tx) => tx.insert(applications).values({ ...base, userId: id.alice }).returning())).toHaveLength(1);
    await db.delete(applications).where(eq(applications.userId, id.alice));
    expect(await code(() => as(asUser('alice'), (tx) => tx.insert(applications).values({ ...base, userId: id.bob })))).toBe('42501'); // a nombre de otra persona
    expect(await code(() => as(asUser('alice'), (tx) => tx.insert(applications).values({ ...base, userId: id.alice, status: 'aprobada' })))).toBe('42501'); // auto-aprobada
    await db.insert(applications).values({ ...base, userId: id.alice });
    expect(await as(asUser('alice'), (tx) => tx.update(applications).set({ status: 'aprobada' }).where(eq(applications.userId, id.alice)).returning())).toHaveLength(0);
    expect(await as(ADMIN, (tx) => tx.update(applications).set({ status: 'aprobada', reviewedBy: id.boss }).where(eq(applications.userId, id.alice)).returning())).toHaveLength(1);
  });

  it('dinero: nadie (ni admin) escribe suscripciones, pagos ni cuentas de cobro ajenas; el sistema sí', async () => {
    for (const ctx of [asUser('alice'), ADMIN]) {
      expect(await code(() => as(ctx, (tx) => tx.insert(subscriptions).values({ stripeSubscriptionId: 'sub_fake', userId: id.alice, status: 'active' })))).toBe('42501');
      expect(await code(() => as(ctx, (tx) => tx.insert(payments).values({ stripeInvoiceId: 'in_fake', userId: id.alice, amount: 1, currency: 'EUR', status: 'paid' })))).toBe('42501');
    }
    expect(await as(asUser('alice'), (tx) => tx.update(subscriptions).set({ status: 'canceled' }).where(eq(subscriptions.userId, id.alice)).returning())).toHaveLength(0);
    expect(await as(asUser('alice'), (tx) => tx.delete(payments).where(eq(payments.userId, id.alice)).returning())).toHaveLength(0);
    expect(await as(asUser('alice'), (tx) => tx.update(payoutAccounts).set({ chargesEnabled: true }).where(eq(payoutAccounts.userId, id.alice)).returning())).toHaveLength(0);
    expect(await as(SYSTEM, (tx) => tx.update(payoutAccounts).set({ chargesEnabled: true }).where(eq(payoutAccounts.userId, id.alice)).returning())).toHaveLength(1);
    await db.update(payoutAccounts).set({ chargesEnabled: false }).where(eq(payoutAccounts.userId, id.alice));
  });

  it('puede crear su propio cliente de Stripe, pero no el de otra persona', async () => {
    await db.delete(stripeCustomers).where(eq(stripeCustomers.userId, id.alice));
    expect(await as(asUser('alice'), (tx) => tx.insert(stripeCustomers).values({ userId: id.alice, stripeCustomerId: 'cus_a2' }).returning())).toHaveLength(1);
    expect(await code(() => as(asUser('alice'), (tx) => tx.insert(stripeCustomers).values({ userId: id.bob, stripeCustomerId: 'cus_b2' })))).toBe('42501');
  });

  it('planes: solo el admin escribe; eventos de Stripe: solo el sistema', async () => {
    const p = { id: 'catedra', kind: 'instructor' as const, name: 'C', active: false };
    expect(await code(() => as(asUser('alice'), (tx) => tx.insert(plans).values(p)))).toBe('42501');
    expect(await as(ADMIN, (tx) => tx.insert(plans).values(p).returning())).toHaveLength(1);
    expect(await as(asUser('alice'), (tx) => tx.update(plans).set({ active: true }).where(eq(plans.id, 'catedra')).returning())).toHaveLength(0);
    expect(await code(() => as(asUser('alice'), (tx) => tx.insert(stripeEvents).values({ id: 'evt_x', type: 'x' })))).toBe('42501');
    expect(await code(() => as(ADMIN, (tx) => tx.insert(stripeEvents).values({ id: 'evt_x', type: 'x' })))).toBe('42501');
    expect(await as(SYSTEM, (tx) => tx.insert(stripeEvents).values({ id: 'evt_y', type: 'x' }).returning())).toHaveLength(1);
  });
});

describe('excepciones controladas (elevate)', () => {
  it('permite leer una fila ajena solo dentro del tramo y luego vuelve al contexto normal', async () => {
    const r = await as(asUser('alice'), async (tx) => {
      const before = await tx.select().from(users);
      const inst = await elevate(tx, async () => (await tx.select().from(users).where(and(eq(users.id, id.carol))))[0]);
      const after = await tx.select().from(users);
      return { before: before.length, inst: inst?.firebaseUid, after: after.length };
    });
    expect(r).toEqual({ before: 1, inst: 'carol', after: 1 });
  });
  it('si el tramo falla, el contexto también se restaura', async () => {
    const r = await as(asUser('alice'), async (tx) => {
      await elevate(tx, async () => { throw new Error('boom'); }).catch(() => {});
      return tx.select().from(users);
    });
    expect(r).toHaveLength(1);
  });
});
