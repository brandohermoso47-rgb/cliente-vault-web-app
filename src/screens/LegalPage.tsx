import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

// Visor común de las páginas legales públicas (/privacidad, /terminos). No requieren sesión.
// Formato en los textos: **negrita**, {mail} = correo de contacto, [[pendiente]] = dato que debe completar la titularidad.
export const CONTACT = 'administrador@waack-on.com';

export type Block = { t: 'p'; x: string } | { t: 'ul'; x: string[] } | { t: 'table'; head: string[]; rows: string[][] };
export type Sec = { title: string; blocks: Block[] };
export type Doc = { title: string; updated: string; intro: string; back: string; copy: string; home: string; sections: Sec[] };
export type Lang = 'es' | 'en';

const NAMES: Record<Lang, { privacy: string; terms: string }> = {
  es: { privacy: 'Política de privacidad', terms: 'Términos de servicio' },
  en: { privacy: 'Privacy Policy', terms: 'Terms of Service' },
};

const wrap: CSSProperties = { minHeight: '100vh', background: 'var(--ground)', color: 'var(--ink)', fontFamily: 'Geist,system-ui,sans-serif', padding: '48px 20px 80px' };
const box: CSSProperties = { maxWidth: 860, margin: '0 auto' };
const card: CSSProperties = { border: '1px solid var(--hair)', background: 'var(--glass)', backdropFilter: 'var(--lg-blur)', WebkitBackdropFilter: 'var(--lg-blur)', boxShadow: 'var(--lg-edge), var(--lg-lift)', borderRadius: 22, padding: '28px 30px', marginTop: 18 };
const h2: CSSProperties = { margin: '0 0 12px', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' };
const pStyle: CSSProperties = { margin: '0 0 12px', fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-2)' };
const liStyle: CSSProperties = { margin: '0 0 8px', fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' };
const todo: CSSProperties = { background: 'rgba(245,197,24,.18)', borderRadius: 4, padding: '0 4px', color: 'var(--ink)' };
const th: CSSProperties = { textAlign: 'left', padding: '10px 12px', fontFamily: "'Geist Mono',monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-2)', borderBottom: '1px solid var(--hair)', verticalAlign: 'top' };
const td: CSSProperties = { padding: '10px 12px', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)', borderBottom: '1px solid var(--hair-soft)', verticalAlign: 'top' };

// **negrita**, {mail}, [[pendiente]]
export function rich(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\{mail\}|\[\[[^\]]+\]\])/g).filter(Boolean).map((part, i) => {
    if (part === '{mail}') return <a key={i} href={`mailto:${CONTACT}`} style={{ color: 'var(--pink)' }}>{CONTACT}</a>;
    if (part.startsWith('**')) return <b key={i} style={{ color: 'var(--ink)' }}>{part.slice(2, -2)}</b>;
    if (part.startsWith('[[')) return <span key={i} style={todo}>[{part.slice(2, -2)}]</span>;
    return part;
  });
}

function initialLang(): Lang {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'es') return q;
  return (navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
}

export default function LegalPage({ docs }: { docs: Record<Lang, Doc> }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const d = docs[lang];

  useEffect(() => {
    const dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, []);
  useEffect(() => {
    document.title = `${d.title} · Waack On`;
    document.documentElement.lang = lang;
  }, [lang, d.title]);

  const pill = (on: boolean): CSSProperties => ({ padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid ' + (on ? 'var(--hair)' : 'transparent'), background: on ? 'var(--glass)' : 'transparent', color: on ? 'var(--ink)' : 'var(--ink-2)' });
  const suffix = `?lang=${lang}`;

  return (
    <div style={wrap}>
      <div style={box}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink)' }}>
            <img src="/uploads/waack_on_gold_3d_depth.png" alt="Waack On" style={{ width: 54, height: 54, objectFit: 'contain' }} />
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>{d.back}</span>
          </a>
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, border: '1px solid var(--hair)', background: 'var(--glass-2)' }} role="group" aria-label="Language">
            <div style={pill(lang === 'es')} onClick={() => setLang('es')}>Español</div>
            <div style={pill(lang === 'en')} onClick={() => setLang('en')}>English</div>
          </div>
        </div>

        <h1 style={{ margin: '26px 0 8px', fontSize: 34, fontWeight: 800, letterSpacing: '-.02em' }}>{d.title}</h1>
        <p style={{ ...pStyle, marginBottom: 0 }}>{d.updated}</p>
        <p style={{ ...pStyle, marginTop: 14 }}>{d.intro}</p>

        {d.sections.map((sec, i) => (
          <section key={i} style={card} id={`s${i + 1}`}>
            <h2 style={h2}>{i + 1}. {sec.title}</h2>
            {sec.blocks.map((b, j) => {
              if (b.t === 'p') return <p key={j} style={pStyle}>{rich(b.x)}</p>;
              if (b.t === 'ul') return <ul key={j} style={{ margin: '0 0 12px', paddingLeft: 20 }}>{b.x.map((x, k) => <li key={k} style={liStyle}>{rich(x)}</li>)}</ul>;
              return (
                <div key={j} style={{ overflowX: 'auto', margin: '0 0 12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                    <thead><tr>{b.head.map((h, k) => <th key={k} style={th}>{h}</th>)}</tr></thead>
                    <tbody>{b.rows.map((r, k) => <tr key={k}>{r.map((c, m) => <td key={m} style={td}>{rich(c)}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              );
            })}
          </section>
        ))}

        <p style={{ ...pStyle, marginTop: 26, textAlign: 'center', fontSize: 12.5 }}>
          {d.copy} · <a href={`/privacidad${suffix}`} style={{ color: 'var(--pink)' }}>{NAMES[lang].privacy}</a> · <a href={`/terminos${suffix}`} style={{ color: 'var(--pink)' }}>{NAMES[lang].terms}</a> · <a href="/" style={{ color: 'var(--pink)' }}>{d.home}</a>
        </p>
      </div>
    </div>
  );
}
