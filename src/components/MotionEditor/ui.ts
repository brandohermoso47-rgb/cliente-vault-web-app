import type { CSSProperties } from 'react';

export const card: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '20px',
  borderRadius: '16px',
  border: '1px solid var(--hair)',
  background: 'var(--glass)',
  backdropFilter: 'var(--lg-blur)',
  WebkitBackdropFilter: 'var(--lg-blur)',
  boxShadow: 'var(--lg-edge)',
};

export function btn(kind: 'primary' | 'ghost' | 'danger' = 'ghost', active = false): CSSProperties {
  const base: CSSProperties = {
    padding: '8px 14px',
    borderRadius: '999px',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    border: '1px solid var(--hair)',
    background: 'var(--glass-2)',
    color: 'var(--ink-2)',
  };
  if (kind === 'primary' || active) return { ...base, fontWeight: 700, border: '1px solid transparent', background: 'var(--pink)', color: '#fff' };
  if (kind === 'danger') return { ...base, color: '#FF6B6B' };
  return base;
}

export const label: CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' };
export const muted: CSSProperties = { fontSize: '12.5px', color: 'var(--ink-2)', lineHeight: 1.5 };

export function fmtTime(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function fmtPrecise(ms: number): string {
  return `${fmtTime(ms)}.${Math.floor((ms % 1000) / 100)}`;
}
