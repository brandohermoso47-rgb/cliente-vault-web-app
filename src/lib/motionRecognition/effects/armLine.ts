import type { EffectPlugin, FrameState } from '../../../types/motionRecognition';
import { angleAt } from '../geometry';
import { SIDES, YELLOW, arm, frameAt, square, stroke } from './shared';

export const ARM_EXTENDED_DEG = 160;

export const armLineEffect: EffectPlugin = {
  type: 'arm_line',
  label: 'Brazo extendido',
  description: 'Línea hombro–muñeca cuando el codo pasa de ~160°.',
  defaultColor: YELLOW,
  enabledByDefault: true,

  detect(pose, { aspect }) {
    const out: FrameState[] = [];
    for (const side of SIDES) {
      const { sh, el, wr } = arm(pose, side);
      if (angleAt(square(sh, aspect), square(el, aspect), square(wr, aspect)) > ARM_EXTENDED_DEG) {
        out.push({ key: `arm_line:${side}`, side, pts: { sh, wr } });
      }
    }
    return out;
  },

  draw(dc, event, tMs) {
    const f = frameAt(event, tMs);
    if (!f) return;
    stroke(dc, event.color ?? YELLOW, 0.85, Math.max(3, dc.width * 0.012), [f.pts.sh, f.pts.wr]);
  },
};
