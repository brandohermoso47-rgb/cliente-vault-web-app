// Estilos compartidos de "Entrenar con otros estilos": mismos tokens y "liquid glass" del resto de la plataforma.
import type { CSSProperties } from 'react';

export const glass: CSSProperties = { border: '1px solid var(--hair)', background: 'var(--glass)', backdropFilter: 'var(--lg-blur)', WebkitBackdropFilter: 'var(--lg-blur)', boxShadow: 'var(--lg-edge)', borderRadius: 22 };
export const mono: CSSProperties = { fontFamily: "'Geist Mono',monospace", fontSize: 9, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase' };
export const pill: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--hair)', background: 'var(--glass-2)', color: 'var(--ink-2)', fontFamily: 'inherit' };
export const gold: CSSProperties = { ...pill, fontWeight: 700, color: '#1A1400', border: 'none', background: 'linear-gradient(90deg,var(--gold-hi),var(--gold-lo))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5)' };
export const field: CSSProperties = { padding: '9px 12px', borderRadius: 12, border: '1px solid var(--hair)', background: 'var(--glass-2)', color: 'var(--ink)', fontFamily: 'inherit', fontSize: 13 };
export const serif: CSSProperties = { fontFamily: "'Instrument Serif',Georgia,serif", color: 'var(--ink)' };
export const inner: CSSProperties = { background: 'var(--glass-2)', borderRadius: 14, padding: '10px 12px', fontSize: 13, color: 'var(--ink-2)' };

export type T = (k: string, vars?: Record<string, string | number>) => any;

// Guarda/lee JSON en localStorage sin romper si el navegador lo bloquea.
export function readJson<V>(key: string, fallback: V): V {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as V) : fallback; } catch { return fallback; }
}
export function writeJson(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
}
