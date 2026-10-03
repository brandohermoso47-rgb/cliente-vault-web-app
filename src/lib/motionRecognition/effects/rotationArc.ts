import type { EffectPlugin, FrameState, Side } from '../../../types/motionRecognition';
import { SIDES, YELLOW, arm, frameAt } from './shared';

export const ARC_WINDOW_MS = 650;
export const ARC_MIN_SWEEP_DEG = 95;

type Sample = { raw: number; u: number; t: number };

// Barrido angular de la muñeca alrededor del hombro, con el ángulo "desenrollado" como en el prototipo.
export const rotationArcEffect: EffectPlugin = {
  type: 'rotation_arc',
  label: 'Arco de rotación (waack)',
  description: 'Cuña cuando la muñeca traza un giro amplio alrededor del hombro.',
  defaultColor: YELLOW,
  enabledByDefault: false,

  detect(pose, { tMs, aspect, state }) {
    const bufs: Record<Side, Sample[]> = (state.bufs ??= { L: [], R: [] });
    const out: FrameState[] = [];
    for (const side of SIDES) {
      const { sh, wr } = arm(pose, side);
      const buf = bufs[side];
      const raw = Math.atan2(wr.y - sh.y, (wr.x - sh.x) * aspect);
      let u = raw;
      if (buf.length) {
        const lastU = buf[buf.length - 1].u;
        let d = raw - (lastU % (2 * Math.PI));
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        u = lastU + d;
      }
      buf.push({ raw, u, t: tMs });
      while (buf.length && tMs - buf[0].t > ARC_WINDOW_MS) buf.shift();
      if (buf.length > 4) {
        const sweep = ((buf[buf.length - 1].u - buf[0].u) * 180) / Math.PI;
        if (Math.abs(sweep) > ARC_MIN_SWEEP_DEG) {
          out.push({ key: `rotation_arc:${side}`, side, pts: { c: sh, w: wr }, v: { a0: buf[0].raw, a1: raw, ccw: sweep < 0 ? 1 : 0 } });
        }
      }
    }
    return out;
  },

  draw(dc, event, tMs) {
    const f = frameAt(event, tMs);
    if (!f?.v) return;
    const c = dc.map(f.pts.c);
    const w = dc.map(f.pts.w);
    const radius = Math.hypot(w.x - c.x, w.y - c.y);
    const ccw = f.v.ccw === 1;
    const { ctx } = dc;
    ctx.save();
    ctx.fillStyle = event.color ?? YELLOW;
    ctx.globalAlpha = 0.28;
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.arc(c.x, c.y, radius, f.v.a0, f.v.a1, ccw); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = event.color ?? YELLOW;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(c.x, c.y, radius, f.v.a0, f.v.a1, ccw); ctx.stroke();
    ctx.restore();
  },
};
