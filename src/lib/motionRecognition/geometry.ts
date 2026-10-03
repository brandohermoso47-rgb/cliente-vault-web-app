import type { Keyframe, Point, Pose } from '../../types/motionRecognition';

export function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function mid(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// Ángulo en grados (0–180) con vértice en b. Igual que angleAt() del prototipo.
export function angleAt(a: Point, b: Point, c: Point): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (m1 === 0 || m2 === 0) return 180;
  const cos = Math.max(-1, Math.min(1, (v1.x * v2.x + v1.y * v2.y) / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export interface TorsoGrid {
  top: number;
  bottom: number;
  left: number;
  center: number;
  right: number;
}

// Rejilla 2×3 del prototipo: de 0.6·torso sobre la nariz hasta las caderas, 1.2·ancho de hombros a cada lado.
export function torsoGrid(p: Pose): TorsoGrid {
  const shMid = mid(p.lsh, p.rsh);
  const hipMid = mid(p.lhip, p.rhip);
  const torso = dist(shMid, hipMid);
  const halfW = 1.2 * dist(p.lsh, p.rsh);
  return {
    top: p.nose.y - 0.6 * torso,
    bottom: hipMid.y,
    left: shMid.x - halfW,
    center: shMid.x,
    right: shMid.x + halfW,
  };
}

export function gridLines(g: TorsoGrid): { rows: number[]; cols: number[] } {
  const h = g.bottom - g.top;
  return { rows: [g.top, g.top + h / 3, g.top + (2 * h) / 3, g.bottom], cols: [g.left, g.center, g.right] };
}

export function gridNodes(g: TorsoGrid): Point[] {
  const { rows, cols } = gridLines(g);
  return rows.flatMap((y) => cols.map((x) => ({ x, y })));
}

// Distancia medida en unidades del ancho del cuadro (el prototipo compara contra w·0.045 en píxeles).
export function distInWidths(a: Point, b: Point, aspect: number): number {
  return Math.hypot(a.x - b.x, (a.y - b.y) / aspect);
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export function sampleKeyframes(kfs: Keyframe[], t: number): Keyframe | null {
  if (!kfs.length) return null;
  if (t <= kfs[0].t) return kfs[0];
  const last = kfs[kfs.length - 1];
  if (t >= last.t) return last;
  let lo = 0;
  let hi = kfs.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (kfs[m].t <= t) lo = m;
    else hi = m;
  }
  const a = kfs[lo];
  const b = kfs[hi];
  const k = (t - a.t) / (b.t - a.t);
  const pts: Record<string, Point> = {};
  for (const key of Object.keys(a.pts)) {
    const pb = b.pts[key] ?? a.pts[key];
    pts[key] = { x: lerp(a.pts[key].x, pb.x, k), y: lerp(a.pts[key].y, pb.y, k) };
  }
  if (!a.v) return { t, pts };
  const v: Record<string, number> = {};
  for (const key of Object.keys(a.v)) v[key] = k < 0.5 ? a.v[key] : b.v?.[key] ?? a.v[key];
  return { t, pts, v };
}

// Rectángulo donde realmente se pinta el video dentro de un contenedor con object-fit: contain.
export function contentRect(boxW: number, boxH: number, videoW: number, videoH: number) {
  if (!videoW || !videoH || !boxW || !boxH) return { x: 0, y: 0, width: boxW, height: boxH };
  const scale = Math.min(boxW / videoW, boxH / videoH);
  const width = videoW * scale;
  const height = videoH * scale;
  return { x: (boxW - width) / 2, y: (boxH - height) / 2, width, height };
}

// El prototipo suaviza a ~30 fps con alpha fijo; aquí se ajusta al intervalo real para conservar la misma inercia.
export function alphaFor(alphaAt30fps: number, dtMs: number): number {
  return 1 - Math.pow(1 - alphaAt30fps, Math.max(dtMs, 1) / (1000 / 30));
}
