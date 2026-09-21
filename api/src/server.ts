import { initializeApp } from 'firebase-admin/app';
import Stripe from 'stripe';
import { createApp } from './app.js';
import { firebaseRoleSync, firebaseVerifier } from './auth.js';
import { loadConfig } from './config.js';
import { createDb, createPool } from './db/index.js';
import { runMigrations } from './db/migrate.js';

const config = loadConfig();
initializeApp(); // credenciales por defecto de la cuenta de servicio de Cloud Run

const pool = createPool(config);
if (config.RUN_MIGRATIONS === 'true') await runMigrations(pool);

const app = createApp({
  db: createDb(pool),
  config,
  verify: firebaseVerifier(),
  syncRole: firebaseRoleSync(config),
  stripe: config.STRIPE_SECRET_KEY ? new Stripe(config.STRIPE_SECRET_KEY) : undefined,
});

const server = app.listen(config.PORT, () => console.log(`Waack On API escuchando en :${config.PORT}`));

// Cloud Run envía SIGTERM al reducir instancias: cerramos con orden.
process.on('SIGTERM', () => { server.close(() => pool.end().finally(() => process.exit(0))); });
