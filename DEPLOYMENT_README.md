# 🚀 Ready to Deploy

Este directorio contiene **Waack On v0.1.0 - Motion Recognition Editor (Phase 2)** listo para producción.

## ⚡ Quick Start (5 minutos)

```bash
# 1. Instalar dependencias (local)
npm install && cd api && npm install && cd ..

# 2. Compilar
npm run build

# 3. Desplegar (ejecuta automáticamente todos los pasos)
./deploy.sh production

# 4. Verificar
curl https://waack-on.com/api/health
# Esperado: {"ok":true}
```

---

## 📚 Documentación Completa

| Archivo | Propósito |
|---------|-----------|
| **IMPLEMENTATION_SUMMARY.md** | ✅ QUÉ SE HIZO - Resumen técnico de Phase 2 |
| **SECURITY_AUDIT.md** | 🔒 SEGURIDAD - Análisis de vulnerabilidades remediadas |
| **DEPLOYMENT.md** | 📖 GUÍA - Instrucciones detalladas de despliegue |
| **DEPLOYMENT_CHECKLIST.md** | ✓ CHECKLIST - Pasos verificables pre/post deploy |
| **deploy.sh** | 🔧 SCRIPT - Automatiza todo el despliegue |
| **docs/PHASE2_ADVANCED_FEATURES.md** | 🎓 API DOCS - DTW, Video Export, StudentAnalyzer |

**Tiempo recomendado de lectura**: 
- Primero: IMPLEMENTATION_SUMMARY.md (5 min)
- Luego: DEPLOYMENT_CHECKLIST.md (10 min)
- Si hay dudas: DEPLOYMENT.md (20 min)

---

## 🎯 Qué Está Listo

✅ **Motion Recognition Editor**
- Instructor puede editar eventos de movimiento
- Guardado automático en Firestore
- Preview en tiempo real

✅ **Video Upload & Storage**
- Subir videos a Firebase Storage
- Almacenamiento de hasta 200MB
- Progress tracking

✅ **DTW Pose Comparison**
- Comparar poses de instructor vs estudiante
- Scoring automático (0-100)
- Feedback personalizado

✅ **Video Export**
- Renderizar efectos de motion recognition en video
- Aspect ratios: 16:9, 9:16, 1:1 (TikTok/Reels compatible)
- Descargar como WebM

✅ **Student Performance Analyzer**
- Componente de análisis visual
- Métricas: Form, Timing, Consistency
- Comparación side-by-side o overlay

✅ **Security**
- Firestore rules: Roles protegidos, ownership validado
- Storage rules: Solo acceso a carpeta personal
- Backend: Autenticación, autorización, rate limiting
- API: CORS restringido, headers de seguridad

---

## 🚀 Pasos de Despliegue

### Opción 1: Despliegue Automático (Recomendado)

```bash
chmod +x deploy.sh
./deploy.sh production
```

El script hace automáticamente:
1. Compila frontend con Vite
2. Verifica reglas de seguridad
3. Compila backend
4. Crea imagen Docker
5. Sube a Container Registry
6. Despliega a Cloud Run
7. Despliega a Firebase Hosting
8. Despliega reglas de seguridad
9. Verifica que todo funcione

### Opción 2: Despliegue Manual

Ver **DEPLOYMENT.md** para instrucciones paso a paso.

### Opción 3: Despliegue por Etapas

```bash
# Solo frontend
firebase deploy --only hosting

# Solo backend
cd api && docker build -t waack-api . && docker push gcr.io/PROJECT/waack-api && cd ..
gcloud run deploy waack-api --image=gcr.io/PROJECT/waack-api

# Solo reglas
firebase deploy --only firestore:rules,storage
```

---

## 🔐 Requisitos Previos

### Local
- Node.js ≥ 20
- npm o yarn
- Docker (para backend)

### Google Cloud
- Proyecto configurado
- Cloud Run habilitado
- Container Registry accesible

### Firebase
- Proyecto creado
- Firestore configurado
- Firebase Hosting habilitado
- Storage habilitado

### Secretos (Secret Manager)
- `stripe-secret-key`: Stripe API key (si pagos activos)
- `stripe-webhook-secret`: Stripe webhook signing secret
- `db-password`: PostgreSQL password
- `instance-connection-name`: Cloud SQL connection string

### Stripe (Opcional)
- Cuenta activa
- Webhook configurado en `https://waack-on.com/api/v1/webhooks/stripe`

---

## ✅ Post-Despliegue

