// Arma la carpeta `deploy/` que Firebase Hosting sirve: la landing page estática en la raíz
// (landing/*) y la app (ya compilada por `vite build` en dist/, con base: '/account/') bajo
// deploy/account/. Se corre después de `vite build` — ver "build:deploy" en package.json.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const landingDir = join(root, 'landing');
const distDir = join(root, 'dist');
const deployDir = join(root, 'deploy');

if (!existsSync(landingDir)) throw new Error('Falta la carpeta landing/ (la landing page).');
if (!existsSync(distDir)) throw new Error('Falta dist/ — corre "vite build" antes que este script.');

rmSync(deployDir, { recursive: true, force: true });
mkdirSync(deployDir, { recursive: true });

cpSync(landingDir, deployDir, { recursive: true });
cpSync(distDir, join(deployDir, 'account'), { recursive: true });

console.log('deploy/ listo: landing en la raíz, app en deploy/account/.');
