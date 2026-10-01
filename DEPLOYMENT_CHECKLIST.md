# Checklist de Despliegue - Waack On

## 🔒 Seguridad Pre-Despliegue

### Firestore & Storage
- [x] **firestore.rules**: Función `roleUnchanged()` previene cambios de rol del cliente
- [x] **firestore.rules**: Todos los documentos sensibles requieren `isOwner()` o `isAdmin()`
- [x] **firestore.rules**: `only()` limita campos editables
- [x] **storage.rules**: Solo creación/borrado, sin actualizaciones
- [x] **storage.rules**: Límites de tamaño por tipo: videos 200MB, imágenes 10MB, PDFs 50MB
- [x] **storage.rules**: Acceso solo a `/users/{uid}/` del propio usuario

### Backend API
- [x] **auth.ts**: `withAuth()` middleware en todas las rutas protegidas
- [x] **auth.ts**: `requireVerifiedEmail` en `/billing/checkout`
- [x] **billing.ts**: Role validado server-side (no confía en cliente)
- [x] **app.ts**: App Check habilitado (Firebase verifica que vienen de la app real)
- [x] **app.ts**: Rate limiting: 600 req/15min general, 60 req/15min para pagos
- [x] **app.ts**: CORS restringido a orígenes permitidos
- [x] **app.ts**: Headers de seguridad (CSP, HSTS, X-Frame-Options, etc.)
- [x] **app.ts**: Webhook de Stripe verifica firma (no acepta sin validar)
- [x] **db/context.ts**: RLS forzado en todas las tablas (`assertRlsEverywhere`)

### Frontend Seguridad
- [x] **No client-side role writes**: El cliente lee el rol de Firebase (read-only)
- [x] **No payment simulation**: Los pagos van directo a Stripe
- [x] **No hardcoded secrets**: Todas las claves en `.env` o Secret Manager
- [x] **CORS headers**: Respetará política de origen del servidor

### Base de Datos PostgreSQL
- [x] **RLS en todas las tablas**: Solo se ven datos del propio usuario
- [x] **Migraciones versionadas**: Drizzle versiona cambios de schema
- [x] **Contraseñas en Secret Manager**: Nunca en código
- [x] **Backup automático**: Configurar en Cloud SQL

### Stripe
- [x] **Live Key en Secret Manager**: No en código
- [x] **Webhook Secret en Secret Manager**: Validación de firma obligatoria
- [x] **Metadata en subscripciones**: Para auditoría de quién pagó qué

---

## 🚀 Pasos de Despliegue

### Paso 1: Compilar Localmente

```bash
cd /home/user/cliente-vault-web-app

# Verificar tipos
npm run typecheck

# Compilar
npm run build

# Resultado esperado: directorio 'deploy/' con archivos estáticos
ls -la deploy/
```

### Paso 2: Desplegar Backend (Cloud Run)

```bash
# Crear imagen Docker
cd api
docker build -t waack-api:latest .

# Enviar a Google Container Registry
PROJECT_ID=$(gcloud config get-value project)
docker tag waack-api:latest gcr.io/$PROJECT_ID/waack-api:latest
docker push gcr.io/$PROJECT_ID/waack-api:latest

# Desplegar (ejecuta solo 1 instancia en desarrollo, escala en producción)
gcloud run deploy waack-api \
  --image=gcr.io/$PROJECT_ID/waack-api:latest \
  --platform=managed \
  --region=europe-west1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=10 \
  --set-env-vars=NODE_ENV=production,APP_URL=https://waack-on.com,ALLOWED_ORIGINS=https://waack-on.com,STRICT_ORIGIN=true,DB_NAME=waackon,RUN_MIGRATIONS=false \
  --set-secrets=STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest,DB_PASSWORD=db-password:latest,INSTANCE_CONNECTION_NAME=instance-connection-name:latest,FIRESTORE_DB=firestore-db:latest
```

**Verificar despliegue:**
```bash
# Obter URL de Cloud Run
gcloud run services describe waack-api --region=europe-west1

# Probar health check
curl https://waack-api-xxxxx.run.app/api/health
# Esperado: {"ok":true}
```

