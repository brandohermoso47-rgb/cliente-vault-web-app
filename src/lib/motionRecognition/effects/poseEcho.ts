import type { EffectPlugin } from '../../../types/motionRecognition';
import { YELLOW, frameAt, stroke } from './shared';

export const ECHO_SPACING_MS = 120;
export const ECHO_COUNT = 4; // el prototipo guarda 5 instantáneas y dibuja todas menos la actual

export const poseEchoEffect: EffectPlugin = {
  type: 'pose_echo',
  label: 'Ecos de pose',
  description: 'Siluetas fantasma de las posiciones anteriores.',
  defaultColor: YELLOW,
  enabledByDefault: false,

  detect(p) {
    return [{ key: 'pose_echo', pts: { lsh: p.lsh, lel: p.lel, lwr: p.lwr, rsh: p.rsh, rel: p.rel, rwr: p.rwr, lhip: p.lhip, rhip: p.rhip } }];
  },

  draw(dc, event, tMs) {
    const color = event.color ?? YELLOW;
    const width = Math.max(2, dc.width * 0.006);
    for (let k = ECHO_COUNT; k >= 1; k--) {
      const t = tMs - k * ECHO_SPACING_MS;
      if (t < event.startMs) continue;
      const f = frameAt(event, t);
      if (!f) continue;
      const p = f.pts;
      const alpha = 0.12 + ((ECHO_COUNT + 1 - k) / (ECHO_COUNT + 1)) * 0.15;
      stroke(dc, color, alpha, width, [p.lsh, p.lel, p.lwr]);
      stroke(dc, color, alpha, width, [p.rsh, p.rel, p.rwr]);
      stroke(dc, color, alpha, width, [p.lsh, p.rsh, p.rhip, p.lhip], true);
    }
  },
};
