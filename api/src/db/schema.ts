import { sql } from 'drizzle-orm';
import { boolean, check, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

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
  termsVersion: text('terms_version'), // versión de los Términos de servicio que aceptó al registrarse
  termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true }),
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

// Precio propio de cada instructor para su cátedra (antes era un único precio compartido en `plans`).
export const instructorPricing = pgTable('instructor_pricing', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  priceMonthlyCents: integer('price_monthly_cents').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('usd'),
  stripeProductId: text('stripe_product_id'),
  stripeMonthlyPriceId: text('stripe_monthly_price_id'),
  stripeYearlyPriceId: text('stripe_yearly_price_id'),
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

// Figuras educativas (rejilla, líneas de brazo, triángulos…) sugeridas por el editor de movimiento y
// revisadas por el instructor. Las clases viven en Firestore, así que class_id es el ID de ese documento (sin FK).
export type FigureKeyframe = { t: number; pts: Record<string, { x: number; y: number }>; v?: Record<string, number> };
export const figureEvents = pgTable('figure_events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  classId: text('class_id').notNull(),
  effectType: text('effect_type').notNull(),
  side: varchar('side', { length: 1 }),
  startMs: integer('start_ms').notNull(),
  endMs: integer('end_ms').notNull(),
  params: jsonb('params').$type<{ keyframes: FigureKeyframe[] }>().notNull(),
  color: varchar('color', { length: 7 }),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  editedManually: boolean('edited_manually').notNull().default(false),
  createdAt: createdAt(),
}, (t) => [
  index('figure_events_class_owner_idx').on(t.classId, t.createdBy),
  check('figure_events_range', sql`${t.startMs} >= 0 AND ${t.endMs} > ${t.startMs}`),
]);

export type User = typeof users.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Role = User['role'];
