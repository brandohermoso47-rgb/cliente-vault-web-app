# Backend (API) — Express + PostgreSQL + Stripe

```
Navegador ──(Firebase Hosting)──► React SPA
     │  /api/**  (rewrite de Hosting, mismo dominio, sin CORS)
     ▼
Cloud Run: api/ (Express)  ──► Cloud SQL (PostgreSQL, Drizzle)   usuarios · solicitudes · planes · suscripciones · pagos
     │                    ├─► Firebase Auth (verifica el ID token)
     │                    ├─► Firestore (rol sincronizado; chat/batallas/notificaciones viven ahí)
     └─ webhook Stripe ◄──┘   Stripe Checkout / Connect / Portal
```

Qué vive dónde: **PostgreSQL** = lo transaccional y lo que hay que proteger (usuarios, roles, solicitudes,
planes, suscripciones, pagos). **Firestore** = tiempo real (chat, salas de batalla, notificaciones) y el perfil
público que ya usa la app. El rol se guarda en PostgreSQL y la API lo copia a un *custom claim* de Firebase y al
perfil de Firestore, para que las reglas lo entiendan.

## Desarrollo local
```bash
cd api
npm install
npm test                 # 48 pruebas contra un PostgreSQL embebido (PGlite); no hace falta Firebase ni Stripe
export DATABASE_URL=postgres://localhost:5432/waackon   # la contraseña, si la hay, va en PGPASSWORD (nunca en el código)
export ALLOWED_ORIGINS=http://localhost:5173           # solo desarrollo
export FIRESTORE_DB=<ID-de-tu-base-de-Firestore>
npm run db:migrate
npm run dev              # http://localhost:8080  (el frontend la proxea en /api)
```
Cambios de esquema: edita `api/src/db/schema.ts` y ejecuta `npm run db:generate` (crea una migración SQL en `api/drizzle/`).

## Row Level Security (PostgreSQL)
La base de datos decide qué filas puede ver y modificar cada persona, **para todos los usuarios** (usuario, instructor, estudio y admin), aunque una
ruta de la API olvide un `WHERE`. Está en `api/drizzle/0002_row_level_security.sql` y se prueba en `api/test/rls.test.ts`.

- Cada petición corre en **una transacción** con `SET LOCAL ROLE waackon_rt` (rol sin privilegios ni `BYPASSRLS`) y dos variables:
  `app.user_id` y `app.role` (`user` | `admin` | `system`). Ver `api/src/db/context.ts` (`withContext`, `elevate`).
- **Usuarios, instructores y estudios:** solo ven y editan sus propias filas (perfil, solicitud, suscripciones, pagos, cuenta de cobro).
- **Admin:** además gestiona usuarios, solicitudes y planes, pero **no ve pagos, suscripciones ni cuentas de cobro de otras personas**.
- **`system`:** solo inicio de sesión y webhook de Stripe. Cada uso de `elevate()` es una excepción explícita y de solo lectura.
- **Sin contexto no se ve nada** (falla cerrado). Nadie puede cambiarse el rol ni la identidad: lo impide un disparador (`users_guard`),
  también para acceso directo a la base. Si un DBA necesita cambiar un rol a mano: `SET app.role = 'system';` antes.
- El arranque de la API **falla si alguna tabla del esquema público no tiene RLS activo y forzado**: al crear tablas nuevas añade sus políticas en una migración.
- Firestore y Storage tienen sus propias reglas (`firestore.rules`, `storage.rules`), probadas con `npm run test:rules`.

## Solo mi app (CORS estricto + App Check)
- **Origen:** la API responde `403 origin_not_allowed` a cualquier petición cuyo `Origin` no esté en `ALLOWED_ORIGINS`
  (o que no venga del propio sitio: `Sec-Fetch-Site: same-origin` / `Referer` permitido). No solo omite cabeceras CORS: rechaza.
  Health (`/api/health`) y el webhook de Stripe (va firmado) están exentos. Para desarrollo local añade `http://localhost:5173` en tu entorno.
- **App Check** (lo que de verdad demuestra que la petición sale de tu app y no de un script): activa App Check en Firebase Console
  (reCAPTCHA Enterprise), pon la clave del sitio en `VITE_APPCHECK_SITE_KEY` y despliega la API con `APP_CHECK=enforce`.
  Actívalo también para Firestore y Storage en la consola. Sin clave, la app funciona igual (modo `off`).

