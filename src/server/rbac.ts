import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export interface AuthenticatedUser {
  id: string;
  role: 'instructor' | 'student' | 'guest';
}

/**
 * Extracts user role and ID from request headers or body.
 * Checks 'x-user-role' & 'x-user-id' headers first, then body payloads.
 */
export function getUserFromReq(req: Request): AuthenticatedUser {
  const roleHeader = (req.headers['x-user-role'] as string) || 
                     (req.body?.currentUserRole as string) || 
                     (req.body?.currentUser?.role) || 
                     (req.body?.authorRole) ||
                     (req.body?.role) ||
                     'student';

  const idHeader = (req.headers['x-user-id'] as string) || 
                   (req.body?.currentUserId as string) || 
                   (req.body?.currentUser?.id) || 
                   (req.body?.uid) ||
                   'anonymous';

  const normalizedRole = (roleHeader || '').toLowerCase().trim() as 'instructor' | 'student' | 'guest';
  return {
    id: idHeader,
    role: ['instructor', 'student', 'guest'].includes(normalizedRole) ? normalizedRole : 'student'
  };
}

/**
 * RBAC Authorization Middleware.
 * Enforces backend role requirements (e.g. ['instructor']).
 * Rejects unauthorized role access with HTTP 403 Forbidden.
 */
export function requireRole(allowedRoles: Array<'instructor' | 'student' | 'guest'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getUserFromReq(req);

    if (!allowedRoles.includes(user.role)) {
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
 * Zod Input Sanitization & Validation Middleware.
 * Validates request body against the specified Zod schema.
 * Rejects invalid inputs with HTTP 400 Bad Request and detailed issues.
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
