import { inArray } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import { withAuth } from '../auth.js';
import { elevate } from '../db/context.js';
import { schema } from '../db/index.js';
import { handle, parse, type Deps } from '../http.js';

const { users, instructorPricing, payoutAccounts } = schema;

const queryParams = z.object({ q: z.string().trim().max(80).optional() });

// Directorio público de instructores: nombre, especialidad (bio corta), precio propio y si ya puede
// cobrar. Solo lectura; nadie ve aquí nada que no muestre ya la ficha pública de cada instructor.
export function instructorsRouter(deps: Deps) {
  const r = Router();

  r.get('/instructors', withAuth(deps), handle(deps, 'user', async ({ req, db }) => {
    const { q } = parse(queryParams, req.query);
    // Listar instructores de otras personas requiere pasar por 'system': con RLS normal cada quien
    // solo ve su propia fila en `users`.
    const rows = await elevate(db, async () => {
      const staff = await db.select({ id: users.id, name: users.displayName, handle: users.handle, bio: users.bio, photoUrl: users.photoUrl, countryCode: users.countryCode })
        .from(users)
        .where(inArray(users.role, ['instructor', 'estudio', 'admin']));
      if (!staff.length) return [];
      const ids = staff.map((s) => s.id);
      const [pricingRows, payoutRows] = await Promise.all([
        db.select().from(instructorPricing).where(inArray(instructorPricing.userId, ids)),
        db.select({ userId: payoutAccounts.userId, chargesEnabled: payoutAccounts.chargesEnabled }).from(payoutAccounts).where(inArray(payoutAccounts.userId, ids)),
      ]);
      const pricingByUser = new Map(pricingRows.map((p) => [p.userId, p]));
      const chargesByUser = new Map(payoutRows.map((p) => [p.userId, p.chargesEnabled]));
      return staff.map((s) => {
        const pricing = pricingByUser.get(s.id);
        return {
          id: s.id,
          name: s.name,
          handle: s.handle,
          specialty: s.bio,
          photoUrl: s.photoUrl,
          countryCode: s.countryCode,
          priceMonthlyCents: pricing?.priceMonthlyCents ?? null,
          currency: pricing?.currency ?? null,
          chargesEnabled: !!chargesByUser.get(s.id),
        };
      });
    });

    const term = q?.toLowerCase();
    const filtered = term
      ? rows.filter((r) => (r.name ?? '').toLowerCase().includes(term) || (r.handle ?? '').toLowerCase().includes(term) || (r.specialty ?? '').toLowerCase().includes(term))
      : rows;
    return { body: { instructors: filtered } };
  }));

  return r;
}
