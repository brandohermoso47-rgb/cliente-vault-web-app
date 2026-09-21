// Busca credenciales en los archivos versionados (o, con --staged, en lo que está a punto de commitearse).
//   node tools/scan-secrets.mjs            → todo el árbol versionado
//   node tools/scan-secrets.mjs --staged   → solo lo preparado para el commit (hook pre-commit)
// Sale con código 1 si encuentra algo. Los secretos reales van en variables de entorno / Secret Manager, nunca en el código.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const staged = process.argv.includes('--staged');
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 });

const RULES = [
  ['Clave de API de Google/Firebase', /AIza[0-9A-Za-z_-]{30,}/],
  ['Clave secreta o publicable de Stripe', /\b(sk|rk|pk)_(live|test)_[A-Za-z0-9]{10,}/],
  ['Secreto de webhook de Stripe', /\bwhsec_[A-Za-z0-9]{12,}/],
  ['Clave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Token de GitHub', /\bgh[pousr]_[A-Za-z0-9]{20,}/],
  ['Token de Slack', /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ['Clave de acceso de AWS', /\bAKIA[0-9A-Z]{16}\b/],
  ['Cuenta de servicio de Google (JSON)', /"private_key_id"\s*:/],
  ['URL de base de datos con contraseña', /\b(postgres(ql)?|mysql|mongodb(\+srv)?):\/\/[^\s:@/]+:[^\s@/]{3,}@/],
  ['Contraseña o secreto literal', /\b(password|passwd|secret|api[_-]?key|client[_-]?secret)\b["']?\s*[:=]\s*["'][A-Za-z0-9+/_\-.!@#$%^&*]{12,}["']/i],
];
// Archivos que no se escanean: dependencias fijadas, binarios y este propio script.
const SKIP = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$|\.(png|jpe?g|gif|webp|ico|woff2?|mp4|pdf|bundle)$|^tools\/scan-secrets\.mjs$/;
// Línea marcada como falso positivo consciente.
const ALLOW = /scan-secrets:allow/;

const files = staged
  ? git('diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z').split('\0').filter(Boolean)
  : git('ls-files', '-z').split('\0').filter(Boolean);

const mask = (s) => (s.length > 10 ? s.slice(0, 6) + '…' + s.slice(-2) : '***');
let found = 0;
for (const f of files) {
  if (SKIP.test(f)) continue;
  let text;
  try { text = staged ? git('show', `:${f}`) : readFileSync(f, 'utf8'); } catch { continue; }
  if (text.includes('\0')) continue; // binario
  text.split('\n').forEach((line, i) => {
    if (ALLOW.test(line)) return;
    for (const [name, re] of RULES) {
      const m = re.exec(line);
      if (m) { found++; console.error(`✗ ${f}:${i + 1}  ${name}  (${mask(m[0])})`); }
    }
  });
}
if (found) {
  console.error(`\n${found} posible(s) credencial(es). Muévelas a variables de entorno o a Secret Manager y, si ya se publicaron, rótalas.`);
  process.exit(1);
}
console.log(`✓ Sin credenciales en ${files.length} archivo(s) ${staged ? 'preparados para el commit' : 'versionados'}.`);
