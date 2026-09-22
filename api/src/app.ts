import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { list } from './config.js';
import { errorHandler, HttpError, wrap, type Deps } from './http.js';
import { adminRouter } from './routes/admin.js';
import { billingRouter } from './routes/billing.js';
import { instructorsRouter } from './routes/instructors.js';
import { usersRouter } from './routes/users.js';
import { withContext } from './db/context.js';
import { processStripeEvent } from './stripeEvents.js';

// Fábrica de la aplicación: recibe sus dependencias (base de datos, Firebase, Stripe) para poder probarla.
export function createApp(deps: Deps) {
  if (deps.config.APP_CHECK === 'enforce' && !deps.verifyAppCheck) throw new Error('APP_CHECK=enforce requiere un verificador de App Check.');
  const app = express();
  app.set('trust proxy', 1); // detrás del balanceador de Cloud Run
  app.disable('x-powered-by');
  app.use(helmet());

  const origins = list(deps.config.ALLOWED_ORIGINS);
  const originAllowed = (o?: string) => !!o && origins.includes(o);
  const originOf = (url?: string) => { try { return url ? new URL(url).origin : undefined; } catch { return undefined; } };
  app.use(cors({
    origin: (origin, cb) => cb(null, !origin || originAllowed(origin)), // los orígenes no permitidos no reciben cabeceras CORS
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Firebase-AppCheck'],
    maxAge: 600,
  }));

  app.get('/api/health', (_req, res) => { res.json({ ok: true }); });

  // Webhook de Stripe: necesita el cuerpo SIN parsear para verificar la firma, así que va antes de express.json().
  app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json', limit: '1mb' }), wrap(async (req, res) => {
    const { stripe, config, db } = deps;
    if (!stripe || !config.STRIPE_WEBHOOK_SECRET) throw new HttpError(503, 'payments_disabled', 'Los pagos todavía no están activados.');
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, String(req.headers['stripe-signature'] ?? ''), config.STRIPE_WEBHOOK_SECRET);
    } catch {
      throw new HttpError(400, 'invalid_signature', 'Firma no válida.');
    }
    // Solo el sistema escribe suscripciones y pagos; el evento y su marca de "procesado" van en la misma transacción.
    const result = await withContext(db, { role: 'system' }, (tx) => processStripeEvent(tx, event));
    res.json({ received: true, result });
  }));

  // ── Solo mi app ────────────────────────────────────────────────────────────────────────────────────
  // CORS por sí solo solo "avisa" al navegador; aquí el servidor RECHAZA lo que no venga de la app.
  // (Health y el webhook de Stripe, que va firmado, quedan fuera: se registraron antes.)
  app.use('/api/v1', (req, _res, next) => {
    if (deps.config.STRICT_ORIGIN === 'false') return next();
    const origin = req.headers.origin;
    if (origin !== undefined) return originAllowed(origin) ? next() : next(new HttpError(403, 'origin_not_allowed', 'Origen no permitido.')); // incluye "null"
    // Sin Origin: un GET del propio sitio (los navegadores no lo envían en peticiones del mismo origen).
    if (req.headers['sec-fetch-site'] === 'same-origin') return next();
    if (originAllowed(originOf(req.headers.referer))) return next();
    next(new HttpError(403, 'origin_not_allowed', 'Origen no permitido.'));
  });

  // App Check: demuestra que la petición sale de la app real y no de un script.
  app.use('/api/v1', (req, _res, next) => {
    if (deps.config.APP_CHECK !== 'enforce') return next();
    const token = req.headers['x-firebase-appcheck'];
    if (typeof token !== 'string' || !token || !deps.verifyAppCheck) return next(new HttpError(401, 'app_check_required', 'Falta la verificación de la aplicación.'));
    deps.verifyAppCheck(token).then(() => next(), () => next(new HttpError(401, 'app_check_invalid', 'Verificación de la aplicación no válida.')));
  });

  app.use(express.json({ limit: '100kb' }));
  app.use('/api/v1', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-7', legacyHeaders: false }));

  // Más estricto en lo que cuesta dinero o cambia permisos.
  const strict = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false });
  app.use(['/api/v1/billing', '/api/v1/connect', '/api/v1/applications', '/api/v1/admin'], strict);

  app.use('/api/v1', usersRouter(deps));
  app.use('/api/v1', billingRouter(deps));
  app.use('/api/v1', instructorsRouter(deps));
  app.use('/api/v1/admin', adminRouter(deps));

  app.use((_req, _res, next) => next(new HttpError(404, 'not_found', 'Ruta no encontrada.')));
  app.use(errorHandler);
  return app;
}
