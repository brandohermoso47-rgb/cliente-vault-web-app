import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { adminAuth } from '../lib/firebase-admin.ts';

export type AppRole = 'free_user' | 'vip_student' | 'academy' | 'instructor';
export type PlanType = 'app_vip' | 'app_academy' | 'instructor_custom';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';

export interface AuthenticatedUser {
  id: string;
  role: AppRole;
  subscription_status?: SubscriptionStatus;
  plan_type?: PlanType;
  stripe_customer_id?: string;
  stripe_account_id?: string;
  is_connect_verified?: boolean;
  current_period_end?: string;
  subscribed_instructor_ids?: string[];
}

/**
 * Normalizes legacy and variant roles into the 4 canonical architecture roles:
 * - free_user
 * - vip_student
 * - academy
 * - instructor
 */
export function normalizeCanonicalRole(rawRole?: string, status?: string): AppRole {
  const lower = (rawRole || '').toLowerCase().trim();
  if (['instructor', 'docente', 'profesor'].includes(lower)) return 'instructor';
  if (['academy', 'academia', 'studio', 'escuela'].includes(lower)) return 'academy';
  if (['vip_student', 'vip', 'student', 'estudiante'].includes(lower)) {
    // If explicitly student with active/trialing subscription -> vip_student, otherwise free_user
    if (lower === 'vip_student' || status === 'active' || status === 'trialing') {
      return 'vip_student';
    }
    return 'free_user';
  }
  return 'free_user';
}

/**
 * SEGURIDAD (arreglo urgente): esta función solía leer el rol/estado de
 * suscripción/identidad de Stripe directamente de headers (`x-user-role`,
 * `x-user-id`, `x-subscription-status`, `x-plan-type`, `x-stripe-*`) o del
 * body — es decir, del propio cliente. Cualquiera podía declararse
 * "instructor" con suscripción activa y Stripe Connect verificado solo
 * mandando esos headers, sin ninguna verificación real. Todos los guards de
 * abajo (requireRole, requireVipAccess, requireAcademyAccess,
 * requireVerifiedInstructor, requireInstructorSubscriber) confiaban en esto.
 *
 * Ahora la única fuente de verdad es un ID token de Firebase real, verificado
 * contra el Admin SDK, y los custom claims que el propio backend escribe
 * después de un pago confirmado por webhook de Stripe (ver
 * updateUserRoleAndSubscriptionInDB en server.ts) — nunca algo que el cliente
 * pueda declarar por su cuenta.
 */
export async function verifyRequestUser(req: Request): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const claims = decoded as unknown as Record<string, unknown>;

    const rawRole = typeof claims.role === 'string' ? claims.role : undefined;
    const rawStatus = typeof claims.subscription_status === 'string' ? claims.subscription_status : undefined;
    const role = normalizeCanonicalRole(rawRole, rawStatus);
    const subscriptionStatus = (['trialing', 'active', 'past_due', 'canceled'].includes(rawStatus || '')
      ? rawStatus
      : 'canceled') as SubscriptionStatus;

    return {
      id: decoded.uid,
      role,
      subscription_status: subscriptionStatus,
      plan_type: (typeof claims.plan_type === 'string' ? claims.plan_type : 'app_vip') as PlanType,
      stripe_customer_id: typeof claims.stripe_customer_id === 'string' ? claims.stripe_customer_id : undefined,
      stripe_account_id: typeof claims.stripe_account_id === 'string' ? claims.stripe_account_id : undefined,
      is_connect_verified: claims.is_connect_verified === true,
      subscribed_instructor_ids: Array.isArray(claims.subscribed_instructor_ids)
        ? (claims.subscribed_instructor_ids as string[])
        : []
    };
  } catch (err: any) {
    console.warn('[RBAC] Failed to verify Firebase ID token:', err?.message || err);
    return null;
  }
}

