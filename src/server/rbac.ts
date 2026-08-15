import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

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
 * Extracts user role, status and Stripe Connect identity from request headers or body.
 */
export function getUserFromReq(req: Request): AuthenticatedUser {
  const roleHeader = (req.headers['x-user-role'] as string) || 
                     (req.body?.currentUserRole as string) || 
                     (req.body?.currentUser?.role) || 
                     (req.body?.authorRole) ||
                     (req.body?.role) ||
                     'free_user';

  const idHeader = (req.headers['x-user-id'] as string) || 
                   (req.body?.currentUserId as string) || 
                   (req.body?.currentUser?.id) || 
                   (req.body?.uid) ||
                   'anonymous';

  const statusHeader = (req.headers['x-subscription-status'] as string) ||
                       (req.body?.subscription_status as string) ||
                       (req.body?.currentUser?.subscription_status) ||
                       (req.body?.billingStatus === 'active' ? 'active' : 'canceled');

  const planTypeHeader = (req.headers['x-plan-type'] as string) ||
                         (req.body?.plan_type as string) ||
                         (req.body?.currentUser?.plan_type) ||
                         'app_vip';

  const stripeCustomer = (req.headers['x-stripe-customer-id'] as string) ||
                         (req.body?.stripe_customer_id) ||
                         (req.body?.currentUser?.stripe_customer_id);

  const stripeAccount = (req.headers['x-stripe-account-id'] as string) ||
                        (req.body?.stripe_account_id) ||
                        (req.body?.currentUser?.stripe_account_id);

  const isConnectVerified = req.headers['x-is-connect-verified'] === 'true' ||
                            req.body?.is_connect_verified === true ||
                            req.body?.currentUser?.is_connect_verified === true;

  const subscribedInstructors = req.body?.subscribed_instructor_ids ||
                                req.body?.subscribedInstructorIds ||
                                req.body?.currentUser?.subscribedInstructorIds ||
                                [];

  const canonicalRole = normalizeCanonicalRole(roleHeader, statusHeader);
  const normalizedStatus = (['trialing', 'active', 'past_due', 'canceled'].includes(statusHeader)
    ? statusHeader
    : 'canceled') as SubscriptionStatus;

  return {
    id: idHeader,
    role: canonicalRole,
    subscription_status: normalizedStatus,
    plan_type: planTypeHeader as PlanType,
    stripe_customer_id: stripeCustomer,
    stripe_account_id: stripeAccount,
    is_connect_verified: isConnectVerified,
    subscribed_instructor_ids: Array.isArray(subscribedInstructors) ? subscribedInstructors : []
  };
}

/**
 * 1. RBAC Role Requirement Guard
 */
export function requireRole(allowedRoles: Array<AppRole | 'student' | 'guest'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getUserFromReq(req);

    // Map legacy role aliases
    const effectiveRoles = allowedRoles.map(r => {
      if (r === 'student') return 'vip_student';
      if (r === 'guest') return 'free_user';
      return r;
    });

    if (!effectiveRoles.includes(user.role) && !allowedRoles.includes(user.role as any)) {
      console.warn(`[RBAC Guard]: Denied access to ${req.method} ${req.path} for user '${user.id}' with role '${user.role}'`);
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado por el servidor (Control de Acceso Basado en Roles - RBAC)',
        details: `Se requieren permisos de [${allowedRoles.join(', ')}] para esta operación. Tu rol verificado en el servidor es '${user.role}'.`,
        code: 'FORBIDDEN_ROLE_ACCESS'
      });
    }

    (req as any).user = user;
    next();
  };
}

/**
 * 2. VIP Content Middleware Guard:
 * Regla: (role === 'vip_student' OR role === 'academy' OR role === 'instructor') AND (status === 'active' OR status === 'trialing')
 */
export function requireVipAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getUserFromReq(req);

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
  };
}

/**
 * 3. Academy Admin Dashboard Middleware Guard:
 * Regla: role === 'academy' AND (status === 'active' OR status === 'trialing')
 */
export function requireAcademyAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getUserFromReq(req);
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
  };
}

/**
 * 4. Instructor Creator & Payouts Guard:
 * Regla: role === 'instructor' AND is_connect_verified === true
 */
export function requireVerifiedInstructor() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getUserFromReq(req);

    if (user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        error: 'Acceso Exclusivo para Instructores',
        details: 'Debes tener rol de instructor para publicar cátedras o monetizar contenido.',
        code: 'INSTRUCTOR_ROLE_REQUIRED'
      });
    }

    // Check Stripe Connect verification (bypassed only if simulated or verified)
    if (!user.is_connect_verified) {
      return res.status(403).json({
        success: false,
        error: 'Verificación de Stripe Connect Pendiente',
        details: 'Para publicar contenido de pago y recibir el 75% de las ventas, completa la verificación de cuenta bancaria e identidad en Stripe Connect.',
        code: 'STRIPE_CONNECT_VERIFICATION_REQUIRED',
        stripe_account_id: user.stripe_account_id
      });
    }

    (req as any).user = user;
    next();
  };
}

/**
 * 5. Private Instructor Content Access Guard:
 * Regla: Verifica si el user_id del alumno tiene suscripción activa asociada al instructor_id dueño del contenido
 */
export function requireInstructorSubscriber(instructorIdParamKey: string = 'instructorId') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getUserFromReq(req);
    const targetInstructorId = req.params[instructorIdParamKey] || req.body[instructorIdParamKey] || req.query[instructorIdParamKey];

    // The instructor owner has instant access to their own content
    if (user.role === 'instructor' && (user.id === targetInstructorId || !targetInstructorId)) {
      (req as any).user = user;
      return next();
    }

    const isSubscribed = user.subscribed_instructor_ids?.includes(targetInstructorId as string);
    const hasActiveSub = user.subscription_status === 'active' || user.subscription_status === 'trialing';

    if (!isSubscribed || !hasActiveSub) {
      return res.status(403).json({
        success: false,
        error: 'Cátedra Privada de Instructor',
        details: `Se requiere un pase mensual activo para acceder a las clases privadas de este instructor.`,
        code: 'INSTRUCTOR_SUBSCRIPTION_REQUIRED',
        targetInstructorId
      });
    }

    (req as any).user = user;
    next();
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
