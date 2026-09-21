import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import type { Db } from './db/index.js';
import type { Config } from './config.js';
import type { User } from './db/schema.js';
import type Stripe from 'stripe';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }
}

// ── Contratos que se inyectan (así las pruebas no necesitan Firebase ni Stripe reales) ────────────────
export type TokenInfo = { uid: string; email?: string; emailVerified: boolean; name?: string; picture?: string };
export type VerifyToken = (idToken: string, opts?: { checkRevoked?: boolean }) => Promise<TokenInfo>;
export type SyncRole = (firebaseUid: string, role: string) => Promise<void>;

export type Deps = {
  db: Db;
  config: Config;
  verify: VerifyToken;
  syncRole: SyncRole;
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
