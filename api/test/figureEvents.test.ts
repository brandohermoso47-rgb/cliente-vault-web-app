import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { withContext } from '../src/db/context.js';
import { schema } from '../src/db/index.js';
import { makeTestApp, tok } from './helpers.js';

const { users, figureEvents } = schema;
let t: Awaited<ReturnType<typeof makeTestApp>>;
const ids: Record<string, string> = {};

// En helpers.ts una clase es "propia" si su ID empieza por "<uid>_".
const url = (classId: string) => `/api/v1/classes/${classId}/figure-events`;
const line = (startMs: number, endMs: number) => ({
  type: 'arm_line', side: 'L', startMs, endMs, editedManually: false,
  params: { keyframes: [{ t: startMs, pts: { sh: { x: 0.4, y: 0.3 }, wr: { x: 0.2, y: 0.3 } } }] },
});

beforeAll(async () => {
  t = await makeTestApp();
  for (const [name, role] of [['profe', 'instructor'], ['otra', 'instructor'], ['alumna', 'usuario']] as const) {
    const r = await t.call('POST', '/api/v1/session', { token: tok(name), body: { handle: name } });
    ids[name] = r.json.user.id;
    await withContext(t.db, { role: 'system' }, (db) => db.update(users).set({ role }).where(eq(users.id, ids[name])));
  }
});
afterAll(async () => { await t.close(); });

