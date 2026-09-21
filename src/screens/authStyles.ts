import type { CSSProperties } from 'react';

// Pantallas de acceso: siempre oscuras (igual que el login del diseño), con tarjeta de vidrio.
export const S = {
  page: { position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'radial-gradient(130% 100% at 50% 44%, #16171A 0%, #0B0B0D 48%, #000000 100%)', overflow: 'auto', fontFamily: 'Geist,system-ui,sans-serif' } as CSSProperties,
  card: { position: 'relative', width: '100%', maxWidth: 520, padding: '36px 34px 28px', borderRadius: 22, background: 'linear-gradient(160deg, rgba(226,232,240,.16), rgba(148,163,184,.07))', backdropFilter: 'blur(40px) saturate(150%)', WebkitBackdropFilter: 'blur(40px) saturate(150%)', border: '1px solid rgba(202,210,242,.3)', boxShadow: 'inset 0 1px 0 rgba(232,237,255,.42), 0 44px 96px -32px rgba(0,0,0,.75)', color: '#fff' } as CSSProperties,
  logo: { width: 110, height: 110, objectFit: 'contain', display: 'block', margin: '0 auto 6px', filter: 'drop-shadow(0 14px 34px rgba(0,0,0,.8))' } as CSSProperties,
  h1: { margin: '4px 0 6px', textAlign: 'center', fontSize: 22, fontWeight: 800, letterSpacing: '-.01em' } as CSSProperties,
  sub: { margin: '0 0 22px', textAlign: 'center', fontSize: 13, lineHeight: 1.5, color: 'rgba(226,231,255,.72)' } as CSSProperties,
  label: { display: 'block', fontFamily: "'Geist Mono',monospace", fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(226,231,255,.7)', margin: '0 0 6px 2px' } as CSSProperties,
  input: { display: 'block', width: '100%', boxSizing: 'border-box', padding: '13px 16px', marginBottom: 14, borderRadius: 14, border: '1px solid rgba(202,210,242,.34)', background: 'rgba(160,168,205,.16)', boxShadow: 'inset 0 1px 0 rgba(230,235,255,.3)', fontFamily: 'Geist,sans-serif', fontSize: 14.5, color: '#fff', outline: 'none' } as CSSProperties,
  select: { display: 'block', width: '100%', boxSizing: 'border-box', padding: '13px 16px', marginBottom: 14, borderRadius: 14, border: '1px solid rgba(202,210,242,.34)', background: 'rgba(160,168,205,.16)', boxShadow: 'inset 0 1px 0 rgba(230,235,255,.3)', fontFamily: 'Geist,sans-serif', fontSize: 14.5, color: '#fff', outline: 'none', colorScheme: 'dark' } as CSSProperties,
  row: { display: 'flex', gap: 12, flexWrap: 'wrap' } as CSSProperties,
  primary: { display: 'block', width: '100%', padding: 15, borderRadius: 14, border: 0, fontFamily: 'Geist,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg,#FF7A2F,#FF2E86)', boxShadow: '0 14px 34px -10px rgba(255,60,130,.65), inset 0 1px 0 rgba(255,255,255,.45)', cursor: 'pointer' } as CSSProperties,
  secondary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: 13, borderRadius: 14, border: '1px solid rgba(202,210,242,.34)', background: 'rgba(160,168,205,.16)', fontFamily: 'Geist,sans-serif', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' } as CSSProperties,
  err: { fontSize: 12.5, color: '#FF9A7A', margin: '0 0 12px', lineHeight: 1.45 } as CSSProperties,
  ok: { fontSize: 12.5, color: '#8FE3B0', margin: '0 0 12px', lineHeight: 1.45 } as CSSProperties,
  hint: { fontSize: 11.5, color: 'rgba(226,231,255,.6)', margin: '-8px 0 14px 2px', lineHeight: 1.45 } as CSSProperties,
  check: { display: 'flex', alignItems: 'flex-start', gap: 10, margin: '4px 0 16px', fontSize: 12.5, lineHeight: 1.5, color: 'rgba(226,231,255,.82)', cursor: 'pointer' } as CSSProperties,
  link: { color: '#fff', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' } as CSSProperties,
  foot: { marginTop: 20, textAlign: 'center', fontSize: 13, color: 'rgba(226,231,255,.72)' } as CSSProperties,
  seg: { display: 'flex', gap: 6, padding: 5, marginBottom: 18, borderRadius: 999, background: 'rgba(160,168,205,.12)', border: '1px solid rgba(202,210,242,.24)' } as CSSProperties,
  segBtn: (on: boolean): CSSProperties => ({ flex: 1, textAlign: 'center', padding: '10px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: on ? '1px solid rgba(202,210,242,.4)' : '1px solid transparent', background: on ? 'rgba(255,255,255,.16)' : 'transparent', color: on ? '#fff' : 'rgba(226,231,255,.72)' }),
};

export const GoogleIcon = 'M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z';
