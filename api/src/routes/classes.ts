import { and, asc, eq } from 'drizzle-orm';
import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { requireRole, withAuth } from '../auth.js';
import { schema } from '../db/index.js';
import { handle, HttpError, parse, type Deps } from '../http.js';

const { figureEvents } = schema;

export const MAX_FIGURE_EVENTS = 3000;
const EFFECT_TYPES = ['torso_grid', 'arm_line', 'elbow_triangle', 'grid_points', 'rotation_arc', 'wrist_trail', 'pose_echo'] as const;

// IDs de documento de Firestore (los genera addDoc: 20 caracteres alfanuméricos).
const classParams = z.object({ classId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/) });
// Coordenadas normalizadas; se admite un margen porque la rejilla puede salirse un poco del cuadro.
const coord = z.number().finite().min(-2).max(3);
const keyframe = z.object({
  t: z.number().int().min(0),
  pts: z.record(z.string().max(16), z.object({ x: coord, y: coord })),
  v: z.record(z.string().max(16), z.number().finite()).optional(),
});
const eventInput = z.object({
  type: z.enum(EFFECT_TYPES),
  side: z.enum(['L', 'R']).optional(),
  startMs: z.number().int().min(0),
  endMs: z.number().int().min(1),
  params: z.object({ keyframes: z.array(keyframe).min(1).max(20000) }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  editedManually: z.boolean(),
}).refine((e) => e.endMs > e.startMs, { message: 'endMs debe ser mayor que startMs' });
const putBody = z.object({ events: z.array(eventInput).max(MAX_FIGURE_EVENTS) });

const toClient = (r: typeof figureEvents.$inferSelect) => ({
  id: r.id,
  type: r.effectType,
  ...(r.side ? { side: r.side } : {}),
  startMs: r.startMs,
  endMs: r.endMs,
  params: r.params,
  ...(r.color ? { color: r.color } : {}),
  editedManually: r.editedManually,
});

// Eventos de figura del editor de movimiento. RLS limita cada fila a quien la creó.
export function classesRouter(deps: Deps) {
  const r = Router();

  r.get('/classes/:classId/figure-events', withAuth(deps), handle(deps, 'user', async ({ req, db }) => {
    const { classId } = parse(classParams, req.params);
    const rows = await db.select().from(figureEvents)
      .where(and(eq(figureEvents.classId, classId), eq(figureEvents.createdBy, req.user!.id)))
      .orderBy(asc(figureEvents.startMs));
    return { body: { events: rows.map(toClient) } };
  }));

  // Se comprueba en Firestore antes de abrir la transacción de Postgres.
  const ownsClass: RequestHandler = (req, _res, next) => {
    const { classId } = parse(classParams, req.params);
    deps.classOwnedBy(req.token!.uid, classId).then(
      (owned) => next(owned ? undefined : new HttpError(404, 'class_not_found', 'No encontramos esa clase en tu panel.')),
      next,
    );
  };

  r.put('/classes/:classId/figure-events', withAuth(deps), requireRole('instructor', 'estudio', 'admin'), ownsClass, handle(deps, 'user', async ({ req, db }) => {
    const { classId } = parse(classParams, req.params);
    const { events } = parse(putBody, req.body);
    const userId = req.user!.id;
    // handle() ya corre dentro de una transacción: borrar + insertar es atómico.
    await db.delete(figureEvents).where(and(eq(figureEvents.classId, classId), eq(figureEvents.createdBy, userId)));
    const rows = events.length
      ? await db.insert(figureEvents).values(events.map((e) => ({
        classId,
        effectType: e.type,
        side: e.side ?? null,
        startMs: e.startMs,
        endMs: e.endMs,
        params: e.params,
        color: e.color ?? null,
        createdBy: userId,
        editedManually: e.editedManually,
      }))).returning()
      : [];
    rows.sort((a, b) => a.startMs - b.startMs);
    return { body: { events: rows.map(toClient) } };
  }));

  return r;
}
