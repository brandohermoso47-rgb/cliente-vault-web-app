import { getApp, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import Stripe from 'stripe';

// ─────────────────────────────────────────────────────────────────────────────
// Pagos globales con Stripe + Stripe Connect (instructores y estudios cobran su parte).
//
// Secretos (los pones tú, nunca en el código):
//   firebase functions:secrets:set STRIPE_SECRET_KEY
//   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
//
// Los medios de pago que ve cada persona (tarjetas, billeteras, PIX, OXXO, SEPA, iDEAL…) dependen de su
// país y moneda y se activan en Stripe Dashboard → Configuración → Métodos de pago.
//
// NOTA: se eliminó la antigua función createUserData (creaba perfiles con correo y rol "student").
// Los perfiles los crea la app (src/App.tsx) con rol "usuario".
// ─────────────────────────────────────────────────────────────────────────────

initializeApp();
// La app usa una base de Firestore con nombre, no "(default)".
const DB_ID = process.env.FIRESTORE_DB || 'ai-studio-waackonplataform-995cd1f5-e15c-4eff-aaa2-62e6d650abe1';
const db = getFirestore(getApp(), DB_ID);

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
const APP_URL = process.env.APP_URL || 'https://waack-on.com';
const REGION = 'us-central1';

const stripeClient = () => new Stripe(STRIPE_SECRET_KEY.value());

type Interval = 'month' | 'year';
const needAuth = (uid?: string) => {
  if (!uid) throw new HttpsError('unauthenticated', 'Inicia sesión para continuar.');
  return uid;
};

async function getOrCreateCustomer(stripe: Stripe, uid: string, email?: string, name?: string) {
  const ref = db.collection('customers').doc(uid);
  const snap = await ref.get();
  const existing = snap.data()?.stripeCustomerId as string | undefined;
  if (existing) return existing;
  const c = await stripe.customers.create({ email, name, metadata: { uid } });
  await ref.set({ stripeCustomerId: c.id, createdAt: FieldValue.serverTimestamp() });
  return c.id;
}

// ── 1) Checkout: crea la sesión de pago de una suscripción ───────────────────────────────────────────
export const createCheckoutSession = onCall({ region: REGION, secrets: [STRIPE_SECRET_KEY] }, async (req) => {
  const uid = needAuth(req.auth?.uid);
  const { planId, interval, instructorId } = req.data as { planId?: string; interval?: Interval; instructorId?: string };
  if (!planId || (interval !== 'month' && interval !== 'year')) throw new HttpsError('invalid-argument', 'Plan o periodo no válido.');

  const plan = (await db.collection('plans').doc(planId).get()).data();
  if (!plan || plan.active !== true) throw new HttpsError('not-found', 'Este plan no está disponible.');
  const price = plan.prices?.[interval] as string | undefined;
  if (!price) throw new HttpsError('failed-precondition', 'Este plan no tiene precio configurado para ese periodo.');

  const stripe = stripeClient();
  const customer = await getOrCreateCustomer(stripe, uid, req.auth?.token.email, req.auth?.token.name);
  const meta: Record<string, string> = { uid, planId };

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    customer,
    client_reference_id: uid,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    success_url: `${APP_URL}/?checkout=success`,
    cancel_url: `${APP_URL}/?checkout=cancel`,
    metadata: meta,
    subscription_data: { metadata: meta },
  };

  // Suscripción a un instructor o estudio: el dinero se reparte con Stripe Connect.
  if (plan.kind === 'instructor') {
    if (!instructorId) throw new HttpsError('invalid-argument', 'Elige un instructor.');
    if (typeof plan.feePercent !== 'number') throw new HttpsError('failed-precondition', 'El plan no tiene comisión configurada.');
    const payout = (await db.collection('payoutAccounts').doc(instructorId).get()).data();
    if (!payout?.stripeAccountId || payout.chargesEnabled !== true) throw new HttpsError('failed-precondition', 'Este instructor aún no puede recibir pagos.');
    meta.instructorId = instructorId;
    params.subscription_data = { metadata: meta, transfer_data: { destination: payout.stripeAccountId }, application_fee_percent: plan.feePercent };
  }

  // Impuestos automáticos por país (requiere activar Stripe Tax en el Dashboard).
  if (plan.automaticTax === true) {
    params.automatic_tax = { enabled: true };
    params.customer_update = { address: 'auto', name: 'auto' };
  }

  const session = await stripe.checkout.sessions.create(params);
  return { url: session.url };
});

