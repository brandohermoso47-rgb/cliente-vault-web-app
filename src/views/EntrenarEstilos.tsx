// Entrenar con otros estilos — Laboratorio Freestyle.
// Combina tu otro estilo con Waacking: estudio de 8 tiempos con metrónomo, mapa de estilos, ruta de
// cross-training para Waacking, calentamiento guiado y quiz. Vista escrita a mano (no la genera
// tools/convert.mjs); el convert solo la monta dentro de Lab. Los textos viven en 6 idiomas en
// src/lib/entrenar/data.ts y la elección se guarda en este navegador (localStorage).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { DATA, LANGS, MV_ES, SKILL_KEYS, STYLES as BASE, UI, YTQ } from '../lib/entrenar/data';
import type { Lang, StyleDef } from '../lib/entrenar/data';
import { glass, mono, pill, gold, field } from '../lib/entrenar/ui';
import EntrenarCamara from './EntrenarCamara';
import EntrenarPlan from './EntrenarPlan';

const KEY = 'waack-entrenar';
type TabId = 'estudio' | 'estilos' | 'ruta' | 'calentamiento' | 'autoevaluacion' | 'clase' | 'quiz';
// Mismo orden que UI[lang].tabs en src/lib/entrenar/data.ts
const TABS: TabId[] = ['estudio', 'estilos', 'ruta', 'calentamiento', 'autoevaluacion', 'clase', 'quiz'];

const EXAMPLE_PHRASES = [
  ['Hit', 'Hit', 'Wave', '', 'Tick', 'Tick', 'Strobe', 'Dime stop'],
  ['Robot', '', 'Float', '', 'Boogaloo roll', '', 'Hit', 'Dime stop']
];
const DEFAULT_WEEK = ['waacking', 'popping', 'hiphop', 'voguing', 'house', 'flexing'];

interface Saved { lang: Lang; bpm: number; style: string; phrases: string[][]; week: string[] }

function load(): Saved {
  const d: Saved = { lang: 'es', bpm: 100, style: 'popping', phrases: EXAMPLE_PHRASES.map((p) => p.slice()), week: DEFAULT_WEEK.slice() };
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!o) return d;
    if (LANGS.some((l) => l.id === o.lang)) d.lang = o.lang;
    if (typeof o.bpm === 'number') d.bpm = Math.max(60, Math.min(160, Math.round(o.bpm)));
    if (BASE.some((s) => s.id === o.style)) d.style = o.style;
    if (Array.isArray(o.phrases) && o.phrases.length && o.phrases.every((p: unknown) => Array.isArray(p) && p.length === 8)) d.phrases = o.phrases;
    if (Array.isArray(o.week) && o.week.length === 6) d.week = o.week;
  } catch { /* localStorage no disponible: se usan los valores por defecto */ }
  return d;
}

function localized(lang: Lang): StyleDef[] {
  if (lang === 'es') return BASE;
  const dict = DATA[lang];
  return BASE.map((s) => {
    const d = dict[s.id];
    return d ? { ...s, origin: d[0], feel: d[1], pioneers: d[2], drill: d[3], gives: d[4], wdrill: d[5], clues: [d[6], d[7]] } : s;
  });
}

const CSS = `
.ent-fig line,.ent-fig circle{stroke:#EFEAE0;stroke-width:4;stroke-linecap:round;fill:none}
.ent-fig .armL line,.ent-fig .armR line{stroke:var(--yellow)}
.ent-fig g,.ent-fig circle{transform-box:view-box}
@keyframes ent-spin{to{transform:rotate(360deg)}}
@keyframes ent-spinr{to{transform:rotate(-360deg)}}
@keyframes ent-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
@keyframes ent-shx{0%,100%{transform:translateX(-6px)}50%{transform:translateX(6px)}}
@keyframes ent-sway{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}
@keyframes ent-squatL{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.7)}}
@keyframes ent-squatU{0%,100%{transform:translateY(0)}50%{transform:translateY(14px)}}
@keyframes ent-tilt{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)}}
@keyframes ent-tilt2{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
.ent-f0 .armR{animation:ent-spin 4s linear infinite;transform-origin:60px 40px}
.ent-f0 .armL{animation:ent-spinr 4s linear infinite;transform-origin:60px 40px}
.ent-f0 .head{animation:ent-tilt 4s ease-in-out infinite;transform-origin:60px 32px}
.ent-f1 .all{animation:ent-bob .67s ease-in-out infinite}
.ent-f2 .upper{animation:ent-shx 1.6s ease-in-out infinite}
.ent-f3 .armR{animation:ent-spin 2.4s linear infinite;transform-origin:60px 40px}
.ent-f3 .armL{animation:ent-spinr 2.4s linear infinite;transform-origin:60px 40px}
.ent-f4 .upper{animation:ent-sway 2s ease-in-out infinite;transform-origin:60px 80px}
.ent-f5 .legs{animation:ent-squatL 2.4s ease-in-out infinite;transform-origin:60px 128px}
.ent-f5 .upper{animation:ent-squatU 2.4s ease-in-out infinite}
.ent-f6 .head{animation:ent-tilt 1.8s ease-in-out infinite;transform-origin:60px 32px}
.ent-f6 .torso{animation:ent-tilt2 1.8s ease-in-out .25s infinite;transform-origin:60px 80px}
.ent-f6 .armL{animation:ent-tilt2 1.8s ease-in-out .4s infinite;transform-origin:60px 40px}
.ent-f6 .armR{animation:ent-tilt2 1.8s ease-in-out .4s infinite reverse;transform-origin:60px 40px}
@media (prefers-reduced-motion:reduce){.ent-fig *{animation:none!important}}
`;

