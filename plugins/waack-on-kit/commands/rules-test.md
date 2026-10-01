---
description: Prueba firestore.rules y storage.rules con la API de simulación de Firebase
argument-hint: "[ID de proyecto Firebase]"
allowed-tools: Bash(gcloud auth print-access-token), Bash(npm run test:rules)
---

Prueba las reglas de seguridad sin tocar datos reales.

1. Comprueba que `gcloud auth print-access-token` funcione. Si no, pide al usuario que ejecute
   `gcloud auth login` y detente.
2. Sin argumentos, ejecuta `npm run test:rules` (usa el proyecto por defecto de `rules-tests/run.mjs`).
   Con argumento (`$ARGUMENTS`), primero valida que sea un ID de proyecto Firebase: debe cumplir
   exactamente `^[a-z][a-z0-9-]{4,28}[a-z0-9]$` (sin espacios ni otros caracteres). Si no lo cumple,
   detente e informa del error sin ejecutar nada. Si lo cumple, ejecuta
   `FIREBASE_PROJECT='<id validado>' npm run test:rules`.
3. Resume los casos que fallaron: nombre del caso, resultado esperado vs. obtenido, y la regla de
   `firestore.rules` / `storage.rules` probablemente responsable.

Si cambias reglas para corregir un fallo, añade o ajusta el caso correspondiente en `rules-tests/run.mjs`.