/**
 * Best-effort, NON-AUTHORITATIVE identity extraction used ONLY for request
 * logging/telemetry. Values here are attacker-controlled and MUST NEVER be
 * used to make an authorization decision — use verifyRequestUser / the
 * require* guards below for anything that matters.
 */
export function getUnverifiedClientAssertedIdentity(req: Request): { id: string; role: string } {
  const roleHeader = (req.headers['x-user-role'] as string) || (req.body?.role) || 'free_user';
  const idHeader = (req.headers['x-user-id'] as string) || (req.body?.uid) || 'anonymous';
  return { id: idHeader, role: (roleHeader || '').toString().toLowerCase().trim() };
}

/**
 * Requires a valid, verified Firebase ID token, with no specific role
 * requirement. Populates `req.user` with the verified uid + server-resolved
 * role. Use this on any route that needs a trustworthy caller identity (e.g.
 * "attribute this message to me" / "only I can delete my own message") even
 * when it doesn't need a specific role.
 */
export function requireVerifiedUser(req: Request, res: Response, next: NextFunction) {
  verifyRequestUser(req).then((user) => {
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado: token de Firebase inválido o ausente',
        code: 'UNAUTHENTICATED'
      });
    }
    (req as any).user = user;
    next();
  }).catch((err) => {
    console.error('[RBAC] Unexpected error verifying user:', err);
    return res.status(401).json({ success: false, error: 'No autorizado', code: 'UNAUTHENTICATED' });
  });
}

/**
 * 1. RBAC Role Requirement Guard
 */
export function requireRole(allowedRoles: Array<AppRole | 'student' | 'guest'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    verifyRequestUser(req).then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'No autorizado: token de Firebase inválido o ausente',
          code: 'UNAUTHENTICATED'
        });
      }

      // Map legacy role aliases
      const effectiveRoles = allowedRoles.map(r => {
        if (r === 'student') return 'vip_student';
        if (r === 'guest') return 'free_user';
        return r;
      });

      if (!effectiveRoles.includes(user.role) && !allowedRoles.includes(user.role as any)) {
        console.warn(`[RBAC Guard]: Denied access to ${req.method} ${req.path} for user '${user.id}' with server-verified role '${user.role}'`);
        return res.status(403).json({
          success: false,
          error: 'Acceso denegado por el servidor (Control de Acceso Basado en Roles - RBAC)',
          details: `Se requieren permisos de [${allowedRoles.join(', ')}] para esta operación. Tu rol verificado en el servidor es '${user.role}'.`,
          code: 'FORBIDDEN_ROLE_ACCESS'
        });
      }

      (req as any).user = user;
      next();
    }).catch((err) => {
      console.error('[RBAC] Unexpected error in requireRole:', err);
      return res.status(401).json({ success: false, error: 'No autorizado', code: 'UNAUTHENTICATED' });
    });
  };
}

/**
 * 2. VIP Content Middleware Guard:
 * Regla: (role === 'vip_student' OR role === 'academy' OR role === 'instructor') AND (status === 'active' OR status === 'trialing')
 */
export function requireVipAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    verifyRequestUser(req).then((user) => {
      if (!user) {
        return res.status(401).json({ success: false, error: 'No autorizado', code: 'UNAUTHENTICATED' });
      }

      // Instructors have platform super-access to VIP content
      if (user.role === 'instructor') {
        (req as any).user = user;
        return next();
      }

      const hasEligibleRole = user.role === 'vip_student' || user.role === 'academy';
      const hasValidPaymentStatus = user.subscription_status === 'active' || user.subscription_status === 'trialing';

      if (!hasEligibleRole || !hasValidPaymentStatus) {
        return res.status(403).json({
          success: false,
          error: 'Acceso VIP Requerido',
          details: 'Esta herramienta o librería requiere una suscripción VIP activa o periodo de prueba de 4 días.',
          code: 'VIP_SUBSCRIPTION_REQUIRED',
          currentStatus: user.subscription_status,
          currentRole: user.role
        });
      }

      (req as any).user = user;
      next();
    }).catch((err) => {
      console.error('[RBAC] Unexpected error in requireVipAccess:', err);
      return res.status(401).json({ success: false, error: 'No autorizado', code: 'UNAUTHENTICATED' });
    });
  };
}

