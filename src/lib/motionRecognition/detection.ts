import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import type { EffectPlugin, FigureEvent, Pose, PoseFrame } from '../../types/motionRecognition';
import { buildEvents } from './engine';
import { safeVideoUrl } from '../safeVideoUrl';

// Misma versión que package.json: el WASM debe coincidir con el paquete JS.
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const STEP_MS = 100;
const IO_TIMEOUT_MS = 15000;

// Índices de MediaPipe Pose (33 puntos).
const IDX = { nose: 0, lsh: 11, rsh: 12, lel: 13, rel: 14, lwr: 15, rwr: 16, lhip: 23, rhip: 24 } as const;

export interface DetectionResult {
  events: FigureEvent[];
  durationMs: number;
  framesWithBody: number;
  framesTotal: number;
}

export interface DetectionOptions {
  plugins: EffectPlugin[];
  signal?: AbortSignal;
  onProgress?: (fraction: number) => void;
}

function waitFor(el: HTMLVideoElement, event: 'loadeddata' | 'seeked', signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => done(new Error('El video tardó demasiado en responder.')), IO_TIMEOUT_MS);
    const onOk = () => done();
    const onErr = () => done(new Error('No se pudo leer el video. Si está en Firebase Storage, revisa la configuración CORS del bucket.'));
    const onAbort = () => done(new DOMException('Detección cancelada', 'AbortError'));
    function done(err?: Error) {
      clearTimeout(timer);
      el.removeEventListener(event, onOk);
      el.removeEventListener('error', onErr);
      signal?.removeEventListener('abort', onAbort);
      if (err) reject(err);
      else resolve();
    }
    el.addEventListener(event, onOk, { once: true });
    el.addEventListener('error', onErr, { once: true });
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function createLandmarker(): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  const make = (delegate: 'GPU' | 'CPU') =>
    PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODEL_URL, delegate }, runningMode: 'VIDEO', numPoses: 1 });
  try {
    return await make('GPU');
  } catch {
    return await make('CPU');
  }
}

// Cancela la espera de una promesa sin poder interrumpirla; si llega tarde, `onLate` libera lo que creó.
function abortable<T>(p: Promise<T>, signal: AbortSignal | undefined, onLate: (v: T) => void): Promise<T> {
  if (!signal) return p;
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      reject(new DOMException('Detección cancelada', 'AbortError'));
      p.then(onLate, () => {});
    };
    if (signal.aborted) return onAbort();
    signal.addEventListener('abort', onAbort, { once: true });
    p.then(
      (v) => { signal.removeEventListener('abort', onAbort); if (!signal.aborted) resolve(v); },
      (e) => { signal.removeEventListener('abort', onAbort); reject(e); },
    );
  });
}

function toPose(lm: { x: number; y: number }[] | undefined): Pose | null {
  if (!lm || lm.length < 25) return null;
  const pick = (i: number) => ({ x: lm[i].x, y: lm[i].y });
  return {
    nose: pick(IDX.nose), lsh: pick(IDX.lsh), rsh: pick(IDX.rsh), lel: pick(IDX.lel), rel: pick(IDX.rel),
    lwr: pick(IDX.lwr), rwr: pick(IDX.rwr), lhip: pick(IDX.lhip), rhip: pick(IDX.rhip),
  };
}

// Corre la estimación de pose UNA vez sobre todo el video y devuelve los eventos de figura propuestos.
export async function detectFigureEvents(source: string, opts: DetectionOptions): Promise<DetectionResult> {
  const { signal, onProgress, plugins } = opts;
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  let landmarker: PoseLandmarker | null = null;

  try {
    const src = safeVideoUrl(source);
    if (!src) throw new Error('La dirección del video no es válida.');
    const loaded = waitFor(video, 'loadeddata', signal);
    video.src = src;
    await loaded;
    const durationMs = Math.floor(video.duration * 1000);
    if (!Number.isFinite(durationMs) || durationMs <= 0) throw new Error('No se pudo leer la duración del video.');
    const aspect = video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 9 / 16;

    landmarker = await abortable(createLandmarker(), signal, (l) => l.close());
    const frames: PoseFrame[] = [];
    for (let t = 0; t < durationMs; t += STEP_MS) {
      if (signal?.aborted) throw new DOMException('Detección cancelada', 'AbortError');
      const seeked = waitFor(video, 'seeked', signal);
      video.currentTime = t / 1000;
      await seeked;
      // detectForVideo exige marcas de tiempo estrictamente crecientes.
      const result = landmarker.detectForVideo(video, t + 1);
      frames.push({ tMs: t, pose: toPose(result.landmarks?.[0]) });
      onProgress?.(Math.min(1, (t + STEP_MS) / durationMs));
    }

    const events = buildEvents(frames, { plugins, aspect, stepMs: STEP_MS });
    return { events, durationMs, framesWithBody: frames.filter((f) => f.pose).length, framesTotal: frames.length };
  } finally {
    landmarker?.close();
    video.removeAttribute('src');
    video.load();
  }
}
