import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { schema } from '../src/db/index.js';
import { makeTestApp, tok } from './helpers.js';

type T = Awaited<ReturnType<typeof makeTestApp>>;
let t: T;
beforeAll(async () => { t = await makeTestApp({ BOOTSTRAP_ADMIN_EMAILS: 'boss@waack-on.com' }); });
afterAll(async () => { await t.close(); });

const proApplication = { kind: 'estudio', orgName: 'Waack Academy', contactName: 'Ana Ruiz', countryCode: 'mx', city: 'CDMX', styles: 'Waacking, Punking', about: 'Academia de baile con diez años de experiencia.' };

describe('salud y autenticación', () => {
  it('healthz responde', async () => { expect((await t.call('GET', '/healthz')).status).toBe(200); });
  it('sin token → 401', async () => { expect((await t.call('GET', '/api/v1/me')).status).toBe(401); });
  it('token inválido → 401', async () => { expect((await t.call('GET', '/api/v1/me', { token: 'basura' })).status).toBe(401); });
  it('con token válido pero sin sesión → 409', async () => { expect((await t.call('GET', '/api/v1/me', { token: tok('nadie') })).status).toBe(409); });
  it('ruta inexistente → 404', async () => { expect((await t.call('GET', '/api/v1/nope', { token: tok('a') })).status).toBe(404); });
});

describe('sesión y perfil', () => {
  it('crea el usuario con rol "usuario" y es idempotente', async () => {
    const a = await t.call('POST', '/api/v1/session', { token: tok('alice'), body: { displayName: 'Alice', handle: 'alice.w', countryCode: 'es' } });
    expect(a.status).toBe(201);
    expect(a.json.user).toMatchObject({ role: 'usuario', handle: 'alice.w', countryCode: 'ES', displayName: 'Alice' });
    const b = await t.call('POST', '/api/v1/session', { token: tok('alice') });
    expect(b.status).toBe(200);
    expect(b.json.isNew).toBe(false);
    expect(b.json.user.id).toBe(a.json.user.id);
  });

  it('un @usuario repetido no rompe el registro (queda sin usuario)', async () => {
    const r = await t.call('POST', '/api/v1/session', { token: tok('bob'), body: { handle: 'alice.w' } });
    expect(r.status).toBe(201);
    expect(r.json.user.handle).toBeNull();
  });

  it('PATCH /me actualiza el perfil y rechaza el rol', async () => {
    const ok = await t.call('PATCH', '/api/v1/me', { token: tok('alice'), body: { bio: 'Hola', countryCode: 'mx' } });
    expect(ok.status).toBe(200);
    expect(ok.json.user).toMatchObject({ bio: 'Hola', countryCode: 'MX', role: 'usuario' });
    const escalate = await t.call('PATCH', '/api/v1/me', { token: tok('alice'), body: { role: 'admin' } });
    expect(escalate.status).toBe(400);
    expect((await t.call('GET', '/api/v1/me', { token: tok('alice') })).json.user.role).toBe('usuario');
  });

  it('PATCH /me con @usuario ya usado → 409', async () => {
    await t.call('POST', '/api/v1/session', { token: tok('carol'), body: { handle: 'carol.w' } });
    const r = await t.call('PATCH', '/api/v1/me', { token: tok('carol'), body: { handle: 'alice.w' } });
    expect(r.status).toBe(409);
    expect(r.json.error).toBe('handle_taken');
  });

  it('valida los datos de entrada', async () => {
    expect((await t.call('PATCH', '/api/v1/me', { token: tok('alice'), body: { handle: 'MAL USUARIO!' } })).status).toBe(400);
    expect((await t.call('PATCH', '/api/v1/me', { token: tok('alice'), body: { photoUrl: 'http://inseguro.com/x.png' } })).status).toBe(400);
  });
});

