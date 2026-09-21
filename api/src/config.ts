import { z } from 'zod';

// Toda la configuración sale del entorno. Los secretos (Stripe, contraseña de la base) se inyectan
// desde Secret Manager en Cloud Run; nunca van en el repositorio.
const Env = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(8080),
  APP_URL: z.string().default('https://waack-on.com'),
  ALLOWED_ORIGINS: z.string().default('https://waack-on.com,https://buoyant-objective-fwjkk.web.app,http://localhost:5173'),

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

  // Correos (verificados en Firebase) que se convierten en admin al iniciar sesión. Separados por comas.
  BOOTSTRAP_ADMIN_EMAILS: z.string().default(''),

  // Base de Firestore con nombre (chat, salas, notificaciones). Se usa para sincronizar el rol.
  FIRESTORE_DB: z.string().default('ai-studio-waackonplataform-995cd1f5-e15c-4eff-aaa2-62e6d650abe1'),
});

export type Config = z.infer<typeof Env>;
export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => Env.parse(env);

export const list = (csv: string) => csv.split(',').map((s) => s.trim()).filter(Boolean);
