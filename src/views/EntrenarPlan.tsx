// Plan de clase (75 min) — pestaña de "Entrenar con otros estilos". Bloques con minutos ajustables y horarios.
import { useEffect, useState } from 'react';
import { glass, mono, pill, field, readJson, writeJson } from '../lib/entrenar/ui';
import type { T } from '../lib/entrenar/ui';

const KEY = 'waack-entrenar-plan';
const DEFAULT_PLAN = [8, 10, 10, 12, 15, 15, 5];
const COLORS = ['var(--yellow)', 'var(--blue)', 'var(--gold)', 'var(--pink)', 'var(--purple)', 'var(--blue)', 'var(--yellow)'];

export const fmtClock = (mins: number) => `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

export default function EntrenarPlan({ t }: { t: T }) {
  const saved = readJson<{ plan?: number[]; start?: string }>(KEY, {});
  const [plan, setPlan] = useState<number[]>(Array.isArray(saved.plan) && saved.plan.length === DEFAULT_PLAN.length ? saved.plan : DEFAULT_PLAN);
  const [start, setStart] = useState(/^\d{2}:\d{2}$/.test(saved.start ?? '') ? (saved.start as string) : '18:00');
  useEffect(() => writeJson(KEY, { plan, start }), [plan, start]);

  const blocks: string[][] = t('blocks');
  const [h, m] = start.split(':').map(Number);
  const t0 = (h || 0) * 60 + (m || 0);
  const total = plan.reduce((a, b) => a + b, 0);
  const starts = plan.map((_, i) => t0 + plan.slice(0, i).reduce((a, b) => a + b, 0));
  const adjust = (i: number, d: number) => setPlan(plan.map((v, j) => (j === i ? Math.max(5, Math.min(60, v + d)) : v)));

  return (
    <div role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 680 }}>{t('clase_lead')}</div>
      <div style={{ ...glass, padding: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 24px', marginBottom: 14 }}>
          <label htmlFor="ent-start" style={mono}>{t('starts')}</label>
          <input id="ent-start" type="time" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} style={field} />
          <span style={mono}>{t('total')}: <b style={{ color: 'var(--ink)' }}>{t('min', { n: total })}</b></span>
          <span style={mono}>{t('ends')}: <b style={{ color: 'var(--ink)' }}>{fmtClock(t0 + total)}</b></span>
        </div>
        <div aria-hidden="true" style={{ display: 'flex', height: 30, borderRadius: 999, overflow: 'hidden', background: 'var(--hair)', marginBottom: 10 }}>
          {plan.map((v, i) => (
            <div key={i} style={{ width: `${(v / total) * 100}%`, background: COLORS[i], color: '#1A1400', fontFamily: "'Geist Mono',monospace", fontSize: 10, fontWeight: 700, lineHeight: '30px', paddingLeft: 8, overflow: 'hidden', whiteSpace: 'nowrap' }}>{v}</div>
          ))}
        </div>
        {plan.map((v, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '10px minmax(0,1fr) auto', gap: 14, alignItems: 'start', padding: '14px 0', borderTop: i ? '1px solid var(--hair-soft)' : undefined }}>
            <span style={{ alignSelf: 'stretch', minHeight: 44, borderRadius: 3, background: COLORS[i] }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{blocks[i][0]}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>{blocks[i][1]}</div>
              <div style={{ ...mono, marginTop: 4, letterSpacing: '.1em' }}>{fmtClock(starts[i])} – {fmtClock(starts[i] + v)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button style={{ ...pill, padding: 0, width: 34, height: 34, justifyContent: 'center' }} aria-label={t('less', { b: blocks[i][0] })} onClick={() => adjust(i, -5)}>−</button>
              <output style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 700, minWidth: '4.2ch', textAlign: 'center', fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>{t('min', { n: v })}</output>
              <button style={{ ...pill, padding: 0, width: 34, height: 34, justifyContent: 'center' }} aria-label={t('more', { b: blocks[i][0] })} onClick={() => adjust(i, 5)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
