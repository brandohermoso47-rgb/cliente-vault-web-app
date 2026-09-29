# Guía de Despliegue - Waack On

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Arquitectura de Despliegue](#arquitectura-de-despliegue)
3. [Seguridad](#seguridad)
4. [Variables de Entorno](#variables-de-entorno)
5. [Pasos de Despliegue](#pasos-de-despliegue)
6. [Verificación Post-Despliegue](#verificación-post-despliegue)

---

## Requisitos Previos

- Node.js ≥ 20
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud SDK configurado con proyecto activo
- Acceso a los secretos en Google Cloud Secret Manager
- Permisos en Firebase Console para el proyecto

### Cuentas Necesarias

- **Firebase**: Proyecto configurado con Firestore, Storage, Authentication
- **Google Cloud**: Cloud Run habilitado, Secret Manager configurado
- **Stripe**: Cuenta Connect configurada (si se activa pagos)
- **PostgreSQL**: Base de datos en Cloud SQL

---

## Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────┐
│         Firebase Hosting (App Web)                       │
│  - Frontend React/Vite                                   │
│  - Firestore Rules                                       │
│  - Storage Rules                                         │
│  - Hosting Security Headers                              │
└────────────────────┬────────────────────────────────────┘
                     │ /api/** → Cloud Run
                     │
┌────────────────────▼────────────────────────────────────┐
│         Cloud Run (API Backend)                          │
│  - Express.js API                                        │
│  - Autenticación Firebase Admin                          │
│  - Drizzle ORM con PostgreSQL                            │
│  - Stripe Webhook Processor                              │
│  - Row Level Security (RLS) en BD                        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   Cloud SQL    Firebase Auth   Stripe
   PostgreSQL   (Tokens)        (Payments)
```

---

## Seguridad

### ✅ Controles Implementados

**Firestore Rules:**
- `roleUnchanged()`: Impide cambios de rol desde cliente
- Validación de pertenencia (`isOwner()`)
- Listas blancas de campos editables
- Límites de tamaño de texto

**Storage Rules:**
- Autenticación requerida
- Solo creación en carpeta personal (`/users/{uid}/`)
- Límites de tamaño por tipo (videos 200MB, imágenes 10MB, PDFs 50MB)
- Sin actualizaciones (solo creación/eliminación)

**Backend API:**
- `withAuth()` middleware en todas las rutas protegidas
- `requireVerifiedEmail` para operaciones financieras
- Validación Zod en todas las entradas
- App Check (Firebase) para prevenir ataques de script
- Rate limiting: 600 req/15min general, 60 req/15min para pagos
- Verificación de firma en webhooks de Stripe
- RLS forzado en todas las tablas de PostgreSQL

**CORS:**
- Solo orígenes permitidos
- Configuración estricta en producción (rechaza orígenes no permitidos)
- No se permite credenciales en peticiones entre orígenes

---

## Variables de Entorno

### Frontend (`.env.local`)

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_FIRESTORE_DB=
```

### Backend (Secret Manager → Cloud Run)

```env
# Node Environment
NODE_ENV=production
PORT=8080
APP_URL=https://waack-on.com

# API Configuration
ALLOWED_ORIGINS=https://waack-on.com
STRICT_ORIGIN=true
APP_CHECK=enforce

# PostgreSQL (Cloud SQL)
INSTANCE_CONNECTION_NAME=proyecto:region:instancia
DB_USER=postgres
DB_PASSWORD=<contraseña_segura>
DB_NAME=waackon
RUN_MIGRATIONS=false

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase
FIRESTORE_DB=default
BOOTSTRAP_ADMIN_EMAILS=admin@waack-on.com

# App Check (Firebase Console → App Check)
VITE_APPCHECK_SITE_KEY=...  # Clave pública
```

---

## Pasos de Despliegue

### 1️⃣ Preparación Local

```bash
# Verificar dependencias
npm run typecheck
npm run build

# Probar backend localmente (si es posible)
cd api
npm run build
npm run typecheck
cd ..
```

### 2️⃣ Desplegar Backend (Cloud Run)

```bash
# Construir imagen Docker
cd api
docker build -t waack-api:latest .

# Enviar a Container Registry
docker tag waack-api:latest gcr.io/PROJECT_ID/waack-api:latest
docker push gcr.io/PROJECT_ID/waack-api:latest

# Desplegar a Cloud Run
gcloud run deploy waack-api \
  --image=gcr.io/PROJECT_ID/waack-api:latest \
  --platform=managed \
  --region=europe-west1 \
  --allow-unauthenticated \
  --set-env-vars=NODE_ENV=production \
  --set-secrets=STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,DB_PASSWORD=DB_PASSWORD:latest \
  --service-account=waack-api@PROJECT_ID.iam.gserviceaccount.com
```

### 3️⃣ Desplegar Frontend (Firebase Hosting)

```bash
# Compilar
npm run build

# Desplegar
firebase deploy --only hosting

# Verificar despliegue
firebase hosting:channels:list
```

### 4️⃣ Desplegar Reglas de Seguridad

```bash
# Firestore Rules
firebase deploy --only firestore:rules

# Storage Rules
firebase deploy --only storage

# Ver cambios pendientes
firebase deploy:listchanges
```

### 5️⃣ Configurar Índices de Firestore (si es necesario)

```bash
firebase deploy --only firestore:indexes
```

---

## Verificación Post-Despliegue

### 🔍 Checklists

#### Health Check
```bash
# Verificar API
curl https://waack-on.com/api/health

# Debe responder: { "ok": true }
```

#### Seguridad
- [ ] CORS headers presentes en respuestas
- [ ] Content-Security-Policy configurada
- [ ] X-Frame-Options: DENY
- [ ] HSTS habilitado
- [ ] Firestore rules desplegadas
- [ ] Storage rules desplegadas
- [ ] App Check habilitado (si ENFORCE en config)

#### Base de Datos
- [ ] RLS activo en todas las tablas
- [ ] Migraciones ejecutadas exitosamente
- [ ] Usuarios pueden autenticarse
- [ ] Firestore síncrono con PostgreSQL (si aplica)

#### Pagos (si Stripe activo)
- [ ] Webhook de Stripe recibiendo eventos
- [ ] Checkout session creándose correctamente
- [ ] Suscripciones creándose en base de datos
- [ ] Rol se asigna correctamente tras pago (server-side)

#### Almacenamiento
- [ ] Usuarios pueden subir videos
- [ ] Usuarios NO pueden subir fuera de su carpeta
- [ ] Límites de tamaño se respetan

### 📊 Monitoreo

**Cloud Run Logs:**
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=waack-api" --limit=50
```

**Firebase Hosting Logs:**
```bash
firebase hosting:logs
```

**Errores Firestore:**
```bash
gcloud logging read "resource.type=cloud_firestore_instance" --severity=ERROR --limit=50
```

---

## Rollback

Si algo falla en producción:

```bash
# Ver versiones anteriores
firebase hosting:channels:list

# Volver a versión anterior
firebase hosting:clone-version --source=VERSION_ID --target=live

# O desplegar commit anterior
git checkout HEAD~1
firebase deploy --only hosting
```

Para Cloud Run:
```bash
# Ver revisiones
gcloud run revisions list --service=waack-api --region=europe-west1

# Revertir tráfico a revisión anterior
gcloud run services update-traffic waack-api \
  --to-revisions=REVISION_ID=100 \
  --region=europe-west1
```

---

## Troubleshooting

### Error: CORS bloqueado
**Causa**: Origen no en ALLOWED_ORIGINS
```bash
gcloud run services update waack-api --update-env-vars ALLOWED_ORIGINS=https://nuevo-dominio.com
```

### Error: Firestore rules denegar acceso
**Verificar**:
1. Usuario autenticado en Firebase
2. UID coincide en la regla
3. Campos editables están en whitelist

### Error: Webhook de Stripe no se recibe
**Verificar**:
1. URL en Stripe Connect Points correcta: `https://waack-on.com/api/v1/webhooks/stripe`
2. STRIPE_WEBHOOK_SECRET configurado
3. Firma validándose correctamente

---

## Escalado

### Límites Actuales
- Cloud Run: Auto-escalado 0-100 instancias
- Firestore: Modo pago (escalado automático)
- PostgreSQL: Cloud SQL (configurar CPU/RAM según carga)

### Optimizaciones para Alto Tráfico
1. Implementar caching (Cloud CDN para assets estáticos)
2. Usar Firebase Functions para procesamiento async
3. Implementar bulk operations en PostgreSQL
4. Considerar Memorystore (Redis) para sesiones

---

## Contactos y Recursos

- Firebase Console: https://console.firebase.google.com
- Google Cloud Console: https://console.cloud.google.com
- Stripe Dashboard: https://dashboard.stripe.com
- Cloud Run Documentation: https://cloud.google.com/run/docs

---

**Última actualización**: 2026-09-29  
**Versión**: v0.1.0
