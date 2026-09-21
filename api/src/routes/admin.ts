import { desc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import { requireRole, withAuth } from '../auth.js';
import { schema } from '../db/index.js';
import { HttpError, handle, parse, type Deps } from '../http.js';

const { users, applications, plans } = schema;
const uuid = z.string().uuid();

const decisionBody = z.object({ decision: z.enum(['aprobada', 'rechazada']) });
const roleBody = z.object({ role: z.enum(['usuario', 'instructor', 'estudio', 'admin']) });
const planBody = z.object({
  kind: z.enum(['platform', 'instructor']),
  name: z.string().trim().min(2).max(80),
  active: z.boolean(),
  prices: z.object({ month: z.string().startsWith('price_').optional(), year: z.string().startsWith('price_').optional() }),
  feePercent: z.number().min(0).max(100).optional(), // % que se queda Waack On (planes de instructor)
  automaticTax: z.boolean().default(false),
});

// Todas las rutas de admin corren con contexto 'admin': RLS le da usuarios, solicitudes y planes,
// pero NO pagos, suscripciones ni cuentas de cobro de otras personas.
export function adminRouter(deps: Deps) {
  const r = Router();
  // En rutas de admin también se comprueba que la sesión no haya sido revocada.
  r.use(withAuth(deps, { checkRevoked: true }), requireRole('admin'));

  type Role = 'usuario' | 'instructor' | 'estudio' | 'admin';
  const setRole = async (db: Parameters<Parameters<typeof handle>[2]>[0]['db'], userId: string, role: Role) => {
    const [u] = await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
    if (!u) throw new HttpError(404, 'user_not_found', 'Usuario no encontrado.');
    // Si Firebase falla, el error revierte también el cambio en PostgreSQL (misma transacción).
    await deps.syncRole(u.firebaseUid, role);
    return u;
  };

  r.get('/applications', handle(deps, 'user', async ({ req, db }) => {
    const status = z.enum(['pendiente', 'aprobada', 'rechazada']).optional().parse(req.query.status);
    const rows = await db.select({
      id: applications.id, kind: applications.kind, orgName: applications.orgName, contactName: applications.contactName,
      countryCode: applications.countryCode, city: applications.city, styles: applications.styles, web: applications.web,
      about: applications.about, status: applications.status, createdAt: applications.createdAt,
      userId: users.id, email: users.email,
    }).from(applications).innerJoin(users, eq(users.id, applications.userId))
      .where(status ? eq(applications.status, status) : undefined).orderBy(desc(applications.createdAt)).limit(200);
    return { body: { applications: rows } };
  }));

  r.post('/applications/:id/decision', handle(deps, 'user', async ({ req, db }) => {
    const id = parse(uuid, req.params.id);
    const { decision } = parse(decisionBody, req.body);
    const [app] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
    if (!app) throw new HttpError(404, 'application_not_found', 'Solicitud no encontrada.');
    if (app.status !== 'pendiente') throw new HttpError(409, 'already_resolved', 'La solicitud ya fue resuelta.');
    await db.update(applications).set({ status: decision, reviewedBy: req.user!.id, reviewedAt: new Date() }).where(eq(applications.id, id));
    let user;
    if (decision === 'aprobada') {
      const [target] = await db.select().from(users).where(eq(users.id, app.userId)).limit(1);
      // Un admin nunca se degrada por aprobar una solicitud suya.
      user = target?.role === 'admin' ? target : await setRole(db, app.userId, app.kind);
    }
    return { body: { id, status: decision, role: user?.role ?? null } };
  }));

  r.post('/users/:id/role', handle(deps, 'user', async ({ req, db }) => {
    const id = parse(uuid, req.params.id);
    const { role } = parse(roleBody, req.body);
    if (id === req.user!.id && role !== 'admin') throw new HttpError(400, 'self_demotion', 'No puedes quitarte el rol de administrador a ti mismo.');
    const u = await setRole(db, id, role);
    return { body: { id: u.id, role: u.role } };
  }));

  r.get('/plans', handle(deps, 'user', async ({ db }) => ({ body: { plans: await db.select().from(plans).orderBy(plans.id) } })));

  r.put('/plans/:id', handle(deps, 'user', async ({ req, db }) => {
    const id = parse(z.string().regex(/^[a-z0-9_-]{2,40}$/), req.params.id);
    const b = parse(planBody, req.body);
    if (b.active && !b.prices.month && !b.prices.year) throw new HttpError(422, 'no_prices', 'Un plan activo necesita al menos un precio.');
    if (b.active && b.kind === 'instructor' && b.feePercent === undefined) throw new HttpError(422, 'fee_required', 'Los planes de instructor necesitan feePercent.');
    const values = { kind: b.kind, name: b.name, active: b.active, prices: b.prices, feePercent: b.feePercent === undefined ? null : String(b.feePercent), automaticTax: b.automaticTax, updatedAt: new Date() };
    const [row] = await db.insert(plans).values({ id, ...values }).onConflictDoUpdate({ target: plans.id, set: values }).returning();
    return { body: { plan: row } };
  }));

  return r;
}
