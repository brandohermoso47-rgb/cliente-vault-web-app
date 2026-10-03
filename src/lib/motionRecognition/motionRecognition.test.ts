import { describe, expect, it } from 'vitest';
import type { Point, Pose, PoseFrame } from '../../types/motionRecognition';
import { EFFECT_PLUGINS, getEffectPlugin } from './effects';
import { buildEvents } from './engine';
import { safeVideoUrl } from '../safeVideoUrl';
import { angleAt, contentRect, gridNodes, sampleKeyframes, torsoGrid } from './geometry';

// Pose de frente en un cuadro cuadrado; el brazo izquierdo se coloca con el ángulo de codo pedido.
function pose(leftElbowDeg = 180, rightElbowDeg = 180, opts: { lwr?: Point } = {}): Pose {
  const lsh = { x: 0.4, y: 0.3 };
  const rsh = { x: 0.6, y: 0.3 };
  const armWith = (sh: Point, dir: 1 | -1, deg: number) => {
    const el = { x: sh.x + dir * 0.1, y: sh.y };
    const rad = ((180 - deg) * Math.PI) / 180;
    // El antebrazo gira desde la prolongación del brazo hacia arriba.
    const wr = { x: el.x + dir * 0.1 * Math.cos(rad), y: el.y - 0.1 * Math.sin(rad) };
    return { el, wr };
  };
  const l = armWith(lsh, -1, leftElbowDeg);
  const r = armWith(rsh, 1, rightElbowDeg);
  return {
    nose: { x: 0.5, y: 0.2 },
    lsh, rsh,
    lel: l.el, lwr: opts.lwr ?? l.wr,
    rel: r.el, rwr: r.wr,
    lhip: { x: 0.45, y: 0.6 }, rhip: { x: 0.55, y: 0.6 },
  };
}

const ctx = (tMs = 0) => ({ tMs, aspect: 1, state: {} });
const plugin = (t: Parameters<typeof getEffectPlugin>[0]) => getEffectPlugin(t)!;
const frames = (n: number, make: (i: number) => Pose | null, step = 100): PoseFrame[] =>
  Array.from({ length: n }, (_, i) => ({ tMs: i * step, pose: make(i) }));