### Paso 3: Desplegar Frontend (Firebase Hosting)

```bash
cd /home/user/cliente-vault-web-app

# Iniciar sesión en Firebase
firebase login

# Seleccionar proyecto
firebase use --add
# Seleccionar: cliente-vault-web-app (o tu proyecto Firebase)

# Desplegar
firebase deploy --only hosting

# Ver versión en vivo
firebase hosting:channels:list
```

### Paso 4: Desplegar Reglas de Seguridad

```bash
# Desplegar todas las reglas
firebase deploy --only firestore:rules,storage,firestore:indexes

# Ver qué cambios se van a hacer
firebase deploy:listchanges

# Confirmar
firebase deploy --only firestore:rules,storage
```

### Paso 5: Configurar Stripe Webhooks

```bash
# En Stripe Dashboard → Webhooks:
# 1. Endpoint URL: https://waack-on.com/api/v1/webhooks/stripe
# 2. Eventos: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, charge.refunded
# 3. API Version: Usar versión más reciente compatible
# 4. Copiar "Signing Secret" → Google Cloud Secret Manager (stripe-webhook-secret)
```

---

## ✅ Verificación Post-Despliegue

### 1. Health Checks

```bash
# API
curl https://waack-on.com/api/health
# ✅ Esperado: {"ok":true}

# Firebase Hosting
curl -I https://waack-on.com/
# ✅ Debe retornar: HTTP/2 200
# ✅ Headers: X-Content-Type-Options: nosniff, Strict-Transport-Security, etc.
```

### 2. Seguridad

```bash
# Verificar CORS
curl -H "Origin: https://evil.com" -I https://waack-on.com/api/health
# ✅ Debe rechazar (no enviar Access-Control-Allow-Origin)

# Verificar App Check obligatorio (si ENFORCE)
curl https://waack-on.com/api/v1/billing/plans \
  -H "Authorization: Bearer TOKEN_FAKE"
# ✅ Debe retornar 401 (app-check-required)

# Verificar CSP
curl -I https://waack-on.com/ | grep Content-Security
# ✅ Debe tener CSP
```

### 3. Base de Datos

```bash
# Conectar a PostgreSQL en Cloud SQL
gcloud sql connect waackon \
  --user=postgres \
  --project=$PROJECT_ID

# En SQL:
SELECT * FROM users LIMIT 1;
# ✅ Debe retornar error si no eres el usuario dueño de esa fila (RLS)

SELECT * FROM information_schema.tables WHERE table_name='users';
# ✅ Verificar que tabla existe
```

### 4. Autenticación

```bash
# Crear usuario de prueba
# 1. Ir a Firebase Console → Authentication
# 2. Crear usuario: test@waack-on.com / password123

# Probar login en la app
# 1. Abrir https://waack-on.com
# 2. Login con test@waack-on.com
# 3. Verificar que se redirige a shell/onboarding
```

### 5. Firestore Sync

```bash
# En Firebase Console → Firestore:
# 1. Verificar que exista documento /users/{uid}
# 2. Intentar editar el documento desde consola con role: 'instructor'
# ✅ Debe fallar (roleUnchanged)

# Verificar desde cliente
# 1. En navegador, abrir console
# 2. Intentar: updateDoc(doc(db, 'users', uid), { role: 'instructor' })
# ✅ Debe retornar error: "roleUnchanged"
```

### 6. Almacenamiento

```bash
# Verificar restricción de carpeta
# 1. En la app, subir una foto (video, imagen, PDF)
# 2. Verificar que se guarda en /users/{uid}/...
# 3. Intentar crear archivo en /admin/hack.txt (desde console)
# ✅ Debe fallar: "Missing or insufficient permissions"
```

### 7. Pagos (si Stripe activo)

