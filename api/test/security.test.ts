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
    const res = await fetch(t.base + '/api/health');
    expect(res.headers.get('x-powered-by')).toBeNull();
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('strict-transport-security')).toMatch(/max-age=/);
    expect(res.headers.get('x-frame-options')).toBeTruthy();
  });

  it('un origen no permitido NO recibe cabeceras CORS', async () => {
    const res = await fetch(t.base + '/api/health', { headers: { origin: 'https://evil.example' } });
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('un origen permitido sí', async () => {
    const res = await fetch(t.base + '/api/health', { headers: { origin: 'https://waack-on.com' } });
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

describe('aceptación de los términos de servicio', () => {
  it('se guarda la versión y la fecha al crear la cuenta, y no se pisa después', async () => {
    const r = await t.call('POST', '/api/v1/session', { token: tok('terms1'), body: { termsVersion: '2026-09-21' } });
    expect(r.status).toBe(201);
    let [u] = await t.db.select().from(schema.users).where(eq(schema.users.firebaseUid, 'terms1'));
    expect(u.termsVersion).toBe('2026-09-21');
    expect(u.termsAcceptedAt).toBeInstanceOf(Date);
    const first = u.termsAcceptedAt!.getTime();
    await t.call('POST', '/api/v1/session', { token: tok('terms1'), body: { termsVersion: '2030-01-01' } });
    [u] = await t.db.select().from(schema.users).where(eq(schema.users.firebaseUid, 'terms1'));
    expect(u.termsVersion).toBe('2026-09-21');
    expect(u.termsAcceptedAt!.getTime()).toBe(first);
  });
  it('una versión con formato raro se rechaza', async () => {
    expect((await t.call('POST', '/api/v1/session', { token: tok('terms2'), body: { termsVersion: "1'; DROP TABLE users" } })).status).toBe(400);
  });
  it('sin versión, la cuenta se crea sin registro de aceptación (p. ej. entrada con Google)', async () => {
    await t.call('POST', '/api/v1/session', { token: tok('terms3') });
    const [u] = await t.db.select().from(schema.users).where(eq(schema.users.firebaseUid, 'terms3'));
    expect(u.termsVersion).toBeNull();
  });
});

describe('solo mi app: origen estricto', () => {
  const ME = '/api/v1/me';
  it('un origen ajeno recibe 403 aunque lleve un token válido', async () => {
    const r = await t.call('GET', ME, { token: tok('eve'), headers: { origin: 'https://evil.example' } });
    expect(r.status).toBe(403);
    expect(r.json.error).toBe('origin_not_allowed');
  });
  it('un subdominio o esquema parecido tampoco pasa', async () => {
    for (const origin of ['https://waack-on.com.evil.example', 'http://waack-on.com', 'https://evil.waack-on.com', 'null']) {
      expect((await t.call('GET', ME, { token: tok('eve'), headers: { origin } })).status).toBe(403);
    }
  });
  it('sin Origin y sin señal de venir del propio sitio → 403 (curl, scripts, otros servidores)', async () => {
    expect((await t.call('GET', ME, { token: tok('eve'), headers: { origin: null } })).status).toBe(403);
    expect((await t.call('GET', ME, { token: tok('eve'), headers: { origin: null, 'sec-fetch-site': 'cross-site' } })).status).toBe(403);
  });
  it('un GET del propio sitio (sin Origin pero con Sec-Fetch-Site: same-origin) sí pasa', async () => {
    expect((await t.call('GET', ME, { token: tok('eve'), headers: { origin: null, 'sec-fetch-site': 'same-origin' } })).status).toBe(200);
  });
  it('sin Origin pero con Referer de mi web pasa; con Referer ajeno no', async () => {
    expect((await t.call('GET', ME, { token: tok('eve'), headers: { origin: null, referer: 'https://waack-on.com/planes' } })).status).toBe(200);
    expect((await t.call('GET', ME, { token: tok('eve'), headers: { origin: null, referer: 'https://evil.example/waack-on.com' } })).status).toBe(403);
  });
  it('el preflight de un origen ajeno no recibe permisos CORS; el de mi web sí (con App Check)', async () => {
    const bad = await fetch(t.base + ME, { method: 'OPTIONS', headers: { origin: 'https://evil.example', 'access-control-request-method': 'GET' } });
    expect(bad.headers.get('access-control-allow-origin')).toBeNull();
    const ok = await fetch(t.base + ME, { method: 'OPTIONS', headers: { origin: 'https://waack-on.com', 'access-control-request-method': 'GET', 'access-control-request-headers': 'authorization,x-firebase-appcheck' } });
    expect(ok.headers.get('access-control-allow-origin')).toBe('https://waack-on.com');
    expect((ok.headers.get('access-control-allow-headers') || '').toLowerCase()).toContain('x-firebase-appcheck');
  });
  it('health y el webhook de Stripe (firmado) funcionan sin Origin', async () => {
    expect((await t.call('GET', '/api/health', { headers: { origin: null } })).status).toBe(200);
    const w = await t.call('POST', '/api/v1/webhooks/stripe', { headers: { origin: null, 'stripe-signature': 'good' }, raw: JSON.stringify({ id: 'evt_noorigin', type: 'charge.succeeded', data: { object: {} } }) });
    expect(w.status).toBe(200);
  });
});

describe('solo mi app: Firebase App Check', () => {
  let strict: Awaited<ReturnType<typeof makeTestApp>>;
  beforeAll(async () => {
    strict = await makeTestApp({ APP_CHECK: 'enforce' });
    await strict.call('POST', '/api/v1/session', { token: tok('zed'), headers: { 'x-firebase-appcheck': 'appcheck-ok' } });
  });
  afterAll(async () => { await strict.close(); });

  it('sin token de App Check → 401', async () => {
    const r = await strict.call('GET', '/api/v1/me', { token: tok('zed') });
    expect(r.status).toBe(401);
    expect(r.json.error).toBe('app_check_required');
  });
  it('con un token falso → 401', async () => {
    const r = await strict.call('GET', '/api/v1/me', { token: tok('zed'), headers: { 'x-firebase-appcheck': 'inventado' } });
    expect(r.status).toBe(401);
    expect(r.json.error).toBe('app_check_invalid');
  });
  it('con un token válido → 200', async () => {
    expect((await strict.call('GET', '/api/v1/me', { token: tok('zed'), headers: { 'x-firebase-appcheck': 'appcheck-ok' } })).status).toBe(200);
  });
  it('un token de sesión robado no basta sin la app (App Check)', async () => {
    expect((await strict.call('GET', '/api/v1/me', { token: tok('zed'), headers: { origin: null } })).status).toBe(403);
  });
  it('health y el webhook siguen sin App Check', async () => {
    expect((await strict.call('GET', '/api/health')).status).toBe(200);
    expect((await strict.call('POST', '/api/v1/webhooks/stripe', { headers: { 'stripe-signature': 'good' }, raw: JSON.stringify({ id: 'evt_ac', type: 'x', data: { object: {} } }) })).status).toBe(200);
  });
  it('no arranca APP_CHECK=enforce sin verificador', async () => {
    const { createApp } = await import('../src/app.js');
    const { loadConfig } = await import('../src/config.js');
    expect(() => createApp({ db: t.db, config: loadConfig({ APP_CHECK: 'enforce' } as NodeJS.ProcessEnv), verify: async () => ({ uid: 'x', emailVerified: true }), syncRole: async () => {} })).toThrow(/App Check/);
  });
});
