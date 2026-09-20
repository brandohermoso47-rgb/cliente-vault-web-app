// Utilidades mínimas que reemplazan al runtime del prototipo (estilos como string y :hover/:focus).
import type { CSSProperties } from 'react';

const camel = (s: string) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

export function parseCss(css: string): CSSProperties {
  const o: Record<string, string> = {};
  let depth = 0, q = '', cur = '';
  const decls: string[] = [];
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
    if (p) o[p.startsWith('--') ? p : camel(p)] = d.slice(i + 1).trim();
  }
  return o as CSSProperties;
}

export function sty(v: unknown): CSSProperties | undefined {
  if (v == null || v === false) return undefined;
  if (typeof v === 'string') return parseCss(v);
  return v as CSSProperties;
}

// :hover / :focus declarados en el prototipo con style-hover / style-focus.
let sheet: CSSStyleSheet | null = null;
const cache = new Map<string, string>();
let n = 0;
export function pc(pseudo: string, css: string): string {
  const k = pseudo + '|' + css;
  const hit = cache.get(k);
  if (hit) return hit;
  if (!sheet) {
    const el = document.createElement('style');
    document.head.appendChild(el);
    sheet = el.sheet;
  }
  const cls = 'scp' + (n++).toString(36);
  const body = css.split(';').filter(Boolean).map((d) => (/!important\s*$/.test(d) ? d : d + ' !important')).join(';');
  sheet!.insertRule(`.${cls}:${pseudo}{${body}}`, sheet!.cssRules.length);
  cache.set(k, cls);
  return cls;
}

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');