function Fig({ i, label }: { i: number; label: string }) {
  return (
    <svg className={`ent-fig ent-f${i}`} viewBox="0 0 120 140" role="img" aria-label={label} style={{ height: '100%', width: 'auto', maxWidth: '100%' }}>
      <g className="all">
        <g className="legs"><line x1="60" y1="80" x2="46" y2="128" /><line x1="60" y1="80" x2="74" y2="128" /></g>
        <g className="upper">
          <line className="torso" x1="60" y1="34" x2="60" y2="80" />
          <circle className="head" cx="60" cy="22" r="10" />
          <g className="armL"><line x1="60" y1="40" x2="42" y2="62" /><line x1="42" y1="62" x2="36" y2="86" /></g>
          <g className="armR"><line x1="60" y1="40" x2="78" y2="62" /><line x1="78" y1="62" x2="84" y2="86" /></g>
        </g>
      </g>
    </svg>
  );
}

type Q = { kind: 'clue' | 'move' | 'pio'; sid: string; ci?: number; m?: string; opts: string[] };
function makeQuiz(styles: StyleDef[]): Q[] {
  const pool: Omit<Q, 'opts'>[] = [];
  styles.forEach((s) => {
    s.clues.forEach((_, ci) => pool.push({ kind: 'clue', sid: s.id, ci }));
    pool.push({ kind: 'move', sid: s.id, m: s.moves[Math.floor(Math.random() * s.moves.length)] });
    pool.push({ kind: 'pio', sid: s.id });
  });
  const shuffle = <T,>(a: T[]) => a.slice().sort(() => Math.random() - 0.5);
  return shuffle(pool)
    .filter((x, i, arr) => arr.findIndex((y) => y.sid === x.sid) === i)
    .slice(0, 5)
    .map((q) => ({ ...q, opts: shuffle([q.sid, ...shuffle(styles.filter((s) => s.id !== q.sid)).slice(0, 3).map((s) => s.id)]) }));
}

