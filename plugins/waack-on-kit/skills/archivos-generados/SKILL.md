---
name: archivos-generados
description: Cómo modificar las pantallas, la UI o la lógica de la app Waack On. Úsala antes de cambiar src/App.tsx, src/Shell.tsx, src/toggle.txt o una vista de src/views/ — los que llevan la cabecera GENERADO se generan desde tools/ y se sobrescriben al regenerar.
---

# Archivos generados de Waack On

Parte de `src/` se genera desde el prototipo de Claude Design. Estos archivos empiezan con un
comentario `// GENERADO por …` (salvo `src/toggle.txt`, que no admite comentarios) y **no se editan a mano**: cualquier cambio se pierde en la próxima
regeneración (y el hook del plugin bloquea la edición).

| Archivo generado | Fuente que hay que editar | Generador |
| --- | --- | --- |
| `src/Shell.tsx`, `src/toggle.txt` y las vistas de `src/views/` con cabecera GENERADO | `tools/template.html` (`sc-if` / `sc-for` / `{{ expr }}`) | `npm run convert` (`tools/convert.mjs`) |
| `src/App.tsx` | `tools/logic.source.js` y los parches `tools/patches*.mjs` | `node tools/port-logic.mjs` |

Los archivos sin cabecera GENERADO se editan directamente: `src/components/`, `src/screens/`,
`src/lib/`, `src/main.tsx`, `src/styles.css`, `src/test/` y también las vistas de `src/views/` escritas
a mano (p. ej. `Instructor.tsx`, `EntrenarEstilos.tsx`, `Musica.tsx`). Para saber si una vista es
generada, mira su primera línea.

## Dónde va cada cambio

- **Marcado / estructura de una pantalla** → `tools/template.html`. Las expresiones `{{ }}` se
  traducen a `v.<campo>` con encadenamiento opcional; `convert.mjs` solo admite identificadores,
  `.prop`, `[idx]`, `!`, comparaciones y literales — nada de llamadas en la plantilla.
- **Estado, handlers, datos de ejemplo** → `tools/logic.source.js`.
- **Integraciones reales (Firebase, pagos, perfil, feed…)** → el `tools/patches-<área>.mjs`
  correspondiente. Los parches usan `rep(buscar, reemplazar)`, que lanza `no encontrado: …` si el
  texto buscado ya no existe; si cambias `logic.source.js`, revisa los parches que lo tocan.
- **Componentes React nuevos** → `src/components/` o `src/screens/` (no generados) e impórtalos
  desde la plantilla o los parches.

## Después de cambiar una fuente

Ejecuta `/waack-on-kit:regen` (o `npm run convert && node tools/port-logic.mjs`), luego
`npx tsc --noEmit`, y haz commit de la fuente **y** de los archivos regenerados juntos.
