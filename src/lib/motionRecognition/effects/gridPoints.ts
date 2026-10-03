import type { EffectPlugin, FrameState } from '../../../types/motionRecognition';
import { distInWidths, gridNodes, torsoGrid } from '../geometry';
import { SIDES, YELLOW, arm, frameAt } from './shared';

// El prototipo ilumina un nodo cuando la muñeca queda a menos de 0.045 × ancho del cuadro.
export const SNAP_WIDTHS = 0.045;

export const gridPointsEffect: EffectPlugin = {
  type: 'grid_points',
  label: 'Puntos de rejilla',
  description: 'Brillo en la intersección cuando una muñeca cae justo sobre ella.',
  defaultColor: YELLOW,
  enabledByDefault: true,

  detect(pose, { aspect }) {
    const nodes = gridNodes(torsoGrid(pose));
    const out: FrameState[] = [];
    for (const side of SIDES) {
      const { wr } = arm(pose, side);
      let best = -1;
      let bestD = SNAP_WIDTHS;
      nodes.forEach((n, i) => {
        const d = distInWidths(n, wr, aspect);
        if (d < bestD) { best = i; bestD = d; }
      });
      if (best >= 0) out.push({ key: `grid_points:${side}:${best}`, side, pts: { node: nodes[best] } });
    }
    return out;
  },

  draw(dc, event, tMs) {
    const f = frameAt(event, tMs);
    if (!f) return;
    const q = dc.map(f.pts.node);
    const { ctx } = dc;
    ctx.save();
    ctx.fillStyle = event.color ?? YELLOW;
    ctx.globalAlpha = 0.95;
    ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(4, dc.width * 0.0065), 0, 2 * Math.PI); ctx.fill();
    ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(8, dc.width * 0.013), 0, 2 * Math.PI); ctx.fill();
    ctx.restore();
  },
};
