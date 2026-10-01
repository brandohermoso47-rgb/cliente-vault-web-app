// Hook PreToolUse: impide editar a mano los archivos marcados como GENERADO (se sobrescriben al regenerar).
// Lee el evento del hook por stdin; sale con 2 y un mensaje en stderr para bloquear la herramienta.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';

let input;
try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }
const file = input?.tool_input?.file_path;
if (!file || !existsSync(resolve(input.cwd || '.', file))) process.exit(0);

// Generados sin cabecera (no admiten comentarios), con el script que los escribe.
const SIN_CABECERA = { [`${sep}src${sep}toggle.txt`]: 'tools/convert.mjs' };
const abs = resolve(input.cwd || '.', file);
let gen = Object.entries(SIN_CABECERA).find(([sufijo]) => abs.endsWith(sufijo))?.[1];
if (!gen) {
  let head;
  try { head = readFileSync(abs, 'utf8').slice(0, 400); } catch { process.exit(0); }
  gen = head.match(/^\/\/ GENERADO por (tools\/[\w.-]+)/m)?.[1];
}
if (!gen) process.exit(0);

const fuente = gen === 'tools/port-logic.mjs'
  ? 'tools/logic.source.js o tools/patches*.mjs, y luego ejecuta `node tools/port-logic.mjs`'
  : 'tools/template.html, y luego ejecuta `npm run convert`';
process.stderr.write(`${file} es un archivo GENERADO por ${gen}; los cambios a mano se pierden al regenerar. Edita ${fuente} (o usa /waack-on-kit:regen). Consulta la skill archivos-generados.\n`);
process.exit(2);
