import type { EffectPlugin, Point } from '../../../types/motionRecognition';
import { SIDES, YELLOW, arm, frameAt } from './shared';

export const TRAIL_MS = 500;

export const wristTrailEffect: EffectPlugin = {
  type: 'wrist_trail',
  label: 'Estela de muñeca',
  description: 'Rastro de luz que deja la mano durante el último medio segundo.',
  defaultColor: YELLOW,
  enabledByDefault: false,

  detect(pose) {
    return SIDES.map((side) => ({ key: `wrist_trail:${side}`, side, pts: { w: arm(pose, side).wr } }));
  },

  draw(dc, event, tMs) {
    const path: { p: Point; t: number }[] = event.params.keyframes
      .filter((k) => k.t > tMs - TRAIL_MS && k.t < tMs)
      .map((k) => ({ p: k.pts.w, t: k.t }));
    const now = frameAt(event, tMs);
    if (now) path.push({ p: now.pts.w, t: tMs });
    const { ctx, map } = dc;
    ctx.save();
    ctx.strokeStyle = event.color ?? YELLOW;
    ctx.lineCap = 'round';
    for (let i = 1; i < path.length; i++) {
      const age = (tMs - path[i].t) / TRAIL_MS;
      const a = map(path[i - 1].p);
      const b = map(path[i].p);
      ctx.globalAlpha = Math.max(0, 0.7 * (1 - age));
      ctx.lineWidth = Math.max(2, dc.width * 0.01 * (1 - age));
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.restore();
  },
};