```bash
# En Stripe Dashboard → Test Data:
# 1. Crear tarjeta de prueba: 4242 4242 4242 4242 (expira 12/25, CVV 123)
# 2. En la app, intentar suscribirse
# 3. Completar checkout
# ✅ Esperado:
#    - Suscripción creada en PostgreSQL (se ve en Cloud SQL)
#    - Rol cambia a 'vip_student' (solo server puede hacerlo)
#    - Usuario aparece en Stripe Dashboard con suscripción

# Verificar webhook
# En Stripe Dashboard → Webhooks → Logs:
# ✅ Ver evento `customer.subscription.created`
# ✅ Response: 200 OK
```

---

## 🛠 Troubleshooting

### Error: "CORS policy: response to preflight request doesn't pass access control check"

**Causa**: Origen no en `ALLOWED_ORIGINS`  
**Solución**:
```bash
gcloud run services update waack-api \
  --update-env-vars ALLOWED_ORIGINS=https://tu-dominio.com
```

### Error: "Firestore rules deny read of users/{uid}"

**Causa**: Usuario no autenticado o RLS bloqueando  
**Solución**:
1. Verificar que `firebase.auth` tiene token válido
2. Verificar que UID en Firestore = `request.auth.uid`
3. Revisar logs: `gcloud logging read "resource.type=cloud_firestore_instance"`

### Error: "App Check token invalid"

**Causa**: Token expirado o no enviado  
**Solución**:
1. Si `APP_CHECK=enforce`: Verificar que Firebase App Check está inicializado en frontend
2. En desarrollo: Usar `VITE_APPCHECK_DEBUG_TOKEN` en `.env.local`
3. En producción: Verificar que reCAPTCHA Enterprise está configurado en Firebase

### Error: "stripe.webhooks.constructEvent() failed"

**Causa**: Webhook secret incorrecto o firma inválida  
**Solución**:
1. Copiar `Signing Secret` desde Stripe Dashboard → Webhooks (no API Key)
2. Guardar en Secret Manager con nombre `stripe-webhook-secret`
3. Redeploy Cloud Run para que lea el secreto

---

## 📊 Monitoreo Continuo

### Configurar Alertas

```bash
# Error rate > 1% en Cloud Run
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Cloud Run error rate" \
  --condition-display-name="Error rate > 1%" \
  --condition-expression='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count" AND metric.labels.response_code_class="5xx"'

# Firestore exceeds 10k reads/min
# (Configurar en Firebase Console → Quotas)
```

### Logs Diarios

```bash
# Ver últimos 100 errores
gcloud logging read "severity=ERROR" --limit=100 --format=json

# Verificar uso de Firestore
firebase firestore:usage

# Verificar costo estimado
gcloud compute project-info describe --project=$PROJECT_ID | grep -i quota
```

---

## 📝 Rollback

Si algo falla en producción, puedes revertir en minutos:

```bash
# Cloud Run: usar revisión anterior
gcloud run services describe waack-api --region=europe-west1
# Copiar revision_id de la anterior
gcloud run services update-traffic waack-api \
  --to-revisions=REVISION_ID=100 \
  --region=europe-west1

# Firebase Hosting: clonar versión anterior
firebase hosting:channels:list
firebase hosting:clone-version --source=VERSION_ID_ANTERIOR --target=live

# Firestore: usar backup automático
# En Firebase Console → Backups, restaurar a timestamp anterior
```

---

## 🎯 Checklist Final

- [ ] `npm run build` compila sin errores
- [ ] `npm run typecheck` pasa
- [ ] Firestore rules están desplegadas
- [ ] Storage rules están desplegadas
- [ ] Backend en Cloud Run responde `/api/health`
- [ ] Frontend en Firebase Hosting carga
- [ ] Usuario puede autenticarse
- [ ] Usuario puede subir archivo
- [ ] Firestore sync funciona (cambios en BD reflejan en cliente)
- [ ] Rate limiting funciona (106 requests provocan 429)
- [ ] CORS funciona (origen no permitido se rechaza)
- [ ] App Check funciona (petición sin token se rechaza si ENFORCE)
- [ ] Stripe webhooks reciben eventos
- [ ] Suscripción cambia rol en BD (no en cliente)
- [ ] Backups automáticos están configurados

---

**Estado**: Listo para producción  
**Fecha**: 2026-09-29  
**Versión**: v0.1.0
