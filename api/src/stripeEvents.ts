import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';
import { schema, type Db } from './db/index.js';

const { users, plans, subscriptions, payments, stripeCustomers, payoutAccounts, stripeEvents } = schema;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const asDate = (unix?: number | null) => (unix ? new Date(unix * 1000) : null);

async function userIdFor(db: Db, metaUserId: string | undefined, customer: unknown): Promise<string | null> {
  if (metaUserId && UUID.test(metaUserId)) {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.id, metaUserId)).limit(1);
    if (u) return u.id;
  }
  const cid = typeof customer === 'string' ? customer : (customer as { id?: string } | null)?.id;
  if (!cid) return null;
  const [c] = await db.select({ userId: stripeCustomers.userId }).from(stripeCustomers).where(eq(stripeCustomers.stripeCustomerId, cid)).limit(1);
  return c?.userId ?? null;
}

async function upsertSubscription(db: Db, sub: any) {
  const userId = await userIdFor(db, sub.metadata?.userId, sub.customer);
  if (!userId) return; // suscripción que no es de Waack On
  const planId = sub.metadata?.planId as string | undefined;
  const [plan] = planId ? await db.select({ id: plans.id }).from(plans).where(eq(plans.id, planId)).limit(1) : [];
  const instructorMeta = sub.metadata?.instructorId as string | undefined;
  let instructorId: string | null = null;
  if (instructorMeta && UUID.test(instructorMeta)) {
    const [i] = await db.select({ id: users.id }).from(users).where(eq(users.id, instructorMeta)).limit(1);
    instructorId = i?.id ?? null;
  }
  const item = sub.items?.data?.[0];
  const values = {
    userId,
    planId: plan?.id ?? null,
    instructorId,
    status: sub.status as string,
    priceId: (item?.price?.id as string | undefined) ?? null,
    currency: (sub.currency as string | undefined)?.toUpperCase() ?? null,
    // Las versiones nuevas de la API de Stripe llevan el fin de periodo en el item; las antiguas, en la suscripción.
    currentPeriodEnd: asDate(item?.current_period_end ?? sub.current_period_end),
    cancelAtPeriodEnd: !!sub.cancel_at_period_end,
    updatedAt: new Date(),
  };
  await db.insert(subscriptions).values({ stripeSubscriptionId: sub.id, ...values })
    .onConflictDoUpdate({ target: subscriptions.stripeSubscriptionId, set: values });
}

async function recordInvoice(db: Db, inv: any, status: 'paid' | 'failed') {
  const userId = await userIdFor(db, undefined, inv.customer);
  if (!userId) return;
  const stripeSubId: string | undefined = inv.parent?.subscription_details?.subscription ?? inv.subscription ?? undefined;
  const subId = typeof stripeSubId === 'string' ? stripeSubId : (stripeSubId as any)?.id;
  const [sub] = subId ? await db.select({ id: subscriptions.id }).from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, subId)).limit(1) : [];
  const values = {
    userId,
    subscriptionId: sub?.id ?? null,
    amount: status === 'paid' ? (inv.amount_paid ?? 0) : (inv.amount_due ?? 0),
    currency: String(inv.currency ?? 'usd').toUpperCase(),
    status,
    countryCode: (inv.customer_address?.country as string | undefined) ?? null,
    paidAt: status === 'paid' ? asDate(inv.status_transitions?.paid_at) ?? new Date() : null,
  };
  await db.insert(payments).values({ stripeInvoiceId: inv.id, ...values })
    .onConflictDoUpdate({ target: payments.stripeInvoiceId, set: values });
}

// Procesa un evento ya verificado. Es idempotente: un evento repetido no se vuelve a aplicar.
export async function processStripeEvent(db: Db, event: Stripe.Event): Promise<'processed' | 'duplicate' | 'ignored'> {
  const [seen] = await db.select({ id: stripeEvents.id }).from(stripeEvents).where(eq(stripeEvents.id, event.id)).limit(1);
  if (seen) return 'duplicate';

  const obj = event.data.object as any;
  let handled = true;
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await upsertSubscription(db, obj);
      break;
    case 'invoice.paid':
      await recordInvoice(db, obj, 'paid');
      break;
    case 'invoice.payment_failed':
      await recordInvoice(db, obj, 'failed');
      break;
    case 'account.updated':
      await db.update(payoutAccounts).set({
        chargesEnabled: !!obj.charges_enabled, payoutsEnabled: !!obj.payouts_enabled, detailsSubmitted: !!obj.details_submitted, updatedAt: new Date(),
      }).where(eq(payoutAccounts.stripeAccountId, obj.id));
      break;
    default:
      handled = false;
  }
  // Se marca como procesado DESPUÉS de aplicarlo: si algo falla, Stripe reintenta.
  await db.insert(stripeEvents).values({ id: event.id, type: event.type }).onConflictDoNothing();
  return handled ? 'processed' : 'ignored';
}