/**
 * 3. Academy Admin Dashboard Middleware Guard:
 * Regla: role === 'academy' AND (status === 'active' OR status === 'trialing')
 */
export function requireAcademyAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    verifyRequestUser(req).then((user) => {
      if (!user) {
        return res.status(401).json({ success: false, error: 'No autorizado', code: 'UNAUTHENTICATED' });
      }

      const isAcademy = user.role === 'academy';
      const hasValidPaymentStatus = user.subscription_status === 'active' || user.subscription_status === 'trialing';

      if (!isAcademy || !hasValidPaymentStatus) {
        return res.status(403).json({
          success: false,
          error: 'Panel de Administración de Academia Protegido',
          details: 'Se requiere una membresía institucional de Academia activa o en prueba.',
          code: 'ACADEMY_SUBSCRIPTION_REQUIRED',
          currentStatus: user.subscription_status,
          currentRole: user.role
        });
      }

      (req as any).user = user;
      next();
    }).catch((err) => {
      console.error('[RBAC] Unexpected error in requireAcademyAccess:', err);
      return res.status(401).json({ success: false, error: 'No autorizado', code: 'UNAUTHENTICATED' });
    });
  };
}

/**
 * 4. Instructor Creator & Payouts Guard.
 *
 * SEGURIDAD: el backend real todavía no implementa la verificación de Stripe
 * Connect (no existe ningún endpoint que confirme `is_connect_verified` u
 * `stripe_account_id` contra la API de Stripe — antes ese dato venía sin
 * validar del propio cliente). Hasta que exista esa integración real, este
 * guard falla cerrado en vez de confiar en un campo que nadie verifica.
 */
export function requireVerifiedInstructor() {
  return (req: Request, res: Response, next: NextFunction) => {
    return res.status(501).json({
      success: false,
      error: 'Verificación de Stripe Connect no implementada todavía',
      details: 'Este endpoint requiere una integración real de Stripe Connect en el servidor (confirmar is_connect_verified contra la API de Stripe, nunca contra un dato enviado por el cliente). Permanece deshabilitado hasta implementarla.',
      code: 'STRIPE_CONNECT_NOT_IMPLEMENTED'
    });
  };
}

/**
 * 5. Private Instructor Content Access Guard.
 *
 * SEGURIDAD: mismo problema — no existe ningún registro real (Firestore o
 * Postgres) de qué alumno está suscrito a qué instructor; `subscribed_instructor_ids`
 * venía del propio cliente sin validar. Falla cerrado hasta que se implemente
 * un registro real de suscripciones (p. ej. una colección/tabla poblada por
 * el webhook de Stripe, no por el cliente).
 */
export function requireInstructorSubscriber(_instructorIdParamKey: string = 'instructorId') {
  return (req: Request, res: Response, next: NextFunction) => {
    return res.status(501).json({
      success: false,
      error: 'Verificación de suscripción a instructor no implementada todavía',
      details: 'Este endpoint requiere un registro real de suscripciones (poblado por el webhook de Stripe verificado, nunca por el cliente). Permanece deshabilitado hasta implementarlo.',
      code: 'INSTRUCTOR_SUBSCRIBER_CHECK_NOT_IMPLEMENTED'
    });
  };
}

/**
 * Zod Input Sanitization & Validation Middleware.
 */
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const issues = result.error.issues.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));

      console.warn(`[Zod Input Validation Failure]: ${req.method} ${req.path}`, issues);

      return res.status(400).json({
        success: false,
        error: 'Error de validación y sanitización de datos (Zod Schema Validation)',
        issues
      });
    }

    // Replace request body with the sanitized, typed result
    req.body = result.data;
    next();
  };
}
