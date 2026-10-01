# Waack On — web

Rediseño 2026 (vidrio líquido + dorado, tema oscuro/claro) exportado desde Claude Design.
Stack: **React + Vite + TypeScript**, **Firebase Auth + Firestore (base `ai-studio-waackonplataform-…`)**, hosting en **Firebase Hosting**.

## Cómo está construido
El prototipo original es una plantilla (`sc-if`/`sc-for`/`{{ }}`) más una clase de lógica. Se conserva como fuente de verdad en `tools/`:

| Fuente | Genera |
| --- | --- |
| `tools/template.html` | `src/Shell.tsx`, `src/views/*.tsx` (una pantalla por archivo) — `npm run convert` |
| `tools/logic.source.js` + `tools/port-logic.mjs` | `src/App.tsx` (estado, datos de ejemplo, login con Firebase) |

Los archivos de `src/` marcados como GENERADO se regeneran; edita la fuente o los scripts.
Los datos de las pantallas (cursos, lives, reels, ranking…) siguen siendo datos de ejemplo del prototipo; solo **login y perfil de usuario** usan Firebase por ahora.

## Puesta en marcha
```bash
npm install
cp .env.example .env.local        # completa con la config web de tu app Firebase
cp .firebaserc.example .firebaserc # pon tu ID de proyecto
npm run dev                        # sin .env.local corre en vista previa: /?view=dashboard|cursos|lives|reels|...
```

## Despliegue
```bash
firebase login
npm run deploy      # build + hosting + reglas de Firestore
```
Dominio personalizado: Firebase Console → Hosting → *Add custom domain* y registros DNS que indique.

## Plugin de Claude Code
`plugins/waack-on-kit` añade comandos (`regen`, `check`, `rules-test`, `deploy`), una skill sobre los archivos generados y un hook que impide editarlos a mano. Ver [su README](plugins/waack-on-kit/README.md).
