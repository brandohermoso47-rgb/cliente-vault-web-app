// Hook PreToolUse: impide editar a mano los archivos marcados como GENERADO (se sobrescriben al regenerar).
// Lee el evento del hook por stdin; sale con 2 y un mensaje en stderr para bloquear la herramienta.
import { readFileSync, existsSync } from 'node:fs';

let input;
try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }
const file = input?.tool_input?.file_path;
if (!file || !existsSync(file)) process.exit(0);

let head;
try { head = readFileSync(file, 'utf8').slice(0, 400); } catch { process.exit(0); }
const m = head.match(/^\/\/ GENERADO por (tools\/[\w.-]+)/m);
if (!m) process.exit(0);

const fuente = m[1] === 'tools/port-logic.mjs'
  ? 'tools/logic.source.js o tools/patches*.mjs, y luego ejecuta `node tools/port-logic.mjs`'
  : 'tools/template.html, y luego ejecuta `npm run convert`';
process.stderr.write(`${file} es un archivo GENERADO por ${m[1]}; los cambios a mano se pierden al regenerar. Edita ${fuente} (o usa /waack-on-kit:regen). Consulta la skill archivos-generados.\n`);
process.exit(2);
