import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import type { Db } from './db/index.js';
import type { Config } from './config.js';
import type { User } from './db/schema.js';
import type Stripe from 'stripe';
import { withContext, type Ctx } from './db/context.js';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }
}

// ── Contratos que se inyectan (así las pruebas no necesitan Firebase ni Stripe reales) ────────────────
export type TokenInfo = { uid: string; email?: string; emailVerified: boolean; name?: string; picture?: string };
export type VerifyToken = (idToken: string, opts?: { checkRevoked?: boolean }) => Promise<TokenInfo>;
export type SyncRole = (firebaseUid: string, role: string) => Promise<void>;
// ¿Existe users/{firebaseUid}/classes/{classId} en Firestore? (las clases viven allí, no en Postgres)
export type ClassOwnedBy = (firebaseUid: string, classId: string) => Promise<boolean>;

export type Deps = {
  db: Db;
  config: Config;
  verify: VerifyToken;
  syncRole: SyncRole;
  classOwnedBy: ClassOwnedBy;
  verifyAppCheck?: (token: string) => Promise<void>;
  stripe?: Stripe;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      token?: TokenInfo;
      user?: User;
    }
  }
}

export const wrap = (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { fn(req, res).catch(next); };

export function parse<T>(schema: ZodType<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success) throw new HttpError(400, 'invalid_request', r.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; '));
  return r.data;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) { res.status(err.status).json({ error: err.code, message: err.message }); return; }
  if (err instanceof ZodError) { res.status(400).json({ error: 'invalid_request', message: err.message }); return; }
  // Errores del parser (JSON mal formado, cuerpo demasiado grande, etc.): son culpa del cliente, no un 500.
  const status = (err as { status?: number; statusCode?: number } | null)?.status ?? (err as { statusCode?: number } | null)?.statusCode;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    res.status(status).json({ error: status === 413 ? 'payload_too_large' : 'bad_request', message: status === 413 ? 'El cuerpo de la petición es demasiado grande.' : 'Petición mal formada.' });
    return;
  }
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'internal', message: 'Error interno del servidor.' });
}

// Respuesta que devuelve un manejador transaccional.
export type Reply = { status?: number; body: unknown };

// Ejecuta el manejador DENTRO de una transacción con el contexto de seguridad de la persona (Row Level Security).
// El commit ocurre ANTES de enviar la respuesta; si el manejador lanza un error, se hace rollback de todo.
//  - 'user'  : exige sesión con usuario (req.user); solo verá y tocará sus filas (o las de admin si lo es).
//  - 'system': para el inicio de sesión y el webhook de Stripe.
export function handle(deps: Deps, kind: 'user' | 'system', fn: (c: { req: Request; db: Db }) => Promise<Reply>): RequestHandler {
  return (req, res, next) => {
    (async () => {
      let ctx: Ctx;
      if (kind === 'system') ctx = { role: 'system' };
      else {
        if (!req.user) throw new HttpError(401, 'unauthenticated', 'Falta la sesión.');
        ctx = { userId: req.user.id, role: req.user.role === 'admin' ? 'admin' : 'user' };
      }
      const reply = await withContext(deps.db, ctx, (db) => fn({ req, db }));
      res.status(reply.status ?? 200).json(reply.body);
    })().catch(next);
  };
}
