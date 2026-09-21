import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { schema } from '../src/db/index.js';
import { makeTestApp, tok } from './helpers.js';

type T = Awaited<ReturnType<typeof makeTestApp>>;
let t: T;
const ADMIN = () => tok('boss', 'boss@waack-on.com');
const APP = { kind: 'instructor', orgName: 'Lorena W', contactName: 'Lorena', countryCode: 'ES', city: 'Madrid', styles: 'Waacking', about: 'Instructora con muchos años de experiencia enseñando.' };

beforeAll(async () => {
  t = await makeTestApp({ BOOTSTRAP_ADMIN_EMAILS: 'boss@waack-on.com' });
  await t.call('POST', '/api/v1/session', { token: ADMIN() });
  await t.call('POST', '/api/v1/session', { token: tok('mallory') });
  await t.call('PUT', '/api/v1/admin/plans/escuela', { token: ADMIN(), body: { kind: 'platform', name: 'Escuela', active: true, prices: { month: 'price_m' } } });
});
afterAll(async () => { await t.close(); });

describe('cabeceras y CORS', () => {
  it('no anuncia el framework y añade cabeceras de seguridad', async () => {
    const res = await fetch(t.base + '/healthz');
    expect(res.headers.get('x-powered-by')).toBeNull();
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('strict-transport-security')).toMatch(/max-age=/);
    expect(res.headers.get('x-frame-options')).toBeTruthy();
  });

  it('un origen no permitido NO recibe cabeceras CORS', async () => {
    const res = await fetch(t.base + '/healthz', { headers: { origin: 'https://evil.example' } });
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('un origen permitido sí', async () => {
    const res = await fetch(t.base + '/healthz', { headers: { origin: 'https://waack-on.com' } });
    expect(res.headers.get('access-control-allow-origin')).toBe('https://waack-on.com');
  });
});

describe('entradas maliciosas', () => {
  it('JSON mal formado → 400 (no 500)', async () => {
    const r = await t.call('POST', '/api/v1/session', { token: tok('x1'), raw: '{"bad": ' });
    expect(r.status).toBe(400);
    expect(r.json.error).toBe('bad_request');
  });

  it('cuerpo demasiado grande → 413', async () => {
    const r = await t.call('POST', '/api/v1/session', { token: tok('x2'), raw: JSON.stringify({ displayName: 'a'.repeat(300_000) }) });
    expect(r.status).toBe(413);
  });

  it('intento de inyección SQL en filtros y campos se rechaza sin tocar la base', async () => {
    expect((await t.call('GET', "/api/v1/admin/applications?status=' OR 1=1--", { token: ADMIN() })).status).toBe(400);
    expect((await t.call('PATCH', '/api/v1/me', { token: tok('mallory'), body: { handle: "x'; DROP TABLE users;--" } })).status).toBe(400);
    expect((await t.db.select().from(schema.users)).length).toBeGreaterThan(0); // la tabla sigue ahí
  });

  it('un texto con HTML/script se guarda tal cual (no se ejecuta; React lo escapa al mostrarlo)', async () => {
    const r = await t.call('PATCH', '/api/v1/me', { token: tok('mallory'), body: { bio: '<script>alert(1)</script>' } });
    expect(r.status).toBe(200);
    expect(r.json.user.bio).toBe('<script>alert(1)</script>');
  });

  it('el ID de una ruta admin debe ser un UUID', async () => {
    expect((await t.call('POST', '/api/v1/admin/applications/no-es-uuid/decision', { token: ADMIN(), body: { decision: 'aprobada' } })).status).toBe(400);
    expect((await t.call('POST', '/api/v1/admin/users/1%20OR%201=1/role', { token: ADMIN(), body: { role: 'admin' } })).status).toBe(400);
  });

  it('el nombre de usuario se normaliza a minúsculas', async () => {
    const r = await t.call('PATCH', '/api/v1/me', { token: tok('mallory'), body: { handle: 'Mallory.W' } });
    expect(r.status).toBe(200);
    expect(r.json.user.handle).toBe('mallory.w');
  });
});

describe('asignación masiva y escalada de privilegios', () => {
  it('POST /session ignora campos como role o firebaseUid', async () => {
    const r = await t.call('POST', '/api/v1/session', { token: tok('eve'), body: { role: 'admin', firebaseUid: 'boss', email: 'boss@waack-on.com', id: '00000000-0000-4000-8000-000000000000' } });
    expect(r.status).toBe(201);
    expect(r.json.user.role).toBe('usuario');
    expect(r.json.user.email).toBe('eve@example.com'); // el correo sale del token, no del cuerpo
  });

  it('un usuario no puede aprobarse su propia solicitud ni cambiar roles', async () => {
    await t.call('POST', '/api/v1/applications', { token: tok('mallory'), body: APP });
    const mine = (await t.db.select().from(schema.applications))[0];
    expect((await t.call('POST', `/api/v1/admin/applications/${mine.id}/decision`, { token: tok('mallory'), body: { decision: 'aprobada' } })).status).toBe(403);
    const me = (await t.call('GET', '/api/v1/me', { token: tok('mallory') })).json.user;
    expect((await t.call('POST', `/api/v1/admin/users/${me.id}/role`, { token: tok('mallory'), body: { role: 'admin' } })).status).toBe(403);
    expect((await t.call('GET', '/api/v1/me', { token: tok('mallory') })).json.user.role).toBe('usuario');
  });

  it('cabeceras de autenticación raras → 401', async () => {
    for (const authorization of ['Basic abc', 'Bearer', 'Bearer ', 'bearer xyz', 'Token xyz']) {
      const r = await t.call('GET', '/api/v1/me', { headers: { authorization } });
      expect(r.status).toBe(401);
    }
  });

  it('un usuario solo ve sus propios datos (/me)', async () => {
    const eve = (await t.call('GET', '/api/v1/me', { token: tok('eve') })).json;
    expect(eve.user.email).toBe('eve@example.com');
    expect(eve.subscriptions).toEqual([]);
    expect(eve.application).toBeNull();
  });
});

describe('correo verificado en acciones sensibles', () => {
  const unverified = () => tok('newbie', 'newbie@example.com', false);
  it('puede iniciar sesión y editar su perfil, pero no pagar, pedir rol ni cobrar', async () => {
    expect((await t.call('POST', '/api/v1/session', { token: unverified() })).status).toBe(201);
    expect((await t.call('PATCH', '/api/v1/me', { token: unverified(), body: { bio: 'hola' } })).status).toBe(200);
    for (const [path, body] of [['/api/v1/billing/checkout', { planId: 'escuela', interval: 'month' }], ['/api/v1/applications', APP], ['/api/v1/connect/onboarding', {}]] as const) {
      const r = await t.call('POST', path, { token: unverified(), body });
      expect(r.status).toBe(403);
      expect(r.json.error).toBe('email_not_verified');
    }
  });
  it('con el correo verificado sí puede pagar', async () => {
    expect((await t.call('POST', '/api/v1/billing/checkout', { token: tok('eve'), body: { planId: 'escuela', interval: 'month' } })).status).toBe(200);
  });
});

describe('foto de perfil', () => {
  it('solo acepta URLs https de Firebase Storage o Google', async () => {
    for (const photoUrl of ['https://evil.example/x.png', 'http://firebasestorage.googleapis.com/x.png', 'javascript:alert(1)', 'https://firebasestorage.googleapis.com.evil.example/x.png']) {
      expect((await t.call('PATCH', '/api/v1/me', { token: tok('eve'), body: { photoUrl } })).status).toBe(400);
    }
    expect((await t.call('PATCH', '/api/v1/me', { token: tok('eve'), body: { photoUrl: 'https://firebasestorage.googleapis.com/v0/b/x/o/users%2Feve%2Favatar.png?alt=media' } })).status).toBe(200);
    expect((await t.call('PATCH', '/api/v1/me', { token: tok('eve'), body: { photoUrl: 'https://lh3.googleusercontent.com/a/abc' } })).status).toBe(200);
  });
});

describe('sesiones revocadas', () => {
  it('las rutas de admin piden comprobar la revocación del token; las normales no', async () => {
    t.verifyChecks.length = 0;
    await t.call('GET', '/api/v1/me', { token: tok('eve') });
    expect(t.verifyChecks.at(-1)).toBe(false);
    await t.call('GET', '/api/v1/admin/plans', { token: ADMIN() });
    expect(t.verifyChecks.at(-1)).toBe(true);
  });
});

describe('webhook de Stripe', () => {
  it('sin firma → 400 y no toca la base', async () => {
    const before = (await t.db.select().from(schema.stripeEvents)).length;
    const r = await t.call('POST', '/api/v1/webhooks/stripe', { raw: JSON.stringify({ id: 'evt_evil', type: 'customer.subscription.created', data: { object: {} } }) });
    expect(r.status).toBe(400);
    expect((await t.db.select().from(schema.stripeEvents)).length).toBe(before);
  });
  it('un cliente no puede fabricarse una suscripción activa llamando al webhook', async () => {
    const eve = (await t.call('GET', '/api/v1/me', { token: tok('eve') })).json.user;
    const r = await t.call('POST', '/api/v1/webhooks/stripe', { headers: { 'stripe-signature': 'inventada' }, raw: JSON.stringify({ id: 'evt_fake', type: 'customer.subscription.created', data: { object: { id: 'sub_fake', status: 'active', metadata: { userId: eve.id, planId: 'escuela' }, items: { data: [] } } } }) });
    expect(r.status).toBe(400);
    expect((await t.db.select().from(schema.subscriptions).where(eq(schema.subscriptions.stripeSubscriptionId, 'sub_fake'))).length).toBe(0);
  });
});

describe('límite de peticiones', () => {
  it('las rutas sensibles devuelven 429 al abusar', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 70; i++) statuses.push((await t.call('POST', '/api/v1/billing/portal', { token: tok('eve') })).status);
    expect(statuses).toContain(429);
    expect(statuses[0]).not.toBe(429);
  });
});
