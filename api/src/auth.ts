import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import { getApp } from 'firebase-admin/app';
import { getAppCheck } from 'firebase-admin/app-check';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { schema } from './db/index.js';
import { withContext } from './db/context.js';
import { HttpError, type ClassOwnedBy, type Deps, type SyncRole, type VerifyToken } from './http.js';
import type { Config } from './config.js';
import type { Role } from './db/schema.js';

// Verificación real del ID token de Firebase Auth (en Cloud Run usa las credenciales de la cuenta de servicio).
export const firebaseVerifier = (): VerifyToken => async (idToken, opts) => {
  const d = await getAuth().verifyIdToken(idToken, opts?.checkRevoked === true);
  return { uid: d.uid, email: d.email, emailVerified: d.email_verified === true, name: d.name as string | undefined, picture: d.picture };
};

// Mantiene coherentes el rol de Postgres, el custom claim de Firebase y el perfil de Firestore (que usan las reglas).
export const firebaseRoleSync = (cfg: Config): SyncRole => async (uid, role) => {
  if (!cfg.FIRESTORE_DB) throw new Error('Falta FIRESTORE_DB (ID de la base de Firestore) para sincronizar el rol.');
  await getAuth().setCustomUserClaims(uid, { role });
  await getFirestore(getApp(), cfg.FIRESTORE_DB).collection('users').doc(uid).set({ role }, { merge: true });
};

export const firestoreClassOwnership = (cfg: Config): ClassOwnedBy => async (uid, classId) => {
  if (!cfg.FIRESTORE_DB) throw new Error('Falta FIRESTORE_DB (ID de la base de Firestore) para comprobar clases.');
  const snap = await getFirestore(getApp(), cfg.FIRESTORE_DB).collection('users').doc(uid).collection('classes').doc(classId).get();
  return snap.exists;
};

// App Check: comprueba que el token lo emitió Firebase para ESTA app (reCAPTCHA Enterprise / v3).
export const firebaseAppCheckVerifier = () => async (token: string): Promise<void> => { await getAppCheck().verifyToken(token); };

const bearer = (h?: string) => (h && h.startsWith('Bearer ') ? h.slice(7).trim() : '');

// Exige un ID token válido y (por defecto) carga la fila de usuario de Postgres en req.user.
export const withAuth = (deps: Deps, opts: { loadUser?: boolean; checkRevoked?: boolean } = {}): RequestHandler => (req, _res, next) => {
  (async () => {
    const raw = bearer(req.headers.authorization);
    if (!raw) throw new HttpError(401, 'unauthenticated', 'Falta el token de sesión.');
    try {
      req.token = await deps.verify(raw, { checkRevoked: opts.checkRevoked === true });
    } catch {
      throw new HttpError(401, 'invalid_token', 'Sesión no válida o caducada.');
    }
    if (opts.loadUser ?? true) {
      // Aún no sabemos quién es: la búsqueda por UID de Firebase es la única consulta que se hace como 'system'.
      const uid = req.token.uid;
      const [u] = await withContext(deps.db, { role: 'system' }, (db) => db.select().from(schema.users).where(eq(schema.users.firebaseUid, uid)).limit(1));
      if (!u) throw new HttpError(409, 'no_session', 'Primero llama a POST /v1/session.');
      req.user = u;
    }
  })().then(() => next(), next);
};

export const requireRole = (...roles: Role[]): RequestHandler => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new HttpError(403, 'forbidden', 'No tienes permiso para esta acción.'));
  next();
};

// Acciones sensibles (pagar, pedir un rol profesional, cobrar) exigen correo verificado:
// evita registrar el correo de otra persona con una contraseña propia.
export const requireVerifiedEmail: RequestHandler = (req, _res, next) => {
  if (!req.token?.emailVerified) return next(new HttpError(403, 'email_not_verified', 'Verifica tu correo electrónico para continuar.'));
  next();
};
