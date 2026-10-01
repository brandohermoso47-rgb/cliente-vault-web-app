---
description: Regenera src/ desde la plantilla y la lógica del prototipo (tools/) y comprueba que compile
allowed-tools: Bash(npm run convert), Bash(node tools/port-logic.mjs), Bash(npx tsc --noEmit), Bash(git status:*), Bash(git diff:*)
---

Regenera los archivos GENERADO de `src/` a partir de sus fuentes en `tools/`:

1. `npm run convert` — `tools/template.html` → `src/Shell.tsx`, `src/views/*.tsx`.
2. `node tools/port-logic.mjs` — `tools/logic.source.js` + `tools/patches*.mjs` → `src/App.tsx`.
3. `npx tsc --noEmit` para confirmar que el resultado compila.
4. `git status --short src/` y `git diff --stat src/` para resumir qué cambió.

Si un paso falla (por ejemplo `no encontrado: …` en un parche), detente, muestra el error y explica qué
fuente de `tools/` hay que ajustar. Nunca arregles el fallo editando a mano los archivos generados.
