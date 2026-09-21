import { and, eq, ne } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import { requireVerifiedEmail, withAuth } from '../auth.js';
import { list } from '../config.js';
import { elevate } from '../db/context.js';
import { schema } from '../db/index.js';
import type { User } from '../db/schema.js';
import { HttpError, handle, parse, type Deps } from '../http.js';

const { users, applications, subscriptions, plans, payoutAccounts } = schema;

const handle_ = z.string().trim().toLowerCase().regex(/^[a-z0-9_.]{3,20}$/, '3–20 caracteres: minúsculas, números, punto o guion bajo');
const country = z.string().trim().length(2).transform((s) => s.toUpperCase());

export const applicationBody = z.object({
  kind: z.enum(['instructor', 'estudio']),
  orgName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  countryCode: country,
  city: z.string().trim().min(1).max(120),
  styles: z.string().trim().min(2).max(200),
  web: z.string().trim().max(200).optional(),
  about: z.string().trim().min(20).max(600),
});

const sessionBody = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  handle: handle_.optional(),
  countryCode: country.optional(),
  application: applicationBody.optional(),
  termsVersion: z.string().trim().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).optional(), // p. ej. 2026-09-21
});

// La foto de perfil solo puede apuntar a Firebase Storage o a la foto de la cuenta de Google.
const PHOTO_HOSTS = new Set(['firebasestorage.googleapis.com', 'storage.googleapis.com', 'lh3.googleusercontent.com']);

const patchBody = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  handle: handle_.optional(),
  countryCode: country.optional(),
  bio: z.string().trim().max(280).optional(),
  photoUrl: z.string().url().max(600).refine((u) => PHOTO_HOSTS.has(new URL(u).hostname) && u.startsWith('https://'), 'La foto debe estar en el almacenamiento de Waack On o en tu cuenta de Google').optional(),
}).strict(); // el rol y el resto de campos NO se pueden enviar

export const publicUser = (u: User) => ({
  id: u.id, email: u.email, displayName: u.displayName, handle: u.handle, countryCode: u.countryCode,
  bio: u.bio, photoUrl: u.photoUrl, role: u.role, createdAt: u.createdAt,
});

const isUnique = (e: any) => (e?.code ?? e?.cause?.code) === '23505';

