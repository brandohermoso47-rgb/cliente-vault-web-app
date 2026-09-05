import type { MovementPoint } from './types';
import type { HandPoseFrame } from './useHandPoseTracker';

const HAND_INDEX_TIP = 8;
const POSE_LEFT_WRIST = 15;
const POSE_RIGHT_WRIST = 16;
/** hombros, codos, muñecas, caderas — subconjunto legible para el trazo corporal secundario */
const BODY_TRAIL_INDICES = [11, 12, 13, 14, 15, 16, 23, 24];

/** Punto "pluma" principal: índice de la mano derecha, si no la izquierda, si no la muñeca del cuerpo. */
export function pickPenPoint(frame: HandPoseFrame, tRelativeMs: number): MovementPoint | null {
  const hand = frame.hands.find((h) => h.handedness === 'Right') ?? frame.hands.find((h) => h.handedness === 'Left');
  const tip = hand?.landmarks[HAND_INDEX_TIP];
  if (tip) return { x: tip.x, y: tip.y, t: tRelativeMs, source: 'hand' };

  const wrist = frame.pose?.[POSE_RIGHT_WRIST] ?? frame.pose?.[POSE_LEFT_WRIST];
  if (wrist) return { x: wrist.x, y: wrist.y, t: tRelativeMs, source: 'pose' };

  return null;
}

/** Capa secundaria más tenue: puntos clave del cuerpo, para representar el movimiento de pose completa. */
export function pickBodyPoints(frame: HandPoseFrame, tRelativeMs: number): MovementPoint[] {
  if (!frame.pose) return [];
  const out: MovementPoint[] = [];
  for (const i of BODY_TRAIL_INDICES) {
    const p = frame.pose[i];
    if (p) out.push({ x: p.x, y: p.y, t: tRelativeMs, source: 'pose' });
  }
  return out;
}

export function pruneOldPoints(points: MovementPoint[], nowT: number, maxAgeMs: number): MovementPoint[] {
  if (points.length === 0) return points;
  const cutoff = nowT - maxAgeMs;
  const firstKeptIndex = points.findIndex((p) => p.t >= cutoff);
  if (firstKeptIndex <= 0) return points;
  return points.slice(firstKeptIndex);
}

/** Reduce el número de puntos por decimación uniforme, conservando siempre el último. */
export function simplifyPoints(points: MovementPoint[], maxPoints: number): MovementPoint[] {
  if (points.length <= maxPoints || maxPoints < 2) return points;
  const step = points.length / maxPoints;
  const result: MovementPoint[] = [];
  for (let i = 0; i < maxPoints; i++) {
    result.push(points[Math.floor(i * step)]);
  }
  const last = points[points.length - 1];
  if (result[result.length - 1]?.t !== last.t) result.push(last);
  return result;
}

export function mirrorX(x: number, axisX: number): number {
  return 2 * axisX - x;
}

export function mirrorPoints(points: MovementPoint[], axisX: number): MovementPoint[] {
  return points.map((p) => ({ ...p, x: mirrorX(p.x, axisX) }));
}

/** Recorta la ventana [startFrac, endFrac] (0-1) de una serie de puntos y renormaliza t a partir de 0. */
export function trimPoints(points: MovementPoint[], startFrac: number, endFrac: number): MovementPoint[] {
  if (points.length === 0) return points;
  const duration = points[points.length - 1].t;
  const startT = duration * startFrac;
  const endT = duration * endFrac;
  const windowed = points.filter((p) => p.t >= startT && p.t <= endT);
  if (windowed.length === 0) return windowed;
  const offset = windowed[0].t;
  return windowed.map((p) => ({ ...p, t: p.t - offset }));
}

export interface DrawTrailOptions {
  color: string;
  strokeWidth: number;
  /** timestamp "ahora" para calcular desvanecimiento por edad; omitir para trazo estático a opacidad completa */
  nowT?: number;
  fadeMs?: number;
  dashed?: boolean;
  globalAlpha?: number;
}

/** Dibuja un trazo (vivo con desvanecimiento, o estático/fantasma) sobre un canvas 2D en coordenadas normalizadas 0-1. */
export function drawTrail(
  ctx: CanvasRenderingContext2D,
  points: MovementPoint[],
  width: number,
  height: number,
  opts: DrawTrailOptions
) {
  if (points.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = opts.strokeWidth;
  ctx.setLineDash(opts.dashed ? [opts.strokeWidth * 1.5, opts.strokeWidth * 1.5] : []);

  const toPx = (p: MovementPoint) => ({ x: p.x * width, y: p.y * height });

  if (opts.nowT === undefined || opts.fadeMs === undefined) {
    ctx.globalAlpha = opts.globalAlpha ?? 1;
    ctx.beginPath();
    let prev = toPx(points[0]);
    ctx.moveTo(prev.x, prev.y);
    for (let i = 1; i < points.length; i++) {
      const curr = toPx(points[i]);
      const mid = { x: (prev.x + curr.x) / 2, y: (prev.y + curr.y) / 2 };
      ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
      prev = curr;
    }
    ctx.lineTo(prev.x, prev.y);
    ctx.stroke();
  } else {
    const { nowT, fadeMs } = opts;
    for (let i = 1; i < points.length; i++) {
      const age = nowT - points[i].t;
      const alpha = Math.max(0, 1 - age / fadeMs);
      if (alpha <= 0) continue;
      const a = toPx(points[i - 1]);
      const b = toPx(points[i]);
      ctx.globalAlpha = alpha * (opts.globalAlpha ?? 1);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/** Dibuja únicamente la porción del trazo ya "revelada" hasta elapsedMs — usado en la reproducción fantasma de la práctica. */
export function drawGhostReveal(
  ctx: CanvasRenderingContext2D,
  points: MovementPoint[],
  width: number,
  height: number,
  elapsedMs: number,
  opts: { color?: string; strokeWidth?: number } = {}
) {
  const visible = points.filter((p) => p.t <= elapsedMs);
  drawTrail(ctx, visible, width, height, {
    color: opts.color ?? '#e9c349',
    strokeWidth: opts.strokeWidth ?? 3,
    dashed: true,
    globalAlpha: 0.55,
  });
}