describe('rutas de eventos de figura', () => {
  it('PUT guarda y GET devuelve en orden', async () => {
    const put = await t.call('PUT', url('profe_c1'), { token: tok('profe'), body: { events: [line(2000, 2600), { ...line(100, 900), type: 'elbow_triangle', color: '#FFD400', params: { keyframes: [{ t: 100, pts: { sh: { x: 0.4, y: 0.3 }, el: { x: 0.3, y: 0.3 }, wr: { x: 0.3, y: 0.2 } } }] } }] } });
    expect(put.status).toBe(200);
    expect(put.json.events).toHaveLength(2);
    const get = await t.call('GET', url('profe_c1'), { token: tok('profe') });
    expect(get.status).toBe(200);
    expect(get.json.events.map((e: any) => [e.type, e.startMs])).toEqual([['elbow_triangle', 100], ['arm_line', 2000]]);
    expect(get.json.events[0]).toMatchObject({ color: '#FFD400', editedManually: false });
    expect(get.json.events[1].params.keyframes[0].pts.wr).toEqual({ x: 0.2, y: 0.3 });
  });

  it('PUT reemplaza la lista completa (borrar eventos funciona)', async () => {
    await t.call('PUT', url('profe_c1'), { token: tok('profe'), body: { events: [line(0, 500)] } });
    const get = await t.call('GET', url('profe_c1'), { token: tok('profe') });
    expect(get.json.events).toHaveLength(1);
    expect(get.json.events[0].startMs).toBe(0);
    await t.call('PUT', url('profe_c1'), { token: tok('profe'), body: { events: [] } });
    expect((await t.call('GET', url('profe_c1'), { token: tok('profe') })).json.events).toEqual([]);
  });

  it('no se puede escribir en una clase ajena (404) ni leer sus eventos', async () => {
    await t.call('PUT', url('profe_c2'), { token: tok('profe'), body: { events: [line(0, 500)] } });
    expect((await t.call('PUT', url('profe_c2'), { token: tok('otra'), body: { events: [] } })).status).toBe(404);
    expect((await t.call('GET', url('profe_c2'), { token: tok('otra') })).json.events).toEqual([]);
    expect((await t.call('GET', url('profe_c2'), { token: tok('profe') })).json.events).toHaveLength(1);
  });

  it('un alumno no puede guardar figuras (403)', async () => {
    expect((await t.call('PUT', url('alumna_c1'), { token: tok('alumna'), body: { events: [] } })).status).toBe(403);
  });

  it('rechaza datos inválidos (400)', async () => {
    const bad = [
      { events: [{ ...line(500, 400) }] },
      { events: [{ ...line(0, 400), type: 'filtro_generico' }] },
      { events: [{ ...line(0, 400), params: { keyframes: [] } }] },
      { events: [{ ...line(0, 400), color: 'red' }] },
      { nope: true },
      // Cada efecto exige los puntos que su dibujo necesita.
      { events: [{ ...line(0, 400), params: { keyframes: [{ t: 0, pts: {} }] } }] },
      { events: [{ ...line(0, 400), type: 'elbow_triangle' }] },
      { events: [{ ...line(0, 400), type: 'rotation_arc', params: { keyframes: [{ t: 0, pts: { c: { x: 0.4, y: 0.3 }, w: { x: 0.2, y: 0.3 } } }] } }] },
      { events: [{ ...line(0, 400), params: { keyframes: [line(0, 400).params.keyframes[0], { ...line(0, 400).params.keyframes[0], t: 0 }] } }] },
      { events: [{ ...line(0, 400), params: { keyframes: [{ ...line(0, 400).params.keyframes[0], t: 200 }, { ...line(0, 400).params.keyframes[0], t: 100 }] } }] },
      { events: [{ ...line(0, 400), params: { keyframes: [line(0, 400).params.keyframes[0], { ...line(0, 400).params.keyframes[0], t: 401 }] } }] },
      { events: [{ ...line(100, 400), params: { keyframes: [{ ...line(100, 400).params.keyframes[0], t: 99 }] } }] },
      { events: [{ ...line(0, 400), params: { keyframes: [line(0, 400).params.keyframes[0], { ...line(0, 400).params.keyframes[0], t: -1 }] } }] },
    ];
    for (const body of bad) expect((await t.call('PUT', url('profe_c3'), { token: tok('profe'), body })).status).toBe(400);
    expect((await t.call('PUT', '/api/v1/classes/..%2Fx/figure-events', { token: tok('profe'), body: { events: [] } })).status).toBe(400);
  });

  it('acepta cuerpos de más de 100 kb (video largo)', async () => {
    const keyframes = Array.from({ length: 3000 }, (_, i) => ({ t: i * 100, pts: { sh: { x: 0.4123, y: 0.3123 }, wr: { x: 0.2123, y: 0.3123 } } }));
    const r = await t.call('PUT', url('profe_c4'), { token: tok('profe'), body: { events: [{ ...line(0, 300000), params: { keyframes } }] } });
    expect(r.status).toBe(200);
  });

  it('sin sesión → 401, también con un cuerpo grande (no se parsea antes de autenticar)', async () => {
    expect((await t.call('GET', url('profe_c1'))).status).toBe(401);
    const big = JSON.stringify({ events: [{ ...line(0, 300000), params: { keyframes: Array.from({ length: 3000 }, (_, i) => ({ t: i, pts: { sh: { x: 0.4, y: 0.3 }, wr: { x: 0.2, y: 0.3 } } })) } }] });
    expect(big.length).toBeGreaterThan(100 * 1024);
    expect((await t.call('PUT', url('profe_c1'), { raw: big })).status).toBe(401);
  });

  it('el resto de rutas sigue limitado a 100 kb', async () => {
    const r = await t.call('PATCH', '/api/v1/me', { token: tok('profe'), raw: JSON.stringify({ bio: 'x'.repeat(120 * 1024) }) });
    expect(r.status).toBe(413);
  });
});

describe('RLS de figure_events', () => {
  it('cada instructor ve solo sus filas, incluso sin WHERE', async () => {
    await t.call('PUT', url('profe_c5'), { token: tok('profe'), body: { events: [line(0, 500)] } });
    await t.call('PUT', url('otra_c1'), { token: tok('otra'), body: { events: [line(0, 500)] } });
    const mine = await withContext(t.db, { role: 'user', userId: ids.otra }, (db) => db.select().from(figureEvents));
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((r) => r.createdBy === ids.otra)).toBe(true);
  });

  it('no puede insertar filas a nombre de otra persona', async () => {
    const err = await withContext(t.db, { role: 'user', userId: ids.otra }, (db) =>
      db.insert(figureEvents).values({ classId: 'x', effectType: 'arm_line', startMs: 0, endMs: 10, params: { keyframes: [] }, createdBy: ids.profe }),
    ).then(() => null, (e) => e);
    expect(err).not.toBeNull();
  });

  it('sin contexto no se ve nada', async () => {
    const rows = await t.db.transaction(async (tx) => {
      await tx.execute(sql.raw('SET LOCAL ROLE waackon_rt'));
      return tx.select().from(figureEvents);
    });
    expect(rows).toEqual([]);
  });
});
