import type {
  EffectPlugin,
  FigureEffectType,
  FigureEvent,
  FrameState,
  Keyframe,
  Point,
  Pose,
  PoseFrame,
  Side,
} from '../../types/motionRecognition';
import { alphaFor } from './geometry';

export interface EngineOptions {
  plugins: EffectPlugin[];
  aspect: number;
  stepMs: number;
  maxGapFrames?: number;
  minDurationMs?: number;
}

const TORSO_JOINTS: (keyof Pose)[] = ['nose', 'lsh', 'rsh', 'lhip', 'rhip'];
const ARM_JOINTS: (keyof Pose)[] = ['lel', 'rel', 'lwr', 'rwr'];
// Del prototipo: la rejilla se suaviza más (0.35) que los brazos (0.5), valores pensados para ~30 fps.
const TORSO_ALPHA_30FPS = 0.35;
const ARM_ALPHA_30FPS = 0.5;
const MOVE_EPS = 0.004;
const VALUE_EPS = 0.05;

const round = (n: number) => Math.round(n * 10000) / 10000;

export class PoseSmoother {
  private prev: Pose | null = null;
  private prevT = 0;

  reset() {
    this.prev = null;
  }

  next(pose: Pose, tMs: number): Pose {
    if (!this.prev) {
      this.prev = clonePose(pose);
      this.prevT = tMs;
      return clonePose(this.prev);
    }
    const dt = tMs - this.prevT;
    const aTorso = alphaFor(TORSO_ALPHA_30FPS, dt);
    const aArm = alphaFor(ARM_ALPHA_30FPS, dt);
    for (const j of TORSO_JOINTS) blend(this.prev[j], pose[j], aTorso);
    for (const j of ARM_JOINTS) blend(this.prev[j], pose[j], aArm);
    this.prevT = tMs;
    return clonePose(this.prev);
  }
}

function blend(into: Point, target: Point, a: number) {
  into.x += a * (target.x - into.x);
  into.y += a * (target.y - into.y);
}

function clonePose(p: Pose): Pose {
  const out = {} as Pose;
  for (const k of Object.keys(p) as (keyof Pose)[]) out[k] = { x: p[k].x, y: p[k].y };
  return out;
}

interface Track {
  type: FigureEffectType;
  side?: Side;
  start: number;
  last: number;
  keyframes: Keyframe[];
  pending: Keyframe | null; // último cuadro observado que aún no se volvió keyframe
}

function toKeyframe(t: number, s: FrameState): Keyframe {
  const pts: Record<string, Point> = {};
  for (const [k, p] of Object.entries(s.pts)) pts[k] = { x: round(p.x), y: round(p.y) };
  return s.v ? { t, pts, v: { ...s.v } } : { t, pts };
}

function changed(a: Keyframe, b: Keyframe): boolean {
  for (const k of Object.keys(b.pts)) {
    const p = a.pts[k];
    if (!p || Math.abs(p.x - b.pts[k].x) > MOVE_EPS || Math.abs(p.y - b.pts[k].y) > MOVE_EPS) return true;
  }
  if (b.v) for (const k of Object.keys(b.v)) if (Math.abs((a.v?.[k] ?? Infinity) - b.v[k]) > VALUE_EPS) return true;
  return false;
}

// Une cuadros consecutivos con la misma `key` en eventos editables con keyframes decimados.
export function buildEvents(frames: PoseFrame[], opts: EngineOptions): FigureEvent[] {
  const { plugins, aspect, stepMs } = opts;
  const maxGap = stepMs * ((opts.maxGapFrames ?? 2) + 1);
  const minDuration = opts.minDurationMs ?? 200;
  const smoother = new PoseSmoother();
  const pluginState = new Map<EffectPlugin, Record<string, any>>(plugins.map((p) => [p, {}]));
  const open = new Map<string, Track>();
  const events: FigureEvent[] = [];

  const close = (track: Track) => {
    if (track.pending) track.keyframes.push(track.pending);
    const endMs = track.last + stepMs;
    if (endMs - track.start < minDuration) return;
    events.push({
      id: crypto.randomUUID(),
      type: track.type,
      ...(track.side ? { side: track.side } : {}),
      startMs: Math.round(track.start),
      endMs: Math.round(endMs),
      params: { keyframes: track.keyframes },
      editedManually: false,
    });
  };

  let lastPoseT = -Infinity;
  for (const { tMs, pose } of frames) {
    if (!pose) continue;
    if (tMs - lastPoseT > maxGap) smoother.reset();
    lastPoseT = tMs;
    const smooth = smoother.next(pose, tMs);

    for (const plugin of plugins) {
      const states = plugin.detect(smooth, { tMs, aspect, state: pluginState.get(plugin)! });
      for (const s of states) {
        const kf = toKeyframe(tMs, s);
        const track = open.get(s.key);
        if (track && tMs - track.last <= maxGap) {
          track.last = tMs;
          const lastKf = track.keyframes[track.keyframes.length - 1];
          if (changed(lastKf, kf)) {
            if (track.pending && track.pending.t !== lastKf.t) track.keyframes.push(track.pending);
            track.keyframes.push(kf);
            track.pending = null;
          } else {
            track.pending = kf;
          }
          continue;
        }
        if (track) close(track);
        open.set(s.key, { type: plugin.type, side: s.side, start: tMs, last: tMs, keyframes: [kf], pending: null });
      }
    }

    for (const [key, track] of open) {
      if (tMs - track.last > maxGap) {
        close(track);
        open.delete(key);
      }
    }
  }
  for (const track of open.values()) close(track);

  return events.sort((a, b) => a.startMs - b.startMs || a.type.localeCompare(b.type));
}
