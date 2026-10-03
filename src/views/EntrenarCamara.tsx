// Autoevaluación con cámara — pestaña de "Entrenar con otros estilos".
// La cámara solo se muestra en la pantalla de quien la enciende: el video no se guarda ni se envía.
// Incluye espejo, cuadrícula, congelar cuadro, espejo con retraso, análisis de movimiento aproximado
// (src/lib/entrenar/motion.ts) y una rúbrica de 5 criterios con historial local.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { StyleDef } from '../lib/entrenar/data';
import { analyzeMotion, PROFILE_STYLES } from '../lib/entrenar/motion';
import type { MotionResult, MotionSample } from '../lib/entrenar/motion';
import { glass, mono, pill, gold, field, inner, serif, readJson, writeJson } from '../lib/entrenar/ui';
import type { T } from '../lib/entrenar/ui';
import { usePoseTracker, type NormalizedPoint } from '../lib/entrenar/poseTracker';
import {
  analyzePosture,
  emptyFocusEnergy,
  frameFocusEnergy,
  isPersonDetected,
  pickCreativeIdea,
  totalEnergy,
  type CreativeIdea,
  type PostureTipKey
} from '../lib/entrenar/freestyleCoach';
import { PoseOneEuroFilter, BoneLengthGuard } from '../lib/entrenar/poseSmoothing';
import { computeJointAngles, BONE_PAIRS, type JointAngles } from '../lib/entrenar/jointAngles';

const TIP_COOLDOWN_MS = 5000;
const LOW_ENERGY_STREAK_MS = 6000;
interface LiveTip { id: string; key: PostureTipKey; text: string }

const KEY = 'waack-entrenar-evals';
const AW = 64, AH = 48, ANALYSIS_SECS = 30;
interface Ev { d: string; s: string; sc: number[] }

const line = (dir: string, pos: number, a: number) => `linear-gradient(${dir},transparent calc(${pos}% - .5px),rgba(255,255,255,${a}) calc(${pos}% - .5px),rgba(255,255,255,${a}) calc(${pos}% + .5px),transparent calc(${pos}% + .5px))`;
const GRID_BG = [line('to right', 50, 0.55), line('to right', 33.33, 0.28), line('to right', 66.66, 0.28), line('to bottom', 33.33, 0.28), line('to bottom', 66.66, 0.28)].join(',');