describe('primer administrador', () => {
  it('correo verificado de la lista → admin y se sincroniza el rol', async () => {
    const r = await t.call('POST', '/api/v1/session', { token: tok('boss', 'boss@waack-on.com', true) });
    expect(r.json.user.role).toBe('admin');
    expect(t.synced).toContainEqual(['boss', 'admin']);
  });
  it('mismo correo SIN verificar → no es admin', async () => {
    const r = await t.call('POST', '/api/v1/session', { token: tok('impostor', 'boss@waack-on.com', false) });
    expect(r.json.user.role).toBe('usuario');
  });
  it('un usuario normal no accede a /admin', async () => {
    expect((await t.call('GET', '/api/v1/admin/applications', { token: tok('alice') })).status).toBe(403);
    expect((await t.call('PUT', '/api/v1/admin/plans/escuela', { token: tok('alice'), body: {} })).status).toBe(403);
  });
});

describe('solicitudes de instructor / estudio', () => {
  it('se crean con el registro, el admin las aprueba y cambia el rol', async () => {
    const reg = await t.call('POST', '/api/v1/session', { token: tok('ana'), body: { displayName: 'Ana', application: proApplication } });
    expect(reg.json.user.role).toBe('usuario'); // nace como usuario, nunca como estudio

    const list = await t.call('GET', '/api/v1/admin/applications?status=pendiente', { token: tok('boss', 'boss@waack-on.com') });
    const app = list.json.applications.find((x: any) => x.orgName === 'Waack Academy');
    expect(app).toBeTruthy();

    const dec = await t.call('POST', `/api/v1/admin/applications/${app.id}/decision`, { token: tok('boss', 'boss@waack-on.com'), body: { decision: 'aprobada' } });
    expect(dec.json).toMatchObject({ status: 'aprobada', role: 'estudio' });
    expect(t.synced).toContainEqual(['ana', 'estudio']);
    expect((await t.call('GET', '/api/v1/me', { token: tok('ana') })).json.user.role).toBe('estudio');

    const again = await t.call('POST', `/api/v1/admin/applications/${app.id}/decision`, { token: tok('boss', 'boss@waack-on.com'), body: { decision: 'rechazada' } });
    expect(again.status).toBe(409);
  });

  it('un usuario no puede enviar dos solicitudes ni saltarse la aprobación', async () => {
    const first = await t.call('POST', '/api/v1/applications', { token: tok('alice'), body: { ...proApplication, kind: 'instructor', orgName: 'Alice W' } });
    expect(first.status).toBe(201);
    const second = await t.call('POST', '/api/v1/applications', { token: tok('alice'), body: { ...proApplication, kind: 'instructor' } });
    expect(second.status).toBe(409);
    expect((await t.call('GET', '/api/v1/me', { token: tok('alice') })).json.user.role).toBe('usuario');
  });

  it('el admin no puede quitarse su propio rol', async () => {
    const me = (await t.call('GET', '/api/v1/me', { token: tok('boss', 'boss@waack-on.com') })).json.user;
    expect((await t.call('POST', `/api/v1/admin/users/${me.id}/role`, { token: tok('boss', 'boss@waack-on.com'), body: { role: 'usuario' } })).status).toBe(400);
  });
});

