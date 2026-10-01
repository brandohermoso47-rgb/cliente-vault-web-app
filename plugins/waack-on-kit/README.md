# waack-on-kit

Plugin de Claude Code con el flujo de trabajo de Waack On.

## Instalación
```
/plugin marketplace add brandohermoso47-rgb/cliente-vault-web-app
/plugin install waack-on-kit@waack-on
```
Para probarlo desde un clon local: `claude --plugin-dir plugins/waack-on-kit`.

## Contenido
| Tipo | Nombre | Qué hace |
| --- | --- | --- |
| Comando | `/waack-on-kit:regen` | `npm run convert` + `node tools/port-logic.mjs` + `tsc --noEmit`, y resume los cambios en `src/` |
| Comando | `/waack-on-kit:check` | `scan:secrets`, `npm test` y `npm run build`, con informe ✅/❌ |
| Comando | `/waack-on-kit:rules-test [proyecto]` | Prueba `firestore.rules` / `storage.rules` con la API de simulación (requiere `gcloud auth login`) |
| Comando | `/waack-on-kit:deploy [--only …]` | Verifica, construye, pide confirmación y ejecuta `firebase deploy`. Solo se lanza a mano |
| Skill | `archivos-generados` | Explica qué archivos de `src/` son GENERADO y qué fuente de `tools/` editar |
| Hook | `PreToolUse` (Edit/Write) | Bloquea editar a mano archivos con cabecera `// GENERADO por …` y dice qué fuente editar |