## Secretos: nunca en el código
Las credenciales viven en **Secret Manager** (`DB_PASSWORD`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) y en variables de entorno.
`npm run scan:secrets` busca claves, tokens y contraseñas en los archivos versionados (el hook `.githooks/pre-commit` lo hace en cada commit:
`git config core.hooksPath .githooks`). La clave web de Firebase (`VITE_FIREBASE_API_KEY`) es un identificador público, pero se mantiene
en `.env.local` (fuera de Git) y conviene restringirla por referer en Google Cloud → APIs y servicios → Credenciales.

## Endpoints (`/api/v1`)
| Método y ruta | Quién | Para qué |
| --- | --- | --- |
| `POST /session` | sesión iniciada | Crea/recupera el usuario en PostgreSQL. El primer admin se decide aquí |
| `GET /me`, `PATCH /me` | usuario | Perfil, rol, solicitud, suscripciones, cobros. El rol **no** se puede enviar |
| `POST /applications` | usuario | Solicitar cuenta de instructor o estudio/academia |
| `GET /plans` | usuario | Catálogo de planes activos (sin IDs de Stripe) |
| `POST /billing/checkout` · `/billing/portal` | usuario | Stripe Checkout y portal de facturación |
| `POST /connect/onboarding` | instructor/estudio/admin | Alta en Stripe Connect para cobrar |
| `POST /webhooks/stripe` | Stripe | Firma verificada; idempotente |
| `GET /admin/applications`, `POST /admin/applications/:id/decision` | admin | Aprobar o rechazar solicitudes (cambia el rol) |
| `POST /admin/users/:id/role`, `GET/PUT /admin/plans/:id` | admin | Roles y catálogo de planes |

## Región de despliegue
Este proyecto tiene la cuota `MaxRegionsPerProject` de Cloud Run al límite: **`us-central1` falla con "quota exceeded"**, así que la API
se despliega en **`europe-west1`** (región ya usada por el proyecto). Para no pagar latencia entre regiones, Cloud SQL debe estar
en la **misma región** (`europe-west1`); la red `default` y el acceso privado a servicios son globales. Para usar otra región,
solicita más cuota en *Cloud Run → Cuotas y límites*.
Nota: `/healthz` está reservada por Cloud Run; el chequeo de salud de la API es `GET /api/health`.

## Puesta en marcha en Google Cloud (una vez)
> Crea recursos con coste (Cloud SQL `db-f1-micro` cuesta unos 8–10 USD/mes aunque no haya tráfico). Cloud Run escala a cero.
> La política de organización de este proyecto prohíbe la IP pública en Cloud SQL, así que se usa **IP privada** en la red `default`
> (ya tiene el acceso privado a servicios configurado) y Cloud Run entra con **Direct VPC egress**.

```bash
PROJECT=buoyant-objective-fwjkk; REGION=europe-west1
gcloud services enable run.googleapis.com sqladmin.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project $PROJECT

# 1) Cloud SQL (PostgreSQL 16) con IP privada y protección contra borrado
gcloud sql instances create waackon-db --project $PROJECT --database-version=POSTGRES_16 --edition=ENTERPRISE   --tier=db-f1-micro --region=$REGION --storage-size=10GB --storage-auto-increase --availability-type=zonal   --backup-start-time=05:00 --deletion-protection --network=projects/$PROJECT/global/networks/default --no-assign-ip
gcloud sql databases create waackon --instance=waackon-db --project $PROJECT
gcloud sql users create waackon_app --instance=waackon-db --password="<CONTRASEÑA_LARGA>" --project $PROJECT

# 2) Secretos (los pones tú; nunca en el repositorio). Stripe es opcional al principio: sin él la API responde "pagos no activados".
printf '%s' '<CONTRASEÑA_LARGA>' | gcloud secrets create DB_PASSWORD --data-file=- --project $PROJECT
printf '%s' 'sk_test_…'          | gcloud secrets create STRIPE_SECRET_KEY --data-file=- --project $PROJECT
printf '%s' 'whsec_…'            | gcloud secrets create STRIPE_WEBHOOK_SECRET --data-file=- --project $PROJECT

# 3) Cuenta de servicio de la API con los permisos justos
gcloud iam service-accounts create waack-api --project $PROJECT
for R in roles/secretmanager.secretAccessor roles/firebaseauth.admin roles/datastore.user; do
  gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:waack-api@$PROJECT.iam.gserviceaccount.com --role=$R --condition=None
done

# 4) Desplegar la API (Cloud Run construye la imagen desde api/Dockerfile)
DB_IP=$(gcloud sql instances describe waackon-db --project $PROJECT --format='value(ipAddresses[0].ipAddress)')
cd api
gcloud run deploy waack-api --source . --region $REGION --project $PROJECT --allow-unauthenticated   --service-account waack-api@$PROJECT.iam.gserviceaccount.com   --network default --subnet default --vpc-egress private-ranges-only   --set-env-vars DB_HOST=$DB_IP,DB_USER=waackon_app,DB_NAME=waackon,APP_URL=https://waack-on.com,ALLOWED_ORIGINS=https://waack-on.com,STRICT_ORIGIN=true,FIRESTORE_DB=<ID-de-tu-base-de-Firestore>,RUN_MIGRATIONS=true,BOOTSTRAP_ADMIN_EMAILS=<tu-correo>   --set-secrets DB_PASSWORD=DB_PASSWORD:latest
# Cuando tengas Stripe: añade --update-secrets STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest
```
`--allow-unauthenticated` es correcto: la API se protege con el ID token de Firebase, no con IAM.

