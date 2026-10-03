import type { EffectPlugin } from '../../../types/motionRecognition';
import { gridLines, gridNodes, torsoGrid } from '../geometry';
import { BONE, frameAt } from './shared';

export const torsoGridEffect: EffectPlugin = {
  type: 'torso_grid',
  label: 'Rejilla del torso',
  description: 'Cuadrícula 2×3 que sigue hombros y caderas.',
  defaultColor: BONE,
  enabledByDefault: true,

  detect(pose) {
    const g = torsoGrid(pose);
    return [{ key: 'torso_grid', pts: { tl: { x: g.left, y: g.top }, br: { x: g.right, y: g.bottom }, c: { x: g.center, y: g.top } } }];
  },

  draw(dc, event, tMs) {
    const f = frameAt(event, tMs);
    if (!f) return;
    const { tl, br, c } = f.pts;
    const g = { top: tl.y, bottom: br.y, left: tl.x, center: c.x, right: br.x };
    const { rows, cols } = gridLines(g);
    const { ctx, map } = dc;
    ctx.save();
    ctx.strokeStyle = event.color ?? BONE;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = Math.max(1.5, dc.width * 0.003);
    for (const x of cols) {
      const a = map({ x, y: rows[0] });
      const b = map({ x, y: rows[3] });
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    for (const y of rows) {
      const a = map({ x: cols[0], y });
      const b = map({ x: cols[2], y });
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.fillStyle = event.color ?? BONE;
    ctx.globalAlpha = 0.5;
    for (const n of gridNodes(g)) {
      const q = map(n);
      ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(2, dc.width * 0.003), 0, 2 * Math.PI); ctx.fill();
    }
    ctx.restore();
  },
};