// ── 2) Portal del cliente: cambiar tarjeta, cancelar, ver facturas ───────────────────────────────────
export const createPortalSession = onCall({ region: REGION, secrets: [STRIPE_SECRET_KEY] }, async (req) => {
  const uid = needAuth(req.auth?.uid);
  const customer = (await db.collection('customers').doc(uid).get()).data()?.stripeCustomerId as string | undefined;
  if (!customer) throw new HttpsError('failed-precondition', 'Aún no tienes suscripciones.');
  const session = await stripeClient().billingPortal.sessions.create({ customer, return_url: `${APP_URL}/` });
  return { url: session.url };
});

// ── 3) Connect: alta de instructores y estudios para recibir pagos ───────────────────────────────────
export const createConnectOnboarding = onCall({ region: REGION, secrets: [STRIPE_SECRET_KEY] }, async (req) => {
  const uid = needAuth(req.auth?.uid);
  const user = (await db.collection('users').doc(uid).get()).data();
  if (!user || !['instructor', 'estudio', 'admin'].includes(user.role)) {
    throw new HttpsError('permission-denied', 'Solo instructores y estudios aprobados pueden recibir pagos.');
  }
  const stripe = stripeClient();
  const ref = db.collection('payoutAccounts').doc(uid);
  let accountId = (await ref.get()).data()?.stripeAccountId as string | undefined;
  if (!accountId) {
    const acct = await stripe.accounts.create({
      type: 'express',
      email: req.auth?.token.email,
      ...(user.countryCode ? { country: user.countryCode as string } : {}),
      capabilities: { transfers: { requested: true } },
      metadata: { uid },
    });
    accountId = acct.id;
    await ref.set({ uid, stripeAccountId: accountId, chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false, createdAt: FieldValue.serverTimestamp() });
  }
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: 'account_onboarding',
    refresh_url: `${APP_URL}/?connect=refresh`,
    return_url: `${APP_URL}/?connect=done`,
  });
  return { url: link.url };
});

// ── 4) Webhook de Stripe: el servidor es la única fuente de verdad del estado de las suscripciones ──
export const stripeWebhook = onRequest({ region: REGION, secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] }, async (req, res) => {
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'] as string, STRIPE_WEBHOOK_SECRET.value());
  } catch {
    res.status(400).send('Firma no válida');
    return;
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const item = sub.items.data[0];
        const periodEnd = (item as any)?.current_period_end ?? (sub as any).current_period_end ?? null;
        await db.collection('subscriptions').doc(sub.id).set({
          uid: sub.metadata?.uid ?? null,
          planId: sub.metadata?.planId ?? null,
          instructorId: sub.metadata?.instructorId ?? null,
          status: sub.status,
          priceId: item?.price?.id ?? null,
          currency: sub.currency,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        break;
      }
      case 'account.updated': {
        const acct = event.data.object as Stripe.Account;
        const uid = acct.metadata?.uid;
        if (uid) {
          await db.collection('payoutAccounts').doc(uid).set({
            chargesEnabled: acct.charges_enabled,
            payoutsEnabled: acct.payouts_enabled,
            detailsSubmitted: acct.details_submitted,
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        }
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (e) {
    console.error('Webhook error', event.type, e);
    res.status(500).send('Error procesando el evento'); // Stripe reintenta
  }
});
