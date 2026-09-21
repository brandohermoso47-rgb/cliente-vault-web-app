import { sql } from 'drizzle-orm';
import { boolean, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// PostgreSQL es la fuente de verdad de usuarios, suscripciones, pagos y catálogo.
// Firestore queda para lo de tiempo real (chat, batallas, notificaciones).

export const userRole = pgEnum('user_role', ['usuario', 'instructor', 'estudio', 'admin']);
export const applicationKind = pgEnum('application_kind', ['instructor', 'estudio']);
export const applicationStatus = pgEnum('application_status', ['pendiente', 'aprobada', 'rechazada']);
export const planKind = pgEnum('plan_kind', ['platform', 'instructor']);

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: text('firebase_uid').notNull().unique(),
  email: text('email'),
  displayName: text('display_name'),
  handle: text('handle').unique(),
  countryCode: varchar('country_code', { length: 2 }),
  bio: text('bio'),
  photoUrl: text('photo_url'),
  role: userRole('role').notNull().default('usuario'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// Solicitudes de cuenta de instructor o estudio/academia (las aprueba un admin).
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  kind: applicationKind('kind').notNull(),
  orgName: text('org_name').notNull(),
  contactName: text('contact_name').notNull(),
  countryCode: varchar('country_code', { length: 2 }).notNull(),
  city: text('city').notNull(),
  styles: text('styles').notNull(),
  web: text('web'),
  about: text('about').notNull(),
  status: applicationStatus('status').notNull().default('pendiente'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: createdAt(),
});

// Catálogo de planes. prices = { month: "price_…", year: "price_…" } (IDs de Stripe).
export const plans = pgTable('plans', {
  id: text('id').primaryKey(),
  kind: planKind('kind').notNull(),
  name: text('name').notNull(),
  active: boolean('active').notNull().default(false),
  prices: jsonb('prices').$type<{ month?: string; year?: string }>().notNull().default({}),
  feePercent: numeric('fee_percent', { precision: 5, scale: 2 }), // comisión de Waack On (solo planes de instructor)
  automaticTax: boolean('automatic_tax').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const stripeCustomers = pgTable('stripe_customers', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  createdAt: createdAt(),
});

// Cuenta Stripe Connect de instructores y estudios (para recibir su parte).
export const payoutAccounts = pgTable('payout_accounts', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  stripeAccountId: text('stripe_account_id').notNull().unique(),
  chargesEnabled: boolean('charges_enabled').notNull().default(false),
  payoutsEnabled: boolean('payouts_enabled').notNull().default(false),
  detailsSubmitted: boolean('details_submitted').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: text('plan_id').references(() => plans.id),
  instructorId: uuid('instructor_id').references(() => users.id), // a quién se suscribe (planes de instructor)
  status: text('status').notNull(),
  priceId: text('price_id'),
  currency: varchar('currency', { length: 3 }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  stripeInvoiceId: text('stripe_invoice_id').notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(), // unidad menor de la moneda (céntimos)
  currency: varchar('currency', { length: 3 }).notNull(),
  status: text('status').notNull(), // paid | failed
  countryCode: varchar('country_code', { length: 2 }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: createdAt(),
});

// Eventos de Stripe ya procesados (idempotencia del webhook).
export const stripeEvents = pgTable('stripe_events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Role = User['role'];