export default function EntrenarEstilos() {
  const init = useMemo(load, []);
  const [lang, setLang] = useState<Lang>(init.lang);
  const [tab, setTab] = useState<TabId>('estudio');
  const [bpm, setBpm] = useState(init.bpm);
  const [styleId, setStyleId] = useState(init.style);
  const [phrases, setPhrases] = useState<string[][]>(init.phrases);
  const [sel, setSel] = useState<[number, number]>([0, 0]);
  const [week, setWeek] = useState<string[]>(init.week);
  const [skill, setSkill] = useState(SKILL_KEYS[0]);
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [sub, setSub] = useState(false);
  const [mute, setMute] = useState(false);
  const [wt, setWt] = useState<{ i: number; left: number } | null>(null);
  const [wtDone, setWtDone] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<Q[]>([]);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const styles = useMemo(() => localized(lang), [lang]);
  const byId = useCallback((id: string) => styles.find((s) => s.id === id), [styles]);
  const cur = byId(styleId) ?? styles[0];

  const t = useCallback((k: string, vars?: Record<string, string | number>): any => {
    let s = (UI[lang] as Record<string, any>)[k];
    if (s === undefined) s = UI.es[k];
    if (typeof s === 'string' && vars) for (const x of Object.keys(vars)) s = s.split('{' + x + '}').join(String(vars[x]));
    return s;
  }, [lang]);
  const mv = (m: string) => (lang === 'es' && MV_ES[m]) || m;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ lang, bpm, style: styleId, phrases, week })); } catch { /* sin almacenamiento */ }
  }, [lang, bpm, styleId, phrases, week]);

  useEffect(() => { setQuiz(makeQuiz(styles)); setQi(0); setScore(0); setPicked(null); }, [styles]);

  /* ---------- metrónomo (Web Audio, agenda con adelanto) ---------- */
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const stepRef = useRef(0);
  const nextRef = useRef(0);
  const live = useRef({ bpm, total: phrases.length * 8, sub, mute, playing });
  live.current = { bpm, total: phrases.length * 8, sub, mute, playing };

  const click = (time: number, accent: number, soft: boolean) => {
    const ctx = ctxRef.current;
    if (!ctx || live.current.mute) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = soft ? 700 : accent === 2 ? 1500 : accent === 1 ? 1000 : 820;
    const vol = soft ? 0.05 : accent ? 0.18 : 0.11;
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0008, time + 0.06);
    o.connect(g).connect(ctx.destination);
    o.start(time);
    o.stop(time + 0.07);
  };
  const sched = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { bpm: b, total, sub: sb } = live.current, spb = 60 / b;
    while (nextRef.current < ctx.currentTime + 0.15) {
      const tm = nextRef.current, st = stepRef.current % total, c = st % 8;
      click(tm, c === 0 ? 2 : c === 4 ? 1 : 0, false);
      window.setTimeout(() => { if (live.current.playing) setNow(st); }, Math.max(0, (tm - ctx.currentTime) * 1000));
      if (sb) click(tm + spb / 2, 0, true);
      stepRef.current = (st + 1) % total;
      nextRef.current += spb;
    }
  };
  const stop = () => { window.clearInterval(timerRef.current); live.current.playing = false; setPlaying(false); setNow(null); };
  const start = () => {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    ctxRef.current = ctxRef.current || new AC();
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
    live.current.playing = true;
    stepRef.current = 0;
    nextRef.current = ctxRef.current.currentTime + 0.08;
    timerRef.current = window.setInterval(sched, 25);
    setPlaying(true);
  };
  useEffect(() => () => { window.clearInterval(timerRef.current); window.clearInterval(wtRef.current); void ctxRef.current?.close(); }, []);
  useEffect(() => { if (tab !== 'estudio' && playing) stop(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- constructor de frases ---------- */
  const assign = (m: string) => {
    let [p, c] = sel;
    if (!phrases[p]) { p = 0; c = 0; }
    setPhrases(phrases.map((ph, i) => (i === p ? ph.map((x, j) => (j === c ? m : x)) : ph)));
    c++;
    if (c > 7) { c = 0; p = (p + 1) % phrases.length; }
    setSel([p, c]);
  };
  const addPhrase = () => phrases.length < 6 && setPhrases([...phrases, Array(8).fill('')]);
  const delPhrase = () => { if (phrases.length > 1) { setPhrases(phrases.slice(0, -1)); if (sel[0] >= phrases.length - 1) setSel([0, 0]); } };
  const clearAll = () => { setPhrases(phrases.map(() => Array(8).fill(''))); setSel([0, 0]); };
  const randomize = () => setPhrases(phrases.map(() => Array.from({ length: 8 }, (_, i) => (i % 2 && Math.random() < 0.5 ? '' : cur.moves[Math.floor(Math.random() * cur.moves.length)]))));
  const useStyle = (s: StyleDef) => { setStyleId(s.id); setBpm(s.mid); setTab('estudio'); };
  const nowP = now === null ? -1 : Math.floor(now / 8), nowC = now === null ? -1 : now % 8;
  const nowMove = now === null ? '' : phrases[nowP]?.[nowC] ?? '';

  /* ---------- calentamiento: un cronómetro a la vez ---------- */
  const wtRef = useRef<number | undefined>(undefined);
  const toggleWarm = (i: number) => {
    window.clearInterval(wtRef.current);
    setWtDone(null);
    if (wt?.i === i) { setWt(null); return; }
    let left = 60;
    setWt({ i, left });
    wtRef.current = window.setInterval(() => {
      left--;
      if (left <= 0) { window.clearInterval(wtRef.current); setWt(null); setWtDone(i); } else setWt({ i, left });
    }, 1000);
  };
  useEffect(() => { if (tab !== 'calentamiento') { window.clearInterval(wtRef.current); setWt(null); } }, [tab]);

  /* ---------- quiz ---------- */
  const q = quiz[qi];
  const qText = (x: Q) => {
    const s = byId(x.sid)!;
    if (x.kind === 'clue') return s.clues[x.ci ?? 0] + t('qsuf');
    if (x.kind === 'move') return t('qmove', { m: mv(x.m ?? '') });
    return t('qpio', { p: s.pioneers });
  };
  const answer = (id: string) => { if (picked || !q) return; setPicked(id); if (id === q.sid) setScore(score + 1); };
  const nextQ = () => { setPicked(null); setQi(qi + 1); };
  const restart = () => { setQuiz(makeQuiz(styles)); setQi(0); setScore(0); setPicked(null); };

  const tabLabel = (id: TabId) => t('tabs')[TABS.indexOf(id)];
  const W: string[][] = t('wu');
  const skillList = styles.filter((s) => s.skills.includes(skill));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1180, marginTop: 34 }} lang={lang}>
      <style>{CSS}</style>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 240, maxWidth: 640 }}>
          <div style={mono}>Laboratorio Freestyle</div>
          <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 32, color: 'var(--ink)', marginTop: 6 }}>{t('ent_h')}</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 6, textWrap: 'pretty' } as CSSProperties}>{t('ent_sub')}</div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, ...mono }}>
          {t('lang')}
          <select id="ent-lang" value={lang} onChange={(e) => setLang(e.target.value as Lang)} style={field}>
            {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </label>
      </div>

      <div role="tablist" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TABS.map((id) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            style={{ ...pill, ...(tab === id ? { background: 'var(--ink)', color: 'var(--ground)', borderColor: 'var(--ink)' } : {}) }}>
            {tabLabel(id)}
          </button>
        ))}
      </div>

      {tab === 'estudio' && (
        <div role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 680 }}>{t('studio_lead')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ ...glass, flex: '0 0 210px', minHeight: 170, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 16 }}>
              <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 92, lineHeight: 1, color: nowC === 4 ? 'var(--blue)' : 'var(--yellow)', fontVariantNumeric: 'tabular-nums' }}>{nowC >= 0 ? nowC + 1 : 1}</div>
              <div style={{ ...mono, letterSpacing: '.1em', textAlign: 'center', minHeight: '2.6em' }}>{playing ? mv(nowMove) : t('ready')}</div>
            </div>
            <div style={{ ...glass, flex: '1 1 380px', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 700, fontSize: 34, minWidth: '3.4ch', fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>{bpm}</span>
                <span style={mono}>BPM</span>
                <input type="range" min={60} max={160} value={bpm} aria-label="BPM" onChange={(e) => setBpm(+e.target.value)} style={{ flex: '1 1 180px', accentColor: 'var(--blue)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button style={{ ...gold, minWidth: 140 }} onClick={() => (playing ? stop() : start())}>{playing ? t('stop') : t('play')}</button>
                <TapTempo label={t('tap')} onBpm={setBpm} pill={pill} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-2)' }}><input type="checkbox" checked={sub} onChange={(e) => setSub(e.target.checked)} /> {t('sub')}</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-2)' }}><input type="checkbox" checked={mute} onChange={(e) => setMute(e.target.checked)} /> {t('mute')}</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <label htmlFor="ent-style" style={mono}>{t('style')}</label>
                <select id="ent-style" value={styleId} onChange={(e) => setStyleId(e.target.value)} style={field}>
                  {styles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <span style={mono}>{t('range', { a: cur.bpm[0], b: cur.bpm[1] })}</span>
              </div>
            </div>
          </div>

          {phrases.map((ph, p) => (
            <div key={p}>
              <div style={{ ...mono, marginBottom: 6 }}>{t('phrase', { n: p + 1 })}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(86px,1fr))', gap: 6 }}>
                {ph.map((m, c) => {
                  const on = nowP === p && nowC === c, isSel = sel[0] === p && sel[1] === c;
                  return (
                    <button key={c} onClick={() => setSel([p, c])} aria-label={`${p + 1}.${c + 1}`}
                      style={{ textAlign: 'left', minHeight: 74, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6, padding: '6px 9px 9px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', overflowWrap: 'anywhere',
                        border: `1px solid ${isSel ? 'var(--ink)' : 'var(--hair)'}`, borderTop: c % 4 === 0 ? '4px solid var(--blue)' : undefined,
                        background: on ? 'var(--yellow)' : isSel ? 'var(--glass-2)' : 'var(--glass)', color: on ? '#1A1400' : 'var(--ink)' }}>
                      <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, fontWeight: 700, opacity: 0.6 }}>{c + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: m ? 700 : 400, lineHeight: 1.15, opacity: m ? 1 : 0.5 }}>{m ? mv(m) : '—'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={pill} onClick={addPhrase}>{t('addp')}</button>
            <button style={pill} onClick={delPhrase}>{t('delp')}</button>
            <button style={pill} onClick={randomize}>{t('rand')}</button>
            <button style={pill} onClick={clearAll}>{t('clr')}</button>
          </div>
          <div style={mono}>{t('bank', { name: cur.name })}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {cur.moves.map((m) => <button key={m} style={pill} onClick={() => assign(m)}>{mv(m)}</button>)}
            <button style={{ ...pill, borderStyle: 'dashed' }} onClick={() => assign('')}>{t('hold')}</button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{t('note')}</div>
        </div>
      )}

      {tab === 'estilos' && (
        <div role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 680 }}>{t('estilos_lead')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 16 }}>
            {styles.map((s) => (
              <article key={s.id} style={{ ...glass, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, borderTop: `6px solid ${s.c}` }}>
                <h3 style={{ margin: 0, fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 24, fontWeight: 400, color: 'var(--ink)' }}>{s.name}</h3>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 13, color: 'var(--ink-2)' }}>
                  <dt style={mono}>{t('origin')}</dt><dd style={{ margin: 0 }}>{s.origin}</dd>
                  <dt style={mono}>{t('tempo')}</dt><dd style={{ margin: 0 }}>{s.bpm[0]}–{s.bpm[1]} BPM</dd>
                  <dt style={mono}>{t('sound')}</dt><dd style={{ margin: 0 }}>{s.feel}</dd>
                  <dt style={mono}>{t('pioneers')}</dt><dd style={{ margin: 0 }}>{s.pioneers}</dd>
                </dl>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {s.moves.map((m) => <span key={m} style={{ fontSize: 11.5, padding: '2px 9px', borderRadius: 999, border: '1px solid var(--hair)', color: 'var(--ink-2)' }}>{mv(m)}</span>)}
                </div>
                <div style={{ background: 'var(--glass-2)', borderRadius: 14, padding: '10px 12px', fontSize: 13, color: 'var(--ink-2)' }}><div style={mono}>{t('gives_h')}</div>{s.gives}</div>
                <div style={{ background: 'var(--glass-2)', borderRadius: 14, padding: '10px 12px', fontSize: 13, color: 'var(--ink-2)' }}><div style={mono}>{t('drill_h')}</div>{s.drill}</div>
                <button style={{ ...pill, alignSelf: 'flex-start', marginTop: 'auto' }} onClick={() => useStyle(s)}>{t('use')}</button>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'ruta' && (
        <div role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 680 }}>{t('ruta_lead')}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group">
            {SKILL_KEYS.map((k) => (
              <button key={k} aria-pressed={skill === k} onClick={() => setSkill(k)} style={skill === k ? { ...gold, padding: '8px 14px' } : { ...pill, padding: '8px 14px' }}>{t('skills')[k]}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 16 }}>
            {skillList.map((s) => (
              <article key={s.id} style={{ ...glass, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, borderTop: `6px solid ${s.c}` }}>
                <h3 style={{ margin: 0, fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 24, fontWeight: 400, color: 'var(--ink)' }}>{s.name}</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-2)' }}>{s.gives}</p>
                <div style={{ background: 'var(--glass-2)', borderRadius: 14, padding: '10px 12px', fontSize: 13, color: 'var(--ink-2)' }}><div style={mono}>{t('wdrill_h')}</div>{s.wdrill}</div>
              </article>
            ))}
          </div>
          <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 26, color: 'var(--ink)', marginTop: 10 }}>{t('week_h')}</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: -8 }}>{t('week_lead')}</div>
          <div style={{ ...glass, padding: '4px 18px' }}>
            {(t('days') as string[]).map((d, i) => {
              const s = byId(week[i]);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '10px minmax(0,1fr) auto', gap: 14, alignItems: 'start', padding: '14px 0', borderTop: i ? '1px solid var(--hair-soft)' : undefined }}>
                  <span style={{ alignSelf: 'stretch', minHeight: 40, borderRadius: 3, background: s ? s.c : 'var(--hair)' }} />
                  <div><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{d}</div><div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>{s ? s.wdrill : t('rest_note')}</div></div>
                  <select value={week[i]} aria-label={d} onChange={(e) => setWeek(week.map((w, j) => (j === i ? e.target.value : w)))} style={field}>
                    <option value="">{t('rest')}</option>
                    {styles.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'calentamiento' && (
        <div role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 26, color: 'var(--ink)' }}>{t('wu_h')}</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 680, marginTop: -8 }}>{t('wu_lead')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            {W.map((x, i) => {
              const running = wt?.i === i;
              const left = running ? wt!.left : 60;
              return (
                <article key={i} style={{ ...glass, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 15, color: 'var(--ink)', display: 'flex', gap: 10, alignItems: 'baseline' }}><span style={mono}>{i + 1}/{W.length}</span>{x[0]}</h3>
                  <div style={{ position: 'relative', aspectRatio: '16/9', background: '#121017', borderRadius: 14, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Fig i={i} label={x[0]} />
                    <span style={{ position: 'absolute', left: 8, bottom: 6, fontFamily: "'Geist Mono',monospace", fontSize: 9.5, letterSpacing: '.08em', color: '#EFEAE0', opacity: 0.7 }}>{t('wu_ref')}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)' }}>{x[1]}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <output style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 700, fontSize: 20, minWidth: '3.6ch', fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>
                      {wtDone === i ? t('wu_done') : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}
                    </output>
                    <button style={running ? pill : gold} onClick={() => toggleWarm(i)}>{running ? t('wu_stop') : t('wu_start')}</button>
                    <a href={`https://www.youtube.com/results?hl=${lang}&search_query=${encodeURIComponent(YTQ[i])}`} target="_blank" rel="noopener noreferrer" style={{ ...pill, textDecoration: 'none' }}>{t('wu_yt')} ↗</a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'autoevaluacion' && <EntrenarCamara t={t} styles={styles} styleId={styleId} bpm={bpm} />}

      {tab === 'clase' && <EntrenarPlan t={t} />}

      {tab === 'quiz' && (
        <div role="tabpanel" style={{ ...glass, padding: 22, maxWidth: 680 }}>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 14 }}>{t('quiz_lead')}</div>
          {q ? (
            <>
              <div style={mono}>{t('qof', { i: qi + 1, n: quiz.length, s: score })}</div>
              <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 24, lineHeight: 1.25, color: 'var(--ink)', margin: '10px 0 16px' }}>{qText(q)}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 10 }}>
                {q.opts.map((id) => {
                  const st = byId(id)!;
                  const bg = picked ? (id === q.sid ? 'var(--yellow)' : id === picked ? 'var(--pink)' : 'var(--glass-2)') : 'var(--glass-2)';
                  return <button key={id} disabled={!!picked} onClick={() => answer(id)} style={{ ...pill, justifyContent: 'flex-start', background: bg, color: picked && (id === q.sid || id === picked) ? '#1A1400' : 'var(--ink)', fontWeight: 700, padding: '12px 14px' }}>{st.name}</button>;
                })}
              </div>
              <div style={{ minHeight: '3em', margin: '14px 0 10px', fontSize: 14, color: 'var(--ink-2)' }} role="status">
                {picked && (picked === q.sid ? <b>{t('ok')}</b> : t('no', { name: byId(q.sid)!.name, origin: byId(q.sid)!.origin }))}
              </div>
              {picked && <button style={gold} onClick={nextQ}>{qi + 1 < quiz.length ? t('next') : t('see')}</button>}
            </>
          ) : (
            <>
              <div style={mono}>{t('result')}</div>
              <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 64, color: 'var(--yellow)', lineHeight: 1 }}>{score}/{quiz.length}</div>
              <p style={{ color: 'var(--ink-2)' }}>{score === quiz.length ? t('r3') : score >= 3 ? t('r2') : t('r1')}</p>
              <button style={gold} onClick={restart}>{t('again')}</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Promedia los últimos toques (máx. 5) y devuelve el BPM; se reinicia si pasan más de 2 s entre toques.
function TapTempo({ label, onBpm, pill: style }: { label: string; onBpm: (b: number) => void; pill: CSSProperties }) {
  const taps = useRef<number[]>([]);
  return (
    <button style={style} onClick={() => {
      const n = performance.now(), a = taps.current;
      if (a.length && n - a[a.length - 1] > 2000) taps.current = [];
      taps.current = [...taps.current, n].slice(-5);
      if (taps.current.length > 1) {
        const d = (taps.current[taps.current.length - 1] - taps.current[0]) / (taps.current.length - 1);
        onBpm(Math.max(60, Math.min(160, Math.round(60000 / d))));
      }
    }}>{label}</button>
  );
}
