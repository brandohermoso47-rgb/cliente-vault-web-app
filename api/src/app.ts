import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { list } from './config.js';
import { errorHandler, HttpError, wrap, type Deps } from './http.js';
import { adminRouter } from './routes/admin.js';
import { billingRouter } from './routes/billing.js';
import { usersRouter } from './routes/users.js';
import { processStripeEvent } from './stripeEvents.js';

// Fábrica de la aplicación: recibe sus dependencias (base de datos, Firebase, Stripe) para poder probarla.
export function createApp(deps: Deps) {
  const app = express();
  app.set('trust proxy', 1); // detrás del balanceador de Cloud Run
  app.disable('x-powered-by');
  app.use(helmet());

  const origins = list(deps.config.ALLOWED_ORIGINS);
  app.use(cors({
    origin: (origin, cb) => cb(null, !origin || origins.includes(origin)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 600,
  }));

  app.get('/healthz', (_req, res) => { res.json({ ok: true }); });

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
    const result = await processStripeEvent(db, event);
    res.json({ received: true, result });
  }));

  app.use(express.json({ limit: '100kb' }));
  app.use('/api/v1', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-7', legacyHeaders: false }));

  // Más estricto en lo que cuesta dinero o cambia permisos.
  const strict = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false });
  app.use(['/api/v1/billing', '/api/v1/connect', '/api/v1/applications', '/api/v1/admin'], strict);

  app.use('/api/v1', usersRouter(deps));
  app.use('/api/v1', billingRouter(deps));
  app.use('/api/v1/admin', adminRouter(deps));

  app.use((_req, _res, next) => next(new HttpError(404, 'not_found', 'Ruta no encontrada.')));
  app.use(errorHandler);
  return app;
}