export default function EntrenarCamara({ t, styles, styleId, bpm }: { t: T; styles: StyleDef[]; styleId: string; bpm: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const anRafRef = useRef(0);
  const ringRef = useRef<{ t: number; b: ImageBitmap }[]>([]);
  const lastRef = useRef(0);
  const frozenRef = useRef(false);
  const delayRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const metroRef = useRef(true);
  const anRef = useRef<{ samples: MotionSample[]; prev: Uint8Array | null; t0: number; nextBeat: number; beatN: number; off: HTMLCanvasElement; left: number } | null>(null);
  const prevPoseLandmarksRef = useRef<NormalizedPoint[] | null>(null);
  const focusEnergyRef = useRef(emptyFocusEnergy());
  const lowEnergySinceRef = useRef<number | null>(null);
  const lastTipAtRef = useRef<Record<string, number>>({});
  const boneGuardRef = useRef(new BoneLengthGuard(BONE_PAIRS));
  const oneEuroRef = useRef(new PoseOneEuroFilter());
  const smoothedLandmarksRef = useRef<NormalizedPoint[] | null>(null);

  const [on, setOn] = useState(false);
  const [err, setErr] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [mirror, setMirror] = useState(true);
  const [grid, setGrid] = useState(false);
  const [delay, setDelay] = useState(0);
  const [evStyle, setEvStyle] = useState(styleId);
  const [scores, setScores] = useState([3, 3, 3, 3, 3]);
  const [evals, setEvals] = useState<Ev[]>(() => readJson<Ev[]>(KEY, []));
  const [saved, setSaved] = useState(false);
  const [metro, setMetro] = useState(true);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(ANALYSIS_SECS);
  const [beat, setBeat] = useState(false);
  const [result, setResult] = useState<MotionResult | null>(null);
  const [noData, setNoData] = useState(false);
  const [needCam, setNeedCam] = useState(false);
  const [aiTips, setAiTips] = useState<LiveTip[]>([]);
  const [aiIdea, setAiIdea] = useState<CreativeIdea>(() => pickCreativeIdea(emptyFocusEnergy()));
  const [personDetected, setPersonDetected] = useState(false);
  const [jointAngles, setJointAngles] = useState<JointAngles | null>(null);
  const [showAngles, setShowAngles] = useState(true);

  metroRef.current = metro;
  const cur = styles.find((s) => s.id === evStyle) ?? styles[0];

  const rollNewIdea = useCallback(() => {
    setAiIdea(pickCreativeIdea(focusEnergyRef.current));
    focusEnergyRef.current = emptyFocusEnergy();
    lowEnergySinceRef.current = null;
  }, []);

  const pushAiTip = useCallback((key: PostureTipKey, text: string) => {
    const now = Date.now();
    if (now - (lastTipAtRef.current[key] || 0) < TIP_COOLDOWN_MS) return;
    lastTipAtRef.current[key] = now;
    setAiTips((prev) => [{ id: `${key}-${now}`, key, text }, ...prev].slice(0, 4));
  }, []);

  const handlePoseFrame = useCallback((landmarks: NormalizedPoint[] | null) => {
    const detected = isPersonDetected(landmarks);
    const wasDetected = personDetected;
    setPersonDetected(detected);
    if (!detected || !landmarks) {
      prevPoseLandmarksRef.current = null;
      smoothedLandmarksRef.current = null;
      oneEuroRef.current = new PoseOneEuroFilter();
      boneGuardRef.current = new BoneLengthGuard(BONE_PAIRS);
      setJointAngles(null);
      return;
    }
    // Si la persona recién reingresa al cuadro, arrancar con estado de filtro limpio
    // en vez de arrastrar velocidad/referencias de antes de haber salido del cuadro.
    if (!wasDetected) {
      smoothedLandmarksRef.current = null;
      oneEuroRef.current = new PoseOneEuroFilter();
      boneGuardRef.current = new BoneLengthGuard(BONE_PAIRS);
    }

    const guarded = boneGuardRef.current.apply(landmarks, smoothedLandmarksRef.current);
    const t = videoRef.current?.currentTime ?? performance.now() / 1000;
    const smoothed = oneEuroRef.current.filter(guarded, t);
    smoothedLandmarksRef.current = smoothed;
    setJointAngles(computeJointAngles(smoothed));

    for (const tip of analyzePosture(landmarks)) pushAiTip(tip.key, tip.text);

    const prev = prevPoseLandmarksRef.current;
    if (prev) {
      const frameEnergy = frameFocusEnergy(landmarks, prev);
      (Object.keys(frameEnergy) as (keyof typeof frameEnergy)[]).forEach((k) => {
        focusEnergyRef.current[k] += frameEnergy[k];
      });

      const energy = totalEnergy(landmarks, prev);
      if (energy * 800 <= 12) {
        if (!lowEnergySinceRef.current) lowEnergySinceRef.current = Date.now();
        else if (Date.now() - lowEnergySinceRef.current > LOW_ENERGY_STREAK_MS) rollNewIdea();
      } else {
        lowEnergySinceRef.current = null;
      }
    }
    prevPoseLandmarksRef.current = landmarks;
  }, [pushAiTip, rollNewIdea, personDetected]);

  const { status: poseStatus, error: poseError } = usePoseTracker(videoRef, on, handlePoseFrame);

  /* ---------- cámara ---------- */
  const draw = () => {
    rafRef.current = requestAnimationFrame(draw);
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c || !streamRef.current || frozenRef.current || v.readyState < 2) return;
    const cx = c.getContext('2d');
    if (!cx) return;
    if (v.videoWidth && c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
    const d = delayRef.current, now = performance.now();
    if (d === 0) { cx.drawImage(v, 0, 0, c.width, c.height); drawSkeleton(cx, c.width, c.height); return; }
    if (now - lastRef.current > 66 && typeof createImageBitmap === 'function') {
      lastRef.current = now;
      createImageBitmap(v, { resizeWidth: 320 }).then((b) => ringRef.current.push({ t: now, b })).catch(() => {});
    }
    const target = now - d * 1000, ring = ringRef.current;
    while (ring.length > 1 && ring[1].t <= target) ring.shift()!.b.close();
    const f = ring[0];
    if (f && f.t <= target + 100) cx.drawImage(f.b, 0, 0, c.width, c.height);
    drawSkeleton(cx, c.width, c.height);
  };
  const drawSkeleton = (cx: CanvasRenderingContext2D, w: number, h: number) => {
    const lm = smoothedLandmarksRef.current;
    if (!lm) return;
    cx.save();
    cx.strokeStyle = 'rgba(255,214,0,0.85)';
    cx.lineWidth = 2;
    for (const [a, b] of BONE_PAIRS) {
      const pa = lm[a], pb = lm[b];
      if (!pa || !pb) continue;
      cx.beginPath();
      cx.moveTo(pa.x * w, pa.y * h);
      cx.lineTo(pb.x * w, pb.y * h);
      cx.stroke();
    }
    cx.restore();
  };
  const clearRing = () => { ringRef.current.forEach((f) => { try { f.b.close(); } catch { /* ya cerrado */ } }); ringRef.current = []; };

  const startCam = async () => {
    setErr(false);
    if (!navigator.mediaDevices?.getUserMedia) { setErr(true); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } }, audio: false });
      streamRef.current = s;
      const v = videoRef.current!;
      v.srcObject = s;
      await v.play();
      clearRing(); frozenRef.current = false; setFrozen(false); setNeedCam(false); setOn(true);
      cancelAnimationFrame(rafRef.current);
      draw();
    } catch {
      streamRef.current?.getTracks().forEach((x) => x.stop());
      streamRef.current = null; setOn(false); setErr(true);
    }
  };
  const stopCam = () => {
    cancelAnalysis();
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((x) => x.stop());
    streamRef.current = null;
    clearRing(); frozenRef.current = false; setFrozen(false); setOn(false);
    const c = canvasRef.current;
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    prevPoseLandmarksRef.current = null;
    smoothedLandmarksRef.current = null;
    oneEuroRef.current = new PoseOneEuroFilter();
    boneGuardRef.current = new BoneLengthGuard(BONE_PAIRS);
    focusEnergyRef.current = emptyFocusEnergy();
    lowEnergySinceRef.current = null;
    setAiTips([]);
    setPersonDetected(false);
    setJointAngles(null);
  };
  const toggleFreeze = () => { if (!on) return; frozenRef.current = !frozenRef.current; setFrozen(frozenRef.current); };
  const changeDelay = (n: number) => { delayRef.current = n; setDelay(n); clearRing(); };

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    cancelAnimationFrame(anRafRef.current);
    streamRef.current?.getTracks().forEach((x) => x.stop());
    ringRef.current.forEach((f) => { try { f.b.close(); } catch { /* ya cerrado */ } });
    void ctxRef.current?.close();
  }, []);

  /* ---------- análisis de movimiento ---------- */
  const click = (accent: boolean) => {
    const ctx = ctxRef.current;
    if (!ctx || !metroRef.current) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), tm = ctx.currentTime + 0.001;
    o.type = 'square';
    o.frequency.value = accent ? 1500 : 820;
    g.gain.setValueAtTime(accent ? 0.18 : 0.11, tm);
    g.gain.exponentialRampToValueAtTime(0.0008, tm + 0.06);
    o.connect(g).connect(ctx.destination);
    o.start(tm);
    o.stop(tm + 0.07);
  };
  const cancelAnalysis = () => { cancelAnimationFrame(anRafRef.current); anRef.current = null; setRunning(false); setBeat(false); };
  const finishAnalysis = () => {
    const st = anRef.current;
    cancelAnalysis();
    if (!st) return;
    const r = analyzeMotion(st.samples, bpm);
    setResult(r);
    setNoData(!r);
  };
  const startAnalysis = () => {
    const v = videoRef.current;
    if (!on || !streamRef.current || !v || v.readyState < 2) { setNeedCam(true); return; }
    setNeedCam(false); setNoData(false); setResult(null);
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    ctxRef.current = ctxRef.current || new AC();
    void ctxRef.current!.resume();
    const off = document.createElement('canvas');
    off.width = AW; off.height = AH;
    const cx = off.getContext('2d', { willReadFrequently: true })!;
    const t0 = performance.now();
    anRef.current = { samples: [], prev: null, t0, nextBeat: t0, beatN: 0, off, left: ANALYSIS_SECS };
    setRunning(true); setLeft(ANALYSIS_SECS);
    const tick = () => {
      const st = anRef.current;
      if (!st) return;
      anRafRef.current = requestAnimationFrame(tick);
      const now = performance.now(), el = (now - st.t0) / 1000;
      if (now >= st.nextBeat) {
        setBeat(true); window.setTimeout(() => setBeat(false), 90);
        click(st.beatN % 4 === 0);
        st.beatN++; st.nextBeat += 60000 / bpm;
      }
      const l = Math.max(0, Math.ceil(ANALYSIS_SECS - el));
      if (l !== st.left) { st.left = l; setLeft(l); }
      if (el >= ANALYSIS_SECS) { finishAnalysis(); return; }
      cx.drawImage(v, 0, 0, AW, AH);
      const d = cx.getImageData(0, 0, AW, AH).data, g = new Uint8Array(AW * AH);
      for (let i = 0; i < g.length; i++) g[i] = (d[i * 4] * 3 + d[i * 4 + 1] * 4 + d[i * 4 + 2]) >> 3;
      if (st.prev) {
        let n = 0, up = 0, lo = 0, x0 = AW, x1 = 0, y0 = AH, y1 = 0;
        for (let y = 0; y < AH; y++) for (let x = 0; x < AW; x++) {
          const i = y * AW + x;
          if (Math.abs(g[i] - st.prev[i]) > 22) {
            n++;
            if (y < AH / 2) up++; else lo++;
            if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
          }
        }
        const box = n > 8 ? ((x1 - x0 + 1) * (y1 - y0 + 1)) / (AW * AH) : 0;
        st.samples.push({ t: now - st.t0, e: n / (AW * AH), up, lo, box });
      }
      st.prev = g;
    };
    tick();
  };
  const applySuggestion = () => {
    if (!result) return;
    setScores(scores.map((v, i) => (i === 0 ? result.suggest[0] : i === 1 ? result.suggest[1] : i === 4 ? result.suggest[4] : v)));
  };

  /* ---------- rúbrica e historial ---------- */
  const saveEval = () => {
    const next = [{ d: new Date().toISOString().slice(0, 10), s: evStyle, sc: scores.slice() }, ...evals].slice(0, 30);
    setEvals(next); writeJson(KEY, next);
    setSaved(true); window.setTimeout(() => setSaved(false), 2500);
  };

  const crit: string[] = t('ev_crit');
  const meter = (v: number, k: string) => (
    <div style={{ ...inner, padding: '8px 10px' }}>
      <b style={{ display: 'block', fontFamily: "'Geist Mono',monospace", fontSize: 20, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(v * 100)}%</b>
      <span style={{ fontSize: 11.5 }}>{t(k)}</span>
      <div style={{ height: 5, background: 'var(--hair)', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}><div style={{ width: `${v * 100}%`, height: '100%', background: 'var(--yellow)' }} /></div>
    </div>
  );
  const stageMsg = err ? t('cam_err') : !on ? t('cam_hint') : '';

  return (
    <div role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 26, color: 'var(--ink)' }}>{t('cam_h')}</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 680, marginTop: -8 }}>{t('cam_lead')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 18, alignItems: 'start' }}>
        <div style={{ ...glass, padding: 16 }}>
          <div style={{ position: 'relative', aspectRatio: '4/3', maxWidth: '100%', background: '#121017', borderRadius: 16, overflow: 'hidden' }}>
            <video ref={videoRef} muted playsInline style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
            <canvas ref={canvasRef} width={640} height={480} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', transform: mirror ? 'scaleX(-1)' : undefined }} />
            {grid && <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: GRID_BG }} />}
            {stageMsg && <div role="status" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20, color: '#EFEAE0', fontSize: 14 }}>{stageMsg}</div>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <button style={gold} onClick={() => (on ? stopCam() : void startCam())}>{on ? t('cam_stop') : t('cam_start')}</button>
            <button style={{ ...pill, opacity: on ? 1 : 0.5 }} disabled={!on} onClick={toggleFreeze}>{frozen ? t('cam_unfreeze') : t('cam_freeze')}</button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-2)' }}><input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} /> {t('cam_mirror')}</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-2)' }}><input type="checkbox" checked={grid} onChange={(e) => setGrid(e.target.checked)} /> {t('cam_grid')}</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-2)' }}><input type="checkbox" checked={showAngles} onChange={(e) => setShowAngles(e.target.checked)} /> Ángulos</label>
          </div>
          {on && showAngles && personDetected && jointAngles && (
            <div style={{ ...inner, background: 'var(--glass-2)', marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: '4px 12px', fontFamily: "'Geist Mono',monospace", fontSize: 12.5 }}>
              <span>Codo Izq {Math.round(jointAngles.leftElbow)}°</span>
              <span>Codo Der {Math.round(jointAngles.rightElbow)}°</span>
              <span>Hombro Izq {Math.round(jointAngles.leftShoulder)}°</span>
              <span>Hombro Der {Math.round(jointAngles.rightShoulder)}°</span>
              <span>Cadera Izq {Math.round(jointAngles.leftHip)}°</span>
              <span>Cadera Der {Math.round(jointAngles.rightHip)}°</span>
              <span>Rodilla Izq {Math.round(jointAngles.leftKnee)}°</span>
              <span>Rodilla Der {Math.round(jointAngles.rightKnee)}°</span>
              <span>Columna {Math.round(jointAngles.spineTilt)}°</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
            <label htmlFor="ent-delay" style={mono}>{t('cam_delay')}</label>
            <input id="ent-delay" type="range" min={0} max={6} step={1} value={delay} onChange={(e) => changeDelay(+e.target.value)} style={{ maxWidth: 220, accentColor: 'var(--blue)' }} />
            <output style={mono}>{t('cam_sec', { n: delay })}</output>
          </div>

          <div style={{ borderTop: '1px solid var(--hair-soft)', marginTop: 16, paddingTop: 14 }}>
            <div style={{ ...serif, fontSize: 19 }}>{t('an_h')}</div>
            <p style={{ margin: '4px 0 10px', fontSize: 12.5, color: 'var(--ink-3)' }}>{t('an_lead')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <button style={running ? pill : gold} onClick={() => (running ? finishAnalysis() : startAnalysis())}>{running ? t('an_stop') : t('an_start')}</button>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-2)' }}><input type="checkbox" checked={metro} onChange={(e) => setMetro(e.target.checked)} /> {t('an_metro')}</label>
              <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: '50%', background: beat ? 'var(--yellow)' : 'var(--hair)' }} />
              <span role="status" style={mono}>{running ? t('an_run', { s: left }) : needCam ? t('an_need') : ''}</span>
            </div>
            {noData && <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('an_few')}</p>}
            {result && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10 }}>
                  {meter(result.sync, 'an_sync')}{meter(result.sharp, 'an_sharp')}{meter(result.pause, 'an_pause')}{meter(result.space, 'an_space')}
                </div>
                <div style={{ ...inner, background: 'var(--glass-2)', border: '1px solid var(--hair)' }}>
                  {t('an_prof')}: <b style={{ color: 'var(--ink)' }}>{t('an_profiles')[result.profile]}</b>
                  <br />
                  {PROFILE_STYLES[result.profile].includes(evStyle) ? t('an_match', { name: cur.name }) : t('an_nomatch', { name: cur.name })}
                </div>
                <div><button style={pill} onClick={applySuggestion}>{t('an_apply')}</button></div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--hair-soft)', marginTop: 16, paddingTop: 14 }}>
            <div style={{ ...serif, fontSize: 19 }}>{t('ai_h')}</div>
            <p style={{ margin: '4px 0 10px', fontSize: 12.5, color: 'var(--ink-3)' }}>{t('ai_lead')}</p>

            {!on && <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('an_need')}</p>}

            {on && poseStatus === 'loading-models' && (
              <p role="status" style={mono}>{t('ai_loading')}</p>
            )}
            {on && poseStatus === 'error' && (
              <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>{poseError || t('ai_error')}</p>
            )}
            {on && poseStatus === 'ready' && !personDetected && (
              <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('ai_no_person')}</p>
            )}

            {on && poseStatus === 'ready' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 8 }}>
                <div>
                  <div style={mono}>{t('ai_tips_h')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, minHeight: 40 }}>
                    {aiTips.length === 0 && <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-3)' }}>{t('ai_tips_empty')}</p>}
                    {aiTips.map((tip) => (
                      <div key={tip.id} style={{ ...inner, background: 'var(--glass-2)' }}>{tip.text}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={mono}>{t('ai_idea_h')}</div>
                    <button style={pill} onClick={rollNewIdea}>{t('ai_idea_new')}</button>
                  </div>
                  <div style={{ ...inner, background: 'var(--glass-2)', marginTop: 6 }}>{aiIdea.text}</div>
                  <p style={{ margin: '6px 0 0', fontSize: 11.5, color: 'var(--ink-3)' }}>{t('ai_idea_hint')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ ...glass, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...serif, fontSize: 19 }}>{t('ev_method')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label htmlFor="ent-evstyle" style={mono}>{t('ev_style')}</label>
            <select id="ent-evstyle" value={evStyle} onChange={(e) => setEvStyle(e.target.value)} style={field}>
              {styles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={inner}><div style={mono}>{t('ev_drill')}</div>{cur.drill}</div>
          <div style={inner}><div style={mono}>{t('ev_wdrill')}</div>{cur.wdrill}</div>
          <div style={{ ...serif, fontSize: 19, marginTop: 6 }}>{t('ev_crit_h')}</div>
          {crit.map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '2px 12px', alignItems: 'center' }}>
              <label htmlFor={`ent-cr${i}`} style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{c}</label>
              <output style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 700, color: 'var(--ink)' }}>{scores[i]}</output>
              <input id={`ent-cr${i}`} type="range" min={1} max={5} step={1} value={scores[i]} onChange={(e) => setScores(scores.map((v, j) => (j === i ? +e.target.value : v)))} style={{ gridColumn: '1 / -1', width: '100%', accentColor: 'var(--blue)' }} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button style={gold} onClick={saveEval}>{t('ev_save')}</button>
            <span role="status" style={mono}>{saved ? t('ev_saved') : ''}</span>
          </div>
          <div style={{ ...serif, fontSize: 19, marginTop: 6 }}>{t('ev_log')}</div>
          {evals.length === 0 && <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-3)' }}>{t('ev_empty')}</p>}
          {evals.slice(0, 6).map((x, i) => {
            const a = x.sc.reduce((p, q) => p + q, 0) / x.sc.length;
            const bar: CSSProperties = { gridColumn: '1 / -1', height: 6, background: 'var(--hair)', borderRadius: 3, overflow: 'hidden' };
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '4px 12px', padding: '8px 0', borderTop: '1px solid var(--hair-soft)', fontSize: 13, color: 'var(--ink-2)' }}>
                <span>{x.d} · {styles.find((s) => s.id === x.s)?.name ?? x.s}</span>
                <b style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: 'var(--ink)' }}>{t('ev_avg', { n: a.toFixed(1) })}</b>
                <div style={bar}><div style={{ width: `${(a / 5) * 100}%`, height: '100%', background: 'var(--yellow)' }} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