describe('planes y checkout', () => {
  const admin = () => tok('boss', 'boss@waack-on.com');

  it('el admin crea planes; validaciones', async () => {
    expect((await t.call('PUT', '/api/v1/admin/plans/catedra', { token: admin(), body: { kind: 'instructor', name: 'Una cátedra', active: true, prices: { month: 'price_m' } } })).status).toBe(422); // sin feePercent
    expect((await t.call('PUT', '/api/v1/admin/plans/escuela', { token: admin(), body: { kind: 'platform', name: 'Escuela completa', active: true, prices: {} } })).status).toBe(422); // sin precios
    const ok = await t.call('PUT', '/api/v1/admin/plans/escuela', { token: admin(), body: { kind: 'platform', name: 'Escuela completa', active: true, prices: { month: 'price_esc_m', year: 'price_esc_y' } } });
    expect(ok.status).toBe(200);
    await t.call('PUT', '/api/v1/admin/plans/catedra', { token: admin(), body: { kind: 'instructor', name: 'Una cátedra', active: true, prices: { month: 'price_cat_m' }, feePercent: 15 } });
  });

  it('el catálogo público no expone IDs de precio', async () => {
    const r = await t.call('GET', '/api/v1/plans', { token: tok('alice') });
    expect(r.status).toBe(200);
    const esc = r.json.plans.find((p: any) => p.id === 'escuela');
    expect(esc).toEqual({ id: 'escuela', kind: 'platform', name: 'Escuela completa', intervals: { month: true, year: true } });
  });

  it('checkout de plataforma crea la sesión con los metadatos correctos', async () => {
    const r = await t.call('POST', '/api/v1/billing/checkout', { token: tok('alice'), body: { planId: 'escuela', interval: 'year' } });
    expect(r.status).toBe(200);
    expect(r.json.url).toBe('https://checkout.stripe.test/s1');
    const p = t.stripeCalls.checkout.at(-1);
    expect(p.line_items[0].price).toBe('price_esc_y');
    expect(p.mode).toBe('subscription');
    expect(p.metadata.planId).toBe('escuela');
    expect(p.success_url).toBe('https://app.test/?checkout=success');
  });

  it('plan inexistente, periodo sin precio y datos inválidos', async () => {
    expect((await t.call('POST', '/api/v1/billing/checkout', { token: tok('alice'), body: { planId: 'nope', interval: 'month' } })).status).toBe(404);
    expect((await t.call('POST', '/api/v1/billing/checkout', { token: tok('alice'), body: { planId: 'catedra', interval: 'year', instructorId: '00000000-0000-4000-8000-000000000000' } })).status).toBe(422);
    expect((await t.call('POST', '/api/v1/billing/checkout', { token: tok('alice'), body: { planId: 'escuela', interval: 'weekly' } })).status).toBe(400);
  });

  it('suscribirse a un instructor exige que pueda cobrar (Connect)', async () => {
    const ana = (await t.call('GET', '/api/v1/me', { token: tok('ana') })).json.user; // estudio aprobado
    const body = { planId: 'catedra', interval: 'month', instructorId: ana.id };
    const blocked = await t.call('POST', '/api/v1/billing/checkout', { token: tok('alice'), body });
    expect(blocked.status).toBe(422);
    expect(blocked.json.error).toBe('instructor_not_ready');

    // Ana configura sus cobros y Stripe confirma la cuenta (webhook account.updated)
    expect((await t.call('POST', '/api/v1/connect/onboarding', { token: tok('ana') })).json.url).toBe('https://connect.stripe.test/l1');
    expect(t.stripeCalls.accounts.at(-1)).toMatchObject({ type: 'express', country: 'MX' });
    await t.call('POST', '/api/v1/webhooks/stripe', { raw: JSON.stringify({ id: 'evt_acc1', type: 'account.updated', data: { object: { id: 'acct_test1', charges_enabled: true, payouts_enabled: true, details_submitted: true } } }), headers: { 'stripe-signature': 'good' } });

    const ok = await t.call('POST', '/api/v1/billing/checkout', { token: tok('alice'), body });
    expect(ok.status).toBe(200);
    const p = t.stripeCalls.checkout.at(-1);
    expect(p.subscription_data.transfer_data.destination).toBe('acct_test1');
    expect(p.subscription_data.application_fee_percent).toBe(15);
    expect(p.subscription_data.metadata.instructorId).toBe(ana.id);

    expect((await t.call('POST', '/api/v1/billing/checkout', { token: tok('ana'), body })).status).toBe(400); // a sí mismo
  });

  it('el instructor también se puede identificar por su UID de Firebase', async () => {
    await t.call('POST', '/api/v1/session', { token: tok('dave') });
    const ok = await t.call('POST', '/api/v1/billing/checkout', { token: tok('dave'), body: { planId: 'catedra', interval: 'month', instructorId: 'ana' } });
    expect(ok.status).toBe(200);
    expect((await t.call('POST', '/api/v1/billing/checkout', { token: tok('dave'), body: { planId: 'catedra', interval: 'month', instructorId: 'nadie' } })).status).toBe(404);
  });

  it('un usuario normal no puede abrir el alta de cobros', async () => {
    expect((await t.call('POST', '/api/v1/connect/onboarding', { token: tok('carol') })).status).toBe(403);
  });
});

