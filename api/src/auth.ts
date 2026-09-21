import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { schema } from './db/index.js';
import { HttpError, type Deps, type SyncRole, type VerifyToken } from './http.js';
import type { Config } from './config.js';
import type { Role } from './db/schema.js';

// Verificación real del ID token de Firebase Auth (en Cloud Run usa las credenciales de la cuenta de servicio).
export const firebaseVerifier = (): VerifyToken => async (idToken) => {
  const d = await getAuth().verifyIdToken(idToken);
  return { uid: d.uid, email: d.email, emailVerified: d.email_verified === true, name: d.name as string | undefined, picture: d.picture };
};

// Mantiene coherentes el rol de Postgres, el custom claim de Firebase y el perfil de Firestore (que usan las reglas).
export const firebaseRoleSync = (cfg: Config): SyncRole => async (uid, role) => {
  await getAuth().setCustomUserClaims(uid, { role });
  await getFirestore(getApp(), cfg.FIRESTORE_DB).collection('users').doc(uid).set({ role }, { merge: true });
};

const bearer = (h?: string) => (h && h.startsWith('Bearer ') ? h.slice(7).trim() : '');

// Exige un ID token válido y (por defecto) carga la fila de usuario de Postgres en req.user.
export const withAuth = (deps: Deps, opts: { loadUser?: boolean } = {}): RequestHandler => (req, _res, next) => {
  (async () => {
    const raw = bearer(req.headers.authorization);
    if (!raw) throw new HttpError(401, 'unauthenticated', 'Falta el token de sesión.');
    try {
      req.token = await deps.verify(raw);
    } catch {
      throw new HttpError(401, 'invalid_token', 'Sesión no válida o caducada.');
    }
    if (opts.loadUser ?? true) {
      const [u] = await deps.db.select().from(schema.users).where(eq(schema.users.firebaseUid, req.token.uid)).limit(1);
      if (!u) throw new HttpError(409, 'no_session', 'Primero llama a POST /v1/session.');
      req.user = u;
    }
  })().then(() => next(), next);
};

export const requireRole = (...roles: Role[]): RequestHandler => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new HttpError(403, 'forbidden', 'No tienes permiso para esta acción.'));
  next();
};