describe('geometría portada del prototipo', () => {
  it('angleAt mide el ángulo del codo', () => {
    expect(angleAt({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 })).toBeCloseTo(180);
    expect(angleAt({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(90);
    expect(angleAt({ x: 1, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 })).toBe(180);
  });

  it('la rejilla usa nariz − 0.6·torso arriba, caderas abajo y ±1.2·hombros', () => {
    const g = torsoGrid(pose());
    expect(g.top).toBeCloseTo(0.2 - 0.6 * 0.3);
    expect(g.bottom).toBeCloseTo(0.6);
    expect(g.left).toBeCloseTo(0.5 - 1.2 * 0.2);
    expect(g.right).toBeCloseTo(0.5 + 1.2 * 0.2);
    expect(gridNodes(g)).toHaveLength(12);
  });

  it('contentRect calcula las barras de un video 9:16 dentro de una caja 16:9', () => {
    const r = contentRect(1600, 900, 1080, 1920);
    expect(r.height).toBeCloseTo(900);
    expect(r.width).toBeCloseTo(506.25);
    expect(r.x).toBeCloseTo((1600 - 506.25) / 2);
    expect(r.y).toBe(0);
  });

  it('sampleKeyframes interpola y se queda en los extremos', () => {
    const kfs = [{ t: 0, pts: { a: { x: 0, y: 0 } } }, { t: 100, pts: { a: { x: 1, y: 2 } } }];
    expect(sampleKeyframes(kfs, 50)!.pts.a).toEqual({ x: 0.5, y: 1 });
    expect(sampleKeyframes(kfs, -10)!.pts.a).toEqual({ x: 0, y: 0 });
    expect(sampleKeyframes(kfs, 500)!.pts.a).toEqual({ x: 1, y: 2 });
    expect(sampleKeyframes([], 0)).toBeNull();
  });
});

describe('reglas de los plugins', () => {
  it('brazo estirado (180°) → línea de brazo en ambos lados, sin triángulo', () => {
    expect(plugin('arm_line').detect(pose(180, 180), ctx()).map((s) => s.key)).toEqual(['arm_line:L', 'arm_line:R']);
    expect(plugin('elbow_triangle').detect(pose(180, 180), ctx())).toEqual([]);
  });

  it('codo a 90° → triángulo; a 130° → nada', () => {
    expect(plugin('elbow_triangle').detect(pose(90, 180), ctx()).map((s) => s.key)).toEqual(['elbow_triangle:L']);
    expect(plugin('elbow_triangle').detect(pose(130, 130), ctx())).toEqual([]);
    expect(plugin('arm_line').detect(pose(130, 130), ctx())).toEqual([]);
  });

  it('los umbrales siguen al prototipo: >160° línea, 70–112° triángulo', () => {
    expect(plugin('arm_line').detect(pose(165), ctx()).some((s) => s.side === 'L')).toBe(true);
    expect(plugin('arm_line').detect(pose(155), ctx()).some((s) => s.side === 'L')).toBe(false);
    expect(plugin('elbow_triangle').detect(pose(72), ctx()).some((s) => s.side === 'L')).toBe(true);
    expect(plugin('elbow_triangle').detect(pose(115), ctx()).some((s) => s.side === 'L')).toBe(false);
  });

  it('el ángulo se mide en proporción real de pantalla (video vertical)', () => {
    // Codo a 90° en píxeles de un video 9:16: en coordenadas normalizadas x se estira por 16/9.
    const aspect = 9 / 16;
    const p = pose();
    p.lsh = { x: 0.5, y: 0.3 };
    p.lel = { x: 0.5 - 0.1 / aspect, y: 0.3 };
    p.lwr = { x: p.lel.x, y: 0.2 };
    expect(plugin('elbow_triangle').detect(p, { tMs: 0, aspect, state: {} }).some((s) => s.side === 'L')).toBe(true);
  });

  it('la muñeca sobre un nodo de la rejilla lo ilumina', () => {
    const nodes = gridNodes(torsoGrid(pose()));
    const states = plugin('grid_points').detect(pose(180, 180, { lwr: { x: nodes[4].x + 0.01, y: nodes[4].y } }), ctx());
    expect(states.map((s) => s.key)).toContain('grid_points:L:4');
  });

  it('el arco aparece solo tras un barrido de más de 95° en 650 ms', () => {
    const arc = plugin('rotation_arc');
    const state = {};
    const circle = (deg: number) => {
      const p = pose();
      const r = (deg * Math.PI) / 180;
      p.lwr = { x: p.lsh.x + 0.2 * Math.cos(r), y: p.lsh.y + 0.2 * Math.sin(r) };
      return p;
    };
    const seen: boolean[] = [];
    for (let i = 0; i <= 6; i++) seen.push(arc.detect(circle(i * 25), { tMs: i * 100, aspect: 1, state }).some((s) => s.side === 'L'));
    expect(seen.slice(0, 4).every((x) => !x)).toBe(true);
    expect(seen[5]).toBe(true);
  });

  it('los efectos de fase 2 vienen desactivados por defecto', () => {
    const off = EFFECT_PLUGINS.filter((p) => !p.enabledByDefault).map((p) => p.type).sort();
    expect(off).toEqual(['pose_echo', 'rotation_arc', 'wrist_trail']);
  });
});

describe('segmentación en eventos', () => {
  const plugins = [plugin('arm_line'), plugin('elbow_triangle')];

  it('cuadros consecutivos forman un solo evento con su rango real', () => {
    const fs = frames(20, (i) => (i >= 5 && i < 12 ? pose(180, 90) : pose(130, 90)));
    const events = buildEvents(fs, { plugins, aspect: 1, stepMs: 100 });
    const left = events.filter((e) => e.type === 'arm_line' && e.side === 'L');
    expect(left).toHaveLength(1);
    expect(left[0].startMs).toBeGreaterThanOrEqual(500);
    expect(left[0].endMs).toBeLessThanOrEqual(1300);
    // El brazo derecho se mantiene a 90° todo el tiempo: un solo triángulo de todo el clip.
    const right = events.filter((e) => e.type === 'elbow_triangle' && e.side === 'R');
    expect(right).toHaveLength(1);
    expect(right[0].startMs).toBe(0);
    expect(right[0].endMs).toBe(2000);
  });

  it('tolera huecos cortos (sin cuerpo) pero corta los largos', () => {
    const short = frames(20, (i) => (i === 8 || i === 9 ? null : pose(130, 90)));
    expect(buildEvents(short, { plugins, aspect: 1, stepMs: 100 }).filter((e) => e.side === 'R')).toHaveLength(1);
    const long = frames(20, (i) => (i >= 8 && i < 13 ? null : pose(130, 90)));
    expect(buildEvents(long, { plugins, aspect: 1, stepMs: 100 }).filter((e) => e.side === 'R')).toHaveLength(2);
  });

  it('descarta destellos de menos de 200 ms', () => {
    const fs = frames(20, (i) => (i === 10 ? pose(180, 130) : pose(130, 130)));
    expect(buildEvents(fs, { plugins, aspect: 1, stepMs: 100 })).toEqual([]);
  });

  it('una pose quieta no genera keyframes de más', () => {
    const fs = frames(50, () => pose(130, 90));
    const [ev] = buildEvents(fs, { plugins, aspect: 1, stepMs: 100 });
    expect(ev.params.keyframes.length).toBeLessThanOrEqual(2);
    expect(ev.editedManually).toBe(false);
    expect(typeof ev.id).toBe('string');
  });
});

describe('safeVideoUrl', () => {
  it('acepta blob: y https:, rechaza el resto', () => {
    expect(safeVideoUrl('https://firebasestorage.googleapis.com/v0/b/x/o/v.mp4?alt=media')).toMatch(/^https:/);
    expect(safeVideoUrl('blob:http://localhost/abc')).toBe('blob:http://localhost/abc');
    expect(safeVideoUrl('javascript:alert(1)')).toBeNull();
    expect(safeVideoUrl('data:video/mp4;base64,AAAA')).toBeNull();
    expect(safeVideoUrl('http://inseguro.test/v.mp4')).toBeNull();
    expect(safeVideoUrl('')).toBeNull();
  });
});
