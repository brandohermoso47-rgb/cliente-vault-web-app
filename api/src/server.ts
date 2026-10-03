import { initializeApp } from 'firebase-admin/app';
import Stripe from 'stripe';
import { createApp } from './app.js';
import { firebaseAppCheckVerifier, firebaseRoleSync, firebaseVerifier, firestoreClassOwnership } from './auth.js';
import { loadConfig } from './config.js';
import { createDb, createPool } from './db/index.js';
import { assertRlsEverywhere } from './db/context.js';
import { runMigrations } from './db/migrate.js';

const config = loadConfig();
initializeApp(); // credenciales por defecto de la cuenta de servicio de Cloud Run

const pool = createPool(config);
if (config.RUN_MIGRATIONS === 'true') await runMigrations(pool);

const db = createDb(pool);
await assertRlsEverywhere(db); // no arrancamos si alguna tabla quedó sin Row Level Security

const app = createApp({
  db,
  config,
  verify: firebaseVerifier(),
  syncRole: firebaseRoleSync(config),
  classOwnedBy: firestoreClassOwnership(config),
  verifyAppCheck: config.APP_CHECK === 'enforce' ? firebaseAppCheckVerifier() : undefined,
  stripe: config.STRIPE_SECRET_KEY ? new Stripe(config.STRIPE_SECRET_KEY) : undefined,
});

const server = app.listen(config.PORT, () => console.log(`Waack On API escuchando en :${config.PORT}`));

// Cloud Run envía SIGTERM al reducir instancias: cerramos con orden.
process.on('SIGTERM', () => { server.close(() => pool.end().finally(() => process.exit(0))); });