Después de desplegar, verifica:

```bash
# 1. Health check
curl https://waack-on.com/api/health

# 2. Frontend loads
open https://waack-on.com

# 3. Firestore rules active
# En Firebase Console: intentar editar rol de usuario desde consola
# → Debe fallar: "roleUnchanged"

# 4. Storage rules active
# En la app: subir un archivo
# → Debe guardarse en /users/{uid}/...

# 5. Logs
firebase hosting:logs
gcloud logging read "resource.type=cloud_run_revision" --limit=20
```

---

## 🚨 Troubleshooting

### "Error: Cannot find module 'vite'"
```bash
npm install
npm run build
```

### "Error: origin_not_allowed"
```bash
# Backend rechaza tu origen. Asegúrate que ALLOWED_ORIGINS
# contiene https://waack-on.com (o tu dominio real)
gcloud run services update waack-api \
  --update-env-vars ALLOWED_ORIGINS=https://tu-dominio.com
```

### "Error: STRIPE_SECRET_KEY not found"
```bash
# Guardar clave en Secret Manager
echo -n "sk_live_..." | gcloud secrets create stripe-secret-key --data-file=-

# O si ya existe:
echo -n "sk_live_..." | gcloud secrets versions add stripe-secret-key --data-file=-
```

### "Firestore security rules deny access"
```bash
# Verificar que el documento tiene estructura correcta:
# /users/{uid}/instructorData/classes/{classId}
# 
# Y que el usuario está autenticado con ese mismo UID
```

### "Video upload timeout"
```bash
# Si video > 200MB: aumentar Cloud Run timeout
gcloud run services update waack-api --timeout=3600 # 1 hora
```

Ver **DEPLOYMENT_CHECKLIST.md** para más troubleshooting.

---

## 📊 Arquitectura

```
┌─────────────────────────────────────┐
│   Firebase Hosting (Frontend)        │
│   ├─ React 18 + Vite               │
│   ├─ Firestore Sync                │
│   └─ Storage Upload                │
└──────────────┬──────────────────────┘
               │ /api/**
┌──────────────▼──────────────────────┐
│   Cloud Run (Backend)                │
│   ├─ Node.js 22 + Express           │
│   ├─ PostgreSQL (Drizzle ORM)      │
│   └─ Stripe Webhooks               │
└──────────────┬──────────────────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
  Cloud SQL  Firebase  Stripe
```

---

## 🔄 CI/CD Pipeline (Futuro)

Para automatizar deployments:

```bash
# En GitHub Actions:
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
      - run: ./deploy.sh production
```

---

## 📞 Soporte

### Si algo falla:

1. **Lee**: DEPLOYMENT_CHECKLIST.md (troubleshooting section)
2. **Verifica logs**: 
   ```bash
   firebase hosting:logs
   gcloud logging read "severity=ERROR"
   ```
3. **Rollback** (si urgente):
   ```bash
   firebase hosting:clone-version --source=VERSION_ANTERIOR --target=live
   ```

---

## 🎓 Documentación Técnica

### Motion Recognition
- `docs/PHASE2_ADVANCED_FEATURES.md` - API completa de DTW y video export

### Security
- `firestore.rules` - Reglas de Firestore
- `storage.rules` - Reglas de Storage
- `SECURITY_AUDIT.md` - Análisis de vulnerabilidades

### Backend
- `api/src/app.ts` - Configuración Express
- `api/src/routes/*.ts` - Endpoints
- `api/src/db/` - PostgreSQL + RLS

### Frontend
- `src/lib/instructor.ts` - Persistencia
- `src/lib/motionRecognition/` - DTW y video export
- `src/components/MotionEditor/` - Componentes UI

---

## ✨ Resumen

- **Versión**: 0.1.0 (Phase 2)
- **Status**: ✅ Production Ready
- **Última Actualización**: 2026-09-29
- **Próxima Phase**: Phase 3 (FFmpeg, Multi-Dancer, Analytics)

```
╔════════════════════════════════════════════╗
║  🎉 WAACK ON MOTION RECOGNITION EDITOR 🎉  ║
║                                            ║
║  ✓ DTW Pose Comparison                    ║
║  ✓ Video Export with Effects              ║
║  ✓ Firebase Persistence                   ║
║  ✓ Student Performance Analysis           ║
║  ✓ Security Audit Passed                  ║
║                                            ║
║  Ready to Deploy →  ./deploy.sh            ║
╚════════════════════════════════════════════╝
```

**¡A desplegar!** 🚀
