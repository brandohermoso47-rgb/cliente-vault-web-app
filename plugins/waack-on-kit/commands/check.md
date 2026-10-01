---
description: Verificación previa al commit — secretos, tipos, tests y build
allowed-tools: Bash(npm run scan:secrets), Bash(npm test), Bash(npm run build), Bash(git status:*)
---

Ejecuta, en orden, y sigue aunque uno falle para dar un informe completo:

1. `npm run scan:secrets` — credenciales en archivos versionados.
2. `npm test` — tests de Vitest.
3. `npm run build` — `tsc --noEmit` + build de Vite.

Termina con una tabla breve: paso, ✅/❌, y para cada fallo la causa en una línea y el archivo:línea
relevante. Si `scan:secrets` encuentra algo, recuerda que los secretos van en `.env.local` /
Secret Manager, no en el código. No hagas commit.