export function usersRouter(deps: Deps) {
  const r = Router();

  // Se llama tras iniciar sesión: crea (o recupera) la fila de usuario. Es idempotente.
  // Corre como 'system': aún no existe la fila de la persona sobre la que aplicar RLS.
  r.post('/session', withAuth(deps, { loadUser: false }), handle(deps, 'system', async ({ req, db }) => {
    const body = parse(sessionBody, req.body ?? {});
    const t = req.token!;
    const admins = list(deps.config.BOOTSTRAP_ADMIN_EMAILS).map((e) => e.toLowerCase());
    const isBootstrapAdmin = t.emailVerified && !!t.email && admins.includes(t.email.toLowerCase());

    let [user] = await db.select().from(users).where(eq(users.firebaseUid, t.uid)).limit(1);
    let isNew = false;
    if (!user) {
      let h: string | null = body.handle ?? null;
      if (h) {
        const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.handle, h)).limit(1);
        if (taken) h = null; // el usuario lo podrá elegir después en Mi cuenta
      }
      const [created] = await db.insert(users).values({
        firebaseUid: t.uid,
        email: t.email ?? null,
        displayName: body.displayName ?? t.name ?? null,
        handle: h,
        countryCode: body.countryCode ?? body.application?.countryCode ?? null, // Stripe Connect necesita el país del cobrador
        photoUrl: t.picture ?? null,
        ...(body.termsVersion ? { termsVersion: body.termsVersion, termsAcceptedAt: new Date() } : {}),
      }).onConflictDoNothing({ target: users.firebaseUid }).returning();
      if (created) { user = created; isNew = true; }
      else [user] = await db.select().from(users).where(eq(users.firebaseUid, t.uid)).limit(1);
    }

    // Primer administrador: solo correos verificados de la lista BOOTSTRAP_ADMIN_EMAILS.
    if (isBootstrapAdmin) {
      if (user.role !== 'admin') [user] = await db.update(users).set({ role: 'admin', updatedAt: new Date() }).where(eq(users.id, user.id)).returning();
      try { await deps.syncRole(user.firebaseUid, 'admin'); } catch (e) { console.error('syncRole falló', e); }
    }

    if (body.application) {
      const [existing] = await db.select({ id: applications.id }).from(applications).where(eq(applications.userId, user.id)).limit(1);
      if (!existing && user.role === 'usuario') await db.insert(applications).values({ ...body.application, userId: user.id });
    }
    return { status: isNew ? 201 : 200, body: { user: publicUser(user), isNew } };
  }));

  r.get('/me', withAuth(deps), handle(deps, 'user', async ({ req, db }) => {
    const u = req.user!;
    const [app] = await db.select().from(applications).where(eq(applications.userId, u.id)).limit(1);
    const [payout] = await db.select().from(payoutAccounts).where(eq(payoutAccounts.userId, u.id)).limit(1);
    const subs = await db.select({
      id: subscriptions.id, planId: subscriptions.planId, planName: plans.name, instructorId: subscriptions.instructorId,
      status: subscriptions.status, currency: subscriptions.currency, currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
    }).from(subscriptions).leftJoin(plans, eq(plans.id, subscriptions.planId)).where(eq(subscriptions.userId, u.id));
    return {
      body: {
        user: publicUser(u),
        application: app ? { kind: app.kind, orgName: app.orgName, status: app.status, createdAt: app.createdAt } : null,
        payout: payout ? { chargesEnabled: payout.chargesEnabled, payoutsEnabled: payout.payoutsEnabled, detailsSubmitted: payout.detailsSubmitted } : null,
        subscriptions: subs,
      },
    };
  }));

  r.patch('/me', withAuth(deps), handle(deps, 'user', async ({ req, db }) => {
    const body = parse(patchBody, req.body ?? {});
    const u = req.user!;
    if (body.handle) {
      // Con RLS solo vemos nuestra fila: para saber si el @usuario lo tiene otra persona hace falta 'system' (solo esta consulta).
      const taken = await elevate(db, async () => (await db.select({ id: users.id }).from(users).where(and(eq(users.handle, body.handle!), ne(users.id, u.id))).limit(1))[0]);
      if (taken) throw new HttpError(409, 'handle_taken', 'Ese nombre de usuario ya está en uso.');
    }
    try {
      const [updated] = await db.update(users).set({ ...body, updatedAt: new Date() }).where(eq(users.id, u.id)).returning();
      return { body: { user: publicUser(updated) } };
    } catch (e) {
      if (isUnique(e)) throw new HttpError(409, 'handle_taken', 'Ese nombre de usuario ya está en uso.');
      throw e;
    }
  }));

  // Quien ya tiene cuenta solicita ser instructor o estudio/academia.
  r.post('/applications', withAuth(deps), requireVerifiedEmail, handle(deps, 'user', async ({ req, db }) => {
    const body = parse(applicationBody, req.body);
    const u = req.user!;
    if (u.role !== 'usuario') throw new HttpError(409, 'already_professional', 'Tu cuenta ya tiene un rol profesional.');
    const [existing] = await db.select({ id: applications.id }).from(applications).where(eq(applications.userId, u.id)).limit(1);
    if (existing) throw new HttpError(409, 'application_exists', 'Ya enviaste una solicitud.');
    const [created] = await db.insert(applications).values({ ...body, userId: u.id }).returning();
    return { status: 201, body: { application: { kind: created.kind, orgName: created.orgName, status: created.status } } };
  }));

  return r;
}