describe('webhook de Stripe', () => {
  const send = (event: object, sig = 'good') => t.call('POST', '/api/v1/webhooks/stripe', { raw: JSON.stringify(event), headers: { 'stripe-signature': sig } });

  it('rechaza firmas no válidas', async () => {
    const r = await send({ id: 'evt_x', type: 'x', data: { object: {} } }, 'mala');
    expect(r.status).toBe(400);
  });

  it('aplica suscripciones y pagos, y es idempotente', async () => {
    const alice = (await t.call('GET', '/api/v1/me', { token: tok('alice') })).json.user;
    const sub = { id: 'sub_1', customer: 'cus_test1', status: 'active', currency: 'eur', cancel_at_period_end: false,
      metadata: { userId: alice.id, planId: 'escuela' }, items: { data: [{ price: { id: 'price_esc_y' }, current_period_end: 1893456000 }] } };
    const ev = { id: 'evt_sub1', type: 'customer.subscription.created', data: { object: sub } };
    expect((await send(ev)).json.result).toBe('processed');
    expect((await send(ev)).json.result).toBe('duplicate');

    let me = (await t.call('GET', '/api/v1/me', { token: tok('alice') })).json;
    expect(me.subscriptions).toHaveLength(1);
    expect(me.subscriptions[0]).toMatchObject({ planId: 'escuela', planName: 'Escuela completa', status: 'active', currency: 'EUR' });

    await send({ id: 'evt_sub2', type: 'customer.subscription.updated', data: { object: { ...sub, status: 'past_due', cancel_at_period_end: true } } });
    me = (await t.call('GET', '/api/v1/me', { token: tok('alice') })).json;
    expect(me.subscriptions).toHaveLength(1);
    expect(me.subscriptions[0]).toMatchObject({ status: 'past_due', cancelAtPeriodEnd: true });

    const inv = { id: 'in_1', customer: 'cus_test1', amount_paid: 9900, currency: 'eur', customer_address: { country: 'ES' }, parent: { subscription_details: { subscription: 'sub_1' } }, status_transitions: { paid_at: 1790000000 } };
    expect((await send({ id: 'evt_inv1', type: 'invoice.paid', data: { object: inv } })).json.result).toBe('processed');
    const rows = await t.db.select().from(schema.payments).where(eq(schema.payments.stripeInvoiceId, 'in_1'));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ amount: 9900, currency: 'EUR', status: 'paid', countryCode: 'ES' });
    expect(rows[0].subscriptionId).not.toBeNull();
  });

  it('un evento de una suscripción ajena a Waack On se ignora sin error', async () => {
    const r = await send({ id: 'evt_foreign', type: 'customer.subscription.created', data: { object: { id: 'sub_x', customer: 'cus_desconocido', status: 'active', metadata: {}, items: { data: [] } } } });
    expect(r.status).toBe(200);
    expect((await t.db.select().from(schema.subscriptions).where(eq(schema.subscriptions.stripeSubscriptionId, 'sub_x')))).toHaveLength(0);
  });

  it('tipos de evento no manejados se registran como ignorados', async () => {
    expect((await send({ id: 'evt_other', type: 'charge.succeeded', data: { object: {} } })).json.result).toBe('ignored');
  });
});

describe('portal de facturación', () => {
  it('abre el portal si ya hay cliente en Stripe; si no, 409', async () => {
    expect((await t.call('POST', '/api/v1/billing/portal', { token: tok('alice') })).json.url).toBe('https://billing.stripe.test/p1');
    expect((await t.call('POST', '/api/v1/billing/portal', { token: tok('bob') })).status).toBe(409);
  });
});
