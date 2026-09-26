import { z } from 'zod';

// Toda la configuración sale del entorno. Los secretos (Stripe, contraseña de la base) se inyectan
// desde Secret Manager en Cloud Run; nunca van en el repositorio.
const Env = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(8080),
  APP_URL: z.string().default('https://waack-on.com'),
  // Únicos orígenes (webs) que pueden llamar a la API. En desarrollo añade http://localhost:5173 en tu entorno, no aquí.
  ALLOWED_ORIGINS: z.string().default('https://waack-on.com'),
  // 'true': rechaza (403) toda petición que no venga de un origen permitido (o del propio sitio). Solo apágalo para diagnosticar.
  STRICT_ORIGIN: z.enum(['true', 'false']).default('true'),
  // Firebase App Check: 'enforce' exige un token que demuestra que la petición sale de la app real (no de curl ni de un script).
  APP_CHECK: z.enum(['off', 'enforce']).default('off'),

  // PostgreSQL: DATABASE_URL (local/CI) o conexión por socket de Cloud SQL.
  DATABASE_URL: z.string().optional(),
  INSTANCE_CONNECTION_NAME: z.string().optional(), // proyecto:región:instancia (socket; requiere IP pública)
  DB_HOST: z.string().optional(), // IP privada de Cloud SQL (Direct VPC egress)
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().default('waackon'),
  RUN_MIGRATIONS: z.enum(['true', 'false']).default('false'),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // OAuth de Spotify (developer.spotify.com/dashboard). El Redirect URI apunta al FRONTEND (no a la API):
  // Firebase Hosting sirve index.html en cualquier ruta, la app lee ?code&state al arrancar y llama a
  // POST /v1/spotify/exchange ya autenticada. Debe coincidir EXACTO con el del dashboard, p. ej. APP_URL.
  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  SPOTIFY_REDIRECT_URI: z.string().optional(),

  // Correos (verificados en Firebase) que se convierten en admin al iniciar sesión. Separados por comas.
  BOOTSTRAP_ADMIN_EMAILS: z.string().default(''),

  // Base de Firestore con nombre (chat, salas, notificaciones). Se usa para sincronizar el rol.
  FIRESTORE_DB: z.string().optional(), // sin valor por defecto: se define por entorno
});

export type Config = z.infer<typeof Env>;
export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => Env.parse(env);

export const list = (csv: string) => csv.split(',').map((s) => s.trim()).filter(Boolean);

// Reparto fijo de cada suscripción a un instructor: 75% para el instructor, 25% para la plataforma.
// Igual para todos (no se negocia por instructor). Antes vivía en `plans.feePercent`; ya no se usa esa columna.
export const INSTRUCTOR_FEE_PERCENT = 25;

// Límites de precio propio que puede fijar un instructor para su cátedra (en la moneda que declare).
export const INSTRUCTOR_PRICE_MIN_CENTS = 100; // 1.00
export const INSTRUCTOR_PRICE_MAX_CENTS = 50000; // 500.00
