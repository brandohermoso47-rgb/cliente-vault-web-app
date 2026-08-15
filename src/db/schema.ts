import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define user profiles table
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('free_user'), // 'free_user' | 'vip_student' | 'academy' | 'instructor'
  stripeCustomerId: text('stripe_customer_id'),
  stripeAccountId: text('stripe_account_id'), // Stripe Connect ID for instructors
  isConnectVerified: boolean('is_connect_verified').default(false),
  subscriptionStatus: text('subscription_status').default('canceled'), // 'trialing' | 'active' | 'past_due' | 'canceled'
  planType: text('plan_type').default('app_vip'), // 'app_vip' | 'app_academy' | 'instructor_custom'
  currentPeriodEnd: timestamp('current_period_end'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  instagram: text('instagram'),
  tiktok: text('tiktok'),
  youtube: text('youtube'),
  points: integer('points').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define 'subscriptions' table for tracking recurring billing states
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeCustomerId: text('stripe_customer_id'),
  planType: text('plan_type').notNull().default('app_vip'), // 'app_vip' | 'app_academy' | 'instructor_custom'
  status: text('status').notNull().default('trialing'), // 'trialing' | 'active' | 'past_due' | 'canceled'
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  trialEnd: timestamp('trial_end'),
  instructorId: text('instructor_id'), // Optional for instructor_custom
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define 'instructorSubscribers' intermediate table (75/25 Creator marketplace)
export const instructorSubscribers = pgTable('instructor_subscribers', {
  id: serial('id').primaryKey(),
  studentUid: text('student_uid').notNull(),
  instructorUid: text('instructor_uid').notNull(),
  status: text('status').notNull().default('active'), // 'active' | 'canceled' | 'past_due'
  stripeSubscriptionId: text('stripe_subscription_id'),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  monthlyPriceUSD: integer('monthly_price_usd_cents').default(1500),
  instructorRevenueUSD: integer('instructor_revenue_usd_cents').default(1125), // 75%
  platformFeeUSD: integer('platform_fee_usd_cents').default(375), // 25%
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'entries' table (practice logs) with a foreign key to 'users'.
export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'announcements' table for academy news
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').default('comunicados'),
  isImportant: boolean('is_important').default(false),
  actionUrl: text('action_url'),
  imageUrl: text('image_url'),
  authorUid: text('author_uid').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull().default('instructor'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'communityMessages' table for Communication Hub
export const communityMessages = pgTable('community_messages', {
  id: serial('id').primaryKey(),
  authorUid: text('author_uid').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull().default('student'),
  content: text('content').notNull(),
  channel: text('channel').default('lobby'), // 'lobby' | 'presentate' | 'anuncios'
  videoUrl: text('video_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'instructorTasks' table
export const instructorTasks = pgTable('instructor_tasks', {
  id: serial('id').primaryKey(),
  authorUid: text('author_uid').notNull(),
  studentUid: text('student_uid'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').default('general'),
  points: integer('points').default(50),
  status: text('status').default('pending'), // 'pending' | 'completed'
  deadline: text('deadline'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'instructorTransactions' table
export const instructorTransactions = pgTable('instructor_transactions', {
  id: serial('id').primaryKey(),
  instructorUid: text('instructor_uid').notNull(),
  studentName: text('student_name').notNull(),
  itemType: text('item_type').notNull(),
  itemTitle: text('item_title').notNull(),
  grossAmountUSD: integer('gross_amount_usd_cents').notNull(),
  platformFeeUSD: integer('platform_fee_usd_cents').notNull(),
  netAmountUSD: integer('net_amount_usd_cents').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'instructorPayouts' table
export const instructorPayouts = pgTable('instructor_payouts', {
  id: serial('id').primaryKey(),
  instructorUid: text('instructor_uid').notNull(),
  amountUSD: integer('amount_usd_cents').notNull(),
  status: text('status').notNull().default('completed'),
  bankSummary: text('bank_summary'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'instructorBankAccounts' table
export const instructorBankAccounts = pgTable('instructor_bank_accounts', {
  id: serial('id').primaryKey(),
  instructorUid: text('instructor_uid').notNull().unique(),
  bankName: text('bank_name').notNull(),
  accountHolder: text('account_holder').notNull(),
  accountNumber: text('account_number').notNull(),
  routingNumber: text('routing_number'),
  country: text('country').default('USD'),
  updatedAt: timestamp('updated_at').defaultNow(),
});


// Define relationships
export const usersRelations = relations(users, ({ many, one }) => ({
  entries: many(entries),
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
  author: one(users, {
    fields: [entries.userId],
    references: [users.id],
  }),
}));

