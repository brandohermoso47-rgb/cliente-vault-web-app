// Convierte la plantilla del prototipo (x-dc: sc-if / sc-for / {{ expr }}) a componentes TSX.
// Uso: npm run convert   (lee tools/template.html y escribe src/views/*.tsx + src/Shell.tsx)
import { parseDocument } from 'htmlparser2';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'tools/template.html'), 'utf8');
const doc = parseDocument(html, { lowerCaseAttributeNames: false, lowerCaseTags: true, recognizeSelfClosing: true });

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*/;
const INLINE = new Set(['span', 'b', 'a', 'i', 'em', 'strong', 'small', 'u', 'code']);
const VOID = new Set(['input', 'img', 'br', 'hr']);

// ── expresiones {{ ... }} → JS ────────────────────────────────────────────
function expr(src, scope) {
  const e = src.trim();
  if (e[0] === '!') return '!' + expr(e.slice(1), scope);
  const eq = e.match(/^(.+?)\s*(===|!==|==|!=)\s*(.+)$/);
  if (eq) return `${expr(eq[1], scope)} ${eq[2]} ${expr(eq[3], scope)}`;
  if (/^(true|false|null|undefined)$/.test(e) || /^-?\d+(\.\d+)?$/.test(e)) return e;
  if (/^(['"]).*\1$/.test(e)) return JSON.stringify(e.slice(1, -1));
  const head = e.match(IDENT);
  if (!head) throw new Error('expr no soportada: ' + src);
  let out = scope.has(head[0]) ? head[0] : 'v.' + head[0];
  let i = head[0].length;
  while (i < e.length) {
    if (e[i] === '.') {
      const m = e.slice(i + 1).match(/^[A-Za-z_$0-9][A-Za-z0-9_$]*/);
      out += /^\d/.test(m[0]) ? `?.[${m[0]}]` : `?.${m[0]}`;
      i += 1 + m[0].length;
    } else if (e[i] === '[') {
      let d = 1, j = i + 1;
      while (d) { if (e[j] === '[') d++; else if (e[j] === ']') d--; j++; }
      out += `?.[${expr(e.slice(i + 1, j - 1), scope)}]`;
      i = j;
    } else throw new Error('expr no soportada: ' + src);
  }
  return out;
}

// Atributo con posibles {{ }} → expresión JS (string o valor)
function attrExpr(raw, scope) {
  const whole = raw.match(/^\s*\{\{([\s\S]+?)\}\}\s*$/);
  if (whole) return expr(whole[1], scope);
  if (!raw.includes('{{')) return JSON.stringify(raw);
  const parts = raw.split(/\{\{([\s\S]+?)\}\}/g);
  return '`' + parts.map((p, i) => (i & 1 ? '${' + expr(p, scope) + ' ?? ""}' : p.replace(/[`\\$]/g, '\\$&'))).join('') + '`';
}

const kebabToCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
function cssObj(css) {
  const o = {};
  let depth = 0, q = '', cur = '';
  const decls = [];
  for (const ch of css) {
    if (q) { if (ch === q) q = ''; }
    else if (ch === '"' || ch === "'") q = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ';' && !depth && !q) { decls.push(cur); cur = ''; } else cur += ch;
  }
  decls.push(cur);
  for (const d of decls) {
    const i = d.indexOf(':');
    if (i < 0) continue;
    const p = d.slice(0, i).trim();
    if (!p) continue;
    o[p.startsWith('--') ? p : kebabToCamel(p)] = d.slice(i + 1).trim();
  }
  return o;
}

const EVENTS = { onclick: 'onClick', onchange: 'onChange', oninput: 'onInput', onkeydown: 'onKeyDown', onmouseenter: 'onMouseEnter', onmouseleave: 'onMouseLeave' };
const NO_CAMEL = /^(data-|aria-)/;

function attrs(el, scope) {
  const out = [];
  const pseudo = [];
  for (const [name, val] of Object.entries(el.attribs)) {
    if (name.startsWith('hint-') || name === 'data-dc-tpl') continue;
    if (name.startsWith('style-')) { pseudo.push(`pc(${JSON.stringify(name.slice(6))}, ${attrExpr(val, scope)})`); continue; }
    let key = name;
    if (key === 'class') key = 'className';
    else if (key === 'for') key = 'htmlFor';
    else if (key === 'ref') key = 'ref';
    else if (EVENTS[key.toLowerCase()]) key = EVENTS[key.toLowerCase()];
    else if (!NO_CAMEL.test(key) && key.includes('-')) key = kebabToCamel(key);
    if (key === 'style') {
      out.push(val.includes('{{') ? `style={sty(${attrExpr(val, scope)})}` : `style={${JSON.stringify(cssObj(val))}}`);
    } else if (key === 'className' && !val.includes('{{')) {
      out.push(`className=${JSON.stringify(val)}`);
    } else if (val.includes('{{')) {
      out.push(`${key}={${attrExpr(val, scope)}}`);
    } else if (key === 'value' || key === 'placeholder' || /^[a-zA-Z]+$/.test(key) === false) {
      out.push(`${key}=${JSON.stringify(val)}`);
    } else if (['width', 'height', 'min', 'max', 'step', 'rows', 'cx', 'cy', 'r', 'x', 'y', 'rx', 'ry'].includes(key)) {
      out.push(`${key}=${JSON.stringify(val)}`);
    } else out.push(`${key}=${JSON.stringify(val)}`);
  }
  if (pseudo.length) {
    const has = out.findIndex((a) => a.startsWith('className='));
    const cls = `cx(${pseudo.join(', ')}${has >= 0 ? ', ' + out[has].replace(/^className=\{?/, '').replace(/\}$/, '') : ''})`;
    if (has >= 0) out.splice(has, 1);
    out.push(`className={${cls}}`);
  }
  return out.length ? ' ' + out.join(' ') : '';
}

// ── nodos → JSX ───────────────────────────────────────────────────────────
const styleOf = (el) => (el && el.attribs && el.attribs.style) || '';
function realParent(n) {
  let p = n.parent;
  while (p && (p.name === 'sc-if' || p.name === 'sc-for')) p = p.parent;
  return p;
}
const isInlineish = (n) => n && (n.type === 'text' || (n.type === 'tag' && INLINE.has(n.name)));

function nodes(list, scope, ind) {
  let out = '';
  list.forEach((n, i) => { out += node(n, scope, ind, list, i); });
  return out;
}

function node(n, scope, ind, sibs, idx) {
  const pad = '  '.repeat(ind);
  if (n.type === 'text') {
    const t = n.data;
    if (!t.trim()) {
      if (!t.includes(' ')) return '';
      const par = realParent(n);
      const ps = styleOf(par);
      if (/display:\s*(inline-)?(flex|grid)/.test(ps)) return '';
      const prev = sibs[idx - 1], next = sibs[idx + 1];
      return prev && next && (isInlineish(prev) || isInlineish(next)) ? `${pad}{' '}\n` : '';
    }
    const parts = t.replace(/\s+/g, ' ').split(/\{\{([\s\S]+?)\}\}/g);
    return parts.map((p, i) => {
      if (i & 1) return `${pad}{${expr(p, scope)}}\n`;
      return p ? `${pad}{${JSON.stringify(p)}}\n` : '';
    }).join('');
  }
  if (n.type !== 'tag') return '';
  if (n.name === 'sc-if') {
    const c = attrExpr(n.attribs.value, scope);
    return `${pad}{${c} && (\n${pad}  <>\n${nodes(n.children, scope, ind + 2)}${pad}  </>\n${pad})}\n`;
  }
  if (n.name === 'sc-for') {
    const as = n.attribs.as || 'item';
    const inner = new Set([...scope, as, '$index']);
    return `${pad}{(${attrExpr(n.attribs.list, scope)} ?? []).map((${as}: any, $index: number) => (\n${pad}  <Fragment key={$index}>\n${nodes(n.children, inner, ind + 2)}${pad}  </Fragment>\n${pad}))}\n`;
  }
  if (n.name === 'image-slot') return `${pad}<image-slot${attrs(n, scope)}></image-slot>\n`;
  const a = attrs(n, scope);
  if (VOID.has(n.name)) return `${pad}<${n.name}${a} />\n`;
  const kids = nodes(n.children, scope, ind + 1);
  return kids.trim() ? `${pad}<${n.name}${a}>\n${kids}${pad}</${n.name}>\n` : `${pad}<${n.name}${a}></${n.name}>\n`;
}

// ── localizar bloques ─────────────────────────────────────────────────────
const top = doc.children.filter((c) => c.type === 'tag');
const rootDiv = top[0]; // <div data-theme ...>
const rootKids = rootDiv.children.filter((c) => c.type === 'tag');
const find = (list, pred) => { for (const n of list) { if (pred(n)) return n; if (n.children) { const r = find(n.children.filter((c) => c.type === 'tag'), pred); if (r) return r; } } return null; };
const content = find(rootKids, (n) => n.name === 'div' && /^flex:1;padding:32px;overflow:auto/.test(styleOf(n)));
if (!content) throw new Error('no se encontró el contenedor de contenido');

const HEADER = (extra = '') => `// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr \`npm run convert\`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '${extra}dc';
`;

mkdirSync(join(root, 'src/views'), { recursive: true });
const used = new Map();
const viewNames = [];
const views = content.children.filter((c) => c.type === 'tag' && c.name === 'sc-if');
for (const vw of views) {
  const cond = vw.attribs.value.replace(/[{}\s]/g, '');
  let name = cond.replace(/^(is|show)/, '') || 'View';
  name = name[0].toUpperCase() + name.slice(1);
  const k = (used.get(name) ?? 0) + 1;
  used.set(name, k);
  if (k > 1) name += k;
  const body = nodes(vw.children, new Set(), 2);
  writeFileSync(join(root, `src/views/${name}.tsx`), `${HEADER('../lib/')}\nexport default function ${name}({ v }: { v: any }) {\n  return (\n    <>\n${body}    </>\n  );\n}\n`);
  viewNames.push({ name, cond });
}
// El contenido lleva otros hijos que no son sc-if (si los hubiera)
const others = content.children.filter((c) => !(c.type === 'tag' && c.name === 'sc-if') && (c.type === 'tag' || c.data?.trim()));

// Login y chat (bloques hermanos del shell)
const loginBlock = rootKids.find((n) => n.name === 'sc-if' && /isLogin/.test(n.attribs.value));
const chatBlock = rootKids.filter((n) => n.name === 'sc-if' && /isApp/.test(n.attribs.value))[1];
const toggleBlock = rootKids.find((n) => n.name === 'sc-if' && /showLoginToggle/.test(n.attribs.value));
const appBlock = rootKids.find((n) => n.name === 'sc-if' && /isApp/.test(n.attribs.value));

writeFileSync(join(root, 'src/views/Login.tsx'), `${HEADER('../lib/')}\nexport default function Login({ v }: { v: any }) {\n  return (\n    <>\n${nodes(loginBlock.children, new Set(), 2)}    </>\n  );\n}\n`);
writeFileSync(join(root, 'src/views/ChatDock.tsx'), `${HEADER('../lib/')}\nexport default function ChatDock({ v }: { v: any }) {\n  return (\n    <>\n${nodes(chatBlock.children, new Set(), 2)}    </>\n  );\n}\n`);

// Shell: el bloque isApp con el contenido reemplazado por marcadores
const marker = { type: 'text', data: '@@CONTENT@@' };
const savedKids = content.children;
content.children = [marker];
const shellBody = nodes(appBlock.children, new Set(), 2);
content.children = savedKids;
const viewImports = viewNames.map((x) => `import ${x.name} from './views/${x.name}';`).join('\n');
const viewJsx = viewNames.map((x) => `        {${expr(x.cond, new Set())} && <${x.name} v={v} />}`).join('\n');
const shell = shellBody.replace(/\s*\{"@@CONTENT@@"\}\n/, `\n${viewJsx}\n`);
writeFileSync(join(root, 'src/Shell.tsx'), `${HEADER('./lib/')}${viewImports}\n\nexport default function Shell({ v }: { v: any }) {\n  return (\n    <>\n${shell}    </>\n  );\n}\n`);
writeFileSync(join(root, 'src/toggle.txt'), nodes(toggleBlock.children, new Set(), 0));
console.log('vistas:', viewNames.map((x) => x.name).join(', '), others.length ? `(+${others.length} nodos sueltos en contenido)` : '');
