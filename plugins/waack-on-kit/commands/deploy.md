---
description: Despliega a Firebase (hosting + reglas) tras verificar secretos, tests y build
argument-hint: "[--only hosting|firestore|storage|functions]"
disable-model-invocation: true
allowed-tools: Bash(npm run scan:secrets), Bash(npm test), Bash(npm run build:deploy), Bash(firebase projects:list), Bash(cat .firebaserc)
---

Despliegue de Waack On a Firebase. Solo se ejecuta cuando el usuario lo pide con `/deploy`.

1. Verificaciones previas — si alguna falla, detente y no despliegues:
   - `npm run scan:secrets`
   - `npm test`
   - `npm run build:deploy`
2. Muestra el proyecto de destino (`cat .firebaserc`) y el alcance: `firebase deploy $ARGUMENTS`
   (sin argumentos despliega todo lo configurado en `firebase.json`).
3. Pide confirmación explícita al usuario antes de continuar.
4. Ejecuta `firebase deploy $ARGUMENTS` y resume el resultado (URL de hosting, reglas publicadas, errores).

Si `firebase` no está autenticado, indica `firebase login` y detente.
