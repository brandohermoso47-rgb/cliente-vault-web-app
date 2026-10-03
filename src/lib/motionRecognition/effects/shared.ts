import type { DrawContext, FigureEvent, Keyframe, Point, Pose, Side } from '../../../types/motionRecognition';
import { sampleKeyframes } from '../geometry';

export const YELLOW = '#FFD400';
export const BONE = '#F1EDE3';

export const SIDES: Side[] = ['L', 'R'];

export function arm(p: Pose, side: Side): { sh: Point; el: Point; wr: Point } {
  return side === 'L' ? { sh: p.lsh, el: p.lel, wr: p.lwr } : { sh: p.rsh, el: p.rel, wr: p.rwr };
}

// Corrige la relación de aspecto para que los ángulos coincidan con lo que se ve en pantalla.
export function square(p: Point, aspect: number): Point {
  return { x: p.x * aspect, y: p.y };
}

export function frameAt(event: FigureEvent, tMs: number): Keyframe | null {
  return sampleKeyframes(event.params.keyframes, tMs);
}

export function stroke(dc: DrawContext, color: string, alpha: number, width: number, points: Point[], close = false) {
  const { ctx, map } = dc;
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => {
    const q = map(p);
    if (i === 0) ctx.moveTo(q.x, q.y);
    else ctx.lineTo(q.x, q.y);
  });
  if (close) ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