### Spotify (opcional: conectar cuenta y reproducir música)

App en [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard). El Redirect URI
**debe** ser una ruta bajo `/account/**` (es donde Hosting sirve la app; la raíz `/` sirve la landing
estática) — nunca `/api/...`, porque Spotify hace un GET normal del navegador sin sesión y esa ruta
de la API exige el token de Firebase. Regístralo tal cual en el dashboard y en `SPOTIFY_REDIRECT_URI`:

```bash
printf '%s' '<CLIENT_SECRET_DE_SPOTIFY>' | gcloud secrets create SPOTIFY_CLIENT_SECRET --data-file=- --project $PROJECT
gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:waack-api@$PROJECT.iam.gserviceaccount.com --role=roles/secretmanager.secretAccessor --condition=None

gcloud run services update waack-api --region $REGION --project $PROJECT \
  --update-env-vars "SPOTIFY_CLIENT_ID=<CLIENT_ID_DE_SPOTIFY>,SPOTIFY_REDIRECT_URI=https://waack-on.com/account/" \
  --update-secrets SPOTIFY_CLIENT_SECRET=SPOTIFY_CLIENT_SECRET:latest
```

No hace falta ninguna variable de entorno en el frontend: el Client ID solo lo usa el backend para
armar la URL de autorización (`GET /v1/spotify/login`); el frontend solo recibe esa URL ya armada.

Luego, en `firebase.json` añade **antes** del rewrite `**` y despliega Hosting:
```json
{ "source": "/api/**", "run": { "serviceId": "waack-api", "region": "us-central1" } }
```
Webhook de Stripe → `https://waack-on.com/api/v1/webhooks/stripe` con los eventos
`customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed` y `account.updated`
(este último como evento de cuentas conectadas).

## Catálogo de planes (después de crear los productos y precios en Stripe)
Con tu sesión de administrador, `PUT /api/v1/admin/plans/escuela` y `/catedra`:
```json
{ "kind": "platform", "name": "Escuela completa", "active": true, "prices": { "month": "price_…", "year": "price_…" }, "automaticTax": true }
{ "kind": "instructor", "name": "Una cátedra", "active": true, "prices": { "month": "price_…", "year": "price_…" }, "feePercent": 15, "automaticTax": true }
```
`feePercent` (lo que se queda Waack On) es decisión tuya: no hay valor por defecto.

## Pendiente (siguientes fases)
- Fase 2: cursos y lecciones en PostgreSQL, con acceso según suscripción y URLs firmadas para los videos.
- Fase 3: subida de reels y clases grabadas (Cloud Storage + transcodificación).
- Fase 4: directos (servicio de video externo).
- Fase 5: análisis de postura en el navegador (MediaPipe) + Gemini para recomendaciones, con consentimiento.
- Panel de aprobación de solicitudes en la interfaz (la API ya existe).
- Mientras dure la transición, el perfil se guarda en Firestore **y** en PostgreSQL; PostgreSQL manda para rol, solicitudes y pagos.
