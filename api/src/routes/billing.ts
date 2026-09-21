import { and, eq, inArray } from 'drizzle-orm';
import { Router } from 'express';
import type Stripe from 'stripe';
import { z } from 'zod';
import { requireVerifiedEmail, withAuth } from '../auth.js';
import { elevate } from '../db/context.js';
import { schema, type Db } from '../db/index.js';
import type { User } from '../db/schema.js';
import { HttpError, handle, parse, type Deps } from '../http.js';

const { users, plans, stripeCustomers, payoutAccounts, subscriptions } = schema;

const checkoutBody = z.object({
  planId: z.string().min(1).max(40),
  interval: z.enum(['month', 'year']),
  instructorId: z.string().min(1).max(128).optional(), // id de usuario (UUID de Postgres) o UID de Firebase del instructor o estudio
});

const needStripe = (deps: Deps): Stripe => {
  if (!deps.stripe) throw new HttpError(503, 'payments_disabled', 'Los pagos todavía no están activados.');
  return deps.stripe;
};

async function getOrCreateCustomer(db: Db, stripe: Stripe, user: User): Promise<string> {
  const [row] = await db.select().from(stripeCustomers).where(eq(stripeCustomers.userId, user.id)).limit(1);
  if (row) return row.stripeCustomerId;
  const c = await stripe.customers.create({ email: user.email ?? undefined, name: user.displayName ?? undefined, metadata: { userId: user.id } });
  await db.insert(stripeCustomers).values({ userId: user.id, stripeCustomerId: c.id }).onConflictDoNothing();
  const [again] = await db.select().from(stripeCustomers).where(eq(stripeCustomers.userId, user.id)).limit(1);
  return again.stripeCustomerId;
}

export function billingRouter(deps: Deps) {
  const r = Router();
  const { config } = deps;

  // Catálogo visible para cualquier usuario con sesión (sin IDs de Stripe).
  r.get('/plans', withAuth(deps), handle(deps, 'user', async ({ db }) => {
    const rows = await db.select().from(plans).where(eq(plans.active, true)).orderBy(plans.id);
    return { body: { plans: rows.map((p) => ({ id: p.id, kind: p.kind, name: p.name, intervals: { month: !!p.prices.month, year: !!p.prices.year } })) } };
  }));

  r.post('/billing/checkout', withAuth(deps), requireVerifiedEmail, handle(deps, 'user', async ({ req, db }) => {
    const stripe = needStripe(deps);
    let { planId, interval, instructorId } = parse(checkoutBody, req.body);
    const user = req.user!;

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!plan || !plan.active) throw new HttpError(404, 'plan_not_found', 'Este plan no está disponible.');
    const price = plan.prices[interval];
    if (!price) throw new HttpError(422, 'no_price', 'Este plan no tiene precio para ese periodo.');

    const meta: Record<string, string> = { userId: user.id, planId: plan.id };
    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = { metadata: meta };

    if (plan.kind === 'instructor') {
      if (!instructorId) throw new HttpError(400, 'instructor_required', 'Elige un instructor.');
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(instructorId);
      // Con RLS solo vemos nuestras filas; la ficha del instructor y su cuenta de cobro son de otra persona:
      // única excepción controlada (solo lectura) mediante 'system'.
      const { inst, payout } = await elevate(db, async () => {
        const [inst] = await db.select().from(users).where(isUuid ? eq(users.id, instructorId!) : eq(users.firebaseUid, instructorId!)).limit(1);
        const [payout] = inst ? await db.select().from(payoutAccounts).where(eq(payoutAccounts.userId, inst.id)).limit(1) : [];
        return { inst, payout };
      });
      if (!inst || !['instructor', 'estudio', 'admin'].includes(inst.role)) throw new HttpError(404, 'instructor_not_found', 'Instructor no encontrado.');
      if (inst.id === user.id) throw new HttpError(400, 'self_subscription', 'No puedes suscribirte a ti mismo.');
      instructorId = inst.id; // a partir de aquí siempre el UUID
      if (!payout || !payout.chargesEnabled) throw new HttpError(422, 'instructor_not_ready', 'Este instructor aún no puede recibir pagos.');
      if (plan.feePercent === null) throw new HttpError(422, 'plan_misconfigured', 'El plan no tiene comisión configurada.');
      meta.instructorId = instructorId;
      subscriptionData.transfer_data = { destination: payout.stripeAccountId };
      subscriptionData.application_fee_percent = Number(plan.feePercent);
    }

    // Evita cobrar dos veces el mismo plan (y el mismo instructor).
    const existing = await db.select({ id: subscriptions.id, instructorId: subscriptions.instructorId }).from(subscriptions)
      .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.planId, plan.id), inArray(subscriptions.status, ['active', 'trialing', 'past_due'])));
    if (existing.some((s) => (s.instructorId ?? null) === (instructorId ?? null))) throw new HttpError(409, 'already_subscribed', 'Ya tienes esta suscripción.');

    const customer = await getOrCreateCustomer(db, stripe, user);
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer,
      client_reference_id: user.id,
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${config.APP_URL}/?checkout=success`,
      cancel_url: `${config.APP_URL}/?checkout=cancel`,
      metadata: meta,
      subscription_data: subscriptionData,
    };
    if (plan.automaticTax) {
      params.automatic_tax = { enabled: true };
      params.customer_update = { address: 'auto', name: 'auto' };
    }
    const session = await stripe.checkout.sessions.create(params);
    return { body: { url: session.url } };
  }));

  r.post('/billing/portal', withAuth(deps), handle(deps, 'user', async ({ req, db }) => {
    const stripe = needStripe(deps);
    const [row] = await db.select().from(stripeCustomers).where(eq(stripeCustomers.userId, req.user!.id)).limit(1);
    if (!row) throw new HttpError(409, 'no_customer', 'Aún no tienes suscripciones.');
    const session = await stripe.billingPortal.sessions.create({ customer: row.stripeCustomerId, return_url: `${config.APP_URL}/` });
    return { body: { url: session.url } };
  }));

  // Alta de instructores y estudios en Stripe Connect para recibir su parte.
  r.post('/connect/onboarding', withAuth(deps), requireVerifiedEmail, handle(deps, 'user', async ({ req, db }) => {
    const stripe = needStripe(deps);
    const user = req.user!;
    if (!['instructor', 'estudio', 'admin'].includes(user.role)) throw new HttpError(403, 'forbidden', 'Solo instructores y estudios aprobados pueden recibir pagos.');
    let [payout] = await db.select().from(payoutAccounts).where(eq(payoutAccounts.userId, user.id)).limit(1);
    if (!payout) {
      const acct = await stripe.accounts.create({
        type: 'express',
        email: user.email ?? undefined,
        ...(user.countryCode ? { country: user.countryCode } : {}),
        capabilities: { transfers: { requested: true } },
        metadata: { userId: user.id },
      });
      [payout] = await db.insert(payoutAccounts).values({ userId: user.id, stripeAccountId: acct.id }).returning();
    }
    const link = await stripe.accountLinks.create({
      account: payout.stripeAccountId,
      type: 'account_onboarding',
      refresh_url: `${config.APP_URL}/?connect=refresh`,
      return_url: `${config.APP_URL}/?connect=done`,
    });
    return { body: { url: link.url } };
  }));

  return r;
}
