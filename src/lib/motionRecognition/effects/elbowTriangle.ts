import type { EffectPlugin, FrameState } from '../../../types/motionRecognition';
import { angleAt } from '../geometry';
import { SIDES, YELLOW, arm, frameAt, square, stroke } from './shared';

export const RIGHT_ANGLE_MIN_DEG = 70;
export const RIGHT_ANGLE_MAX_DEG = 112;

export const elbowTriangleEffect: EffectPlugin = {
  type: 'elbow_triangle',
  label: 'Ángulo de 90° (tutting)',
  description: 'Triángulo relleno cuando el codo forma un ángulo recto.',
  defaultColor: YELLOW,
  enabledByDefault: true,

  detect(pose, { aspect }) {
    const out: FrameState[] = [];
    for (const side of SIDES) {
      const { sh, el, wr } = arm(pose, side);
      const a = angleAt(square(sh, aspect), square(el, aspect), square(wr, aspect));
      if (a > RIGHT_ANGLE_MIN_DEG && a < RIGHT_ANGLE_MAX_DEG) {
        out.push({ key: `elbow_triangle:${side}`, side, pts: { sh, el, wr } });
      }
    }
    return out;
  },

  draw(dc, event, tMs) {
    const f = frameAt(event, tMs);
    if (!f) return;
    const color = event.color ?? YELLOW;
    const { ctx, map } = dc;
    const [a, b, c] = [map(f.pts.sh), map(f.pts.el), map(f.pts.wr)];
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.closePath(); ctx.fill();
    ctx.restore();
    stroke(dc, color, 0.9, 2, [f.pts.sh, f.pts.el, f.pts.wr], true);
  },
};
