// Coordenadas normalizadas 0–1 respecto al cuadro del video (como las entrega MediaPipe).
export interface Point {
  x: number;
  y: number;
}

export type FigureEffectType =
  | 'torso_grid'
  | 'arm_line'
  | 'elbow_triangle'
  | 'grid_points'
  | 'rotation_arc'
  | 'wrist_trail'
  | 'pose_echo';

export type Side = 'L' | 'R';

export interface Pose {
  nose: Point;
  lsh: Point;
  rsh: Point;
  lel: Point;
  rel: Point;
  lwr: Point;
  rwr: Point;
  lhip: Point;
  rhip: Point;
}

export interface PoseFrame {
  tMs: number;
  pose: Pose | null;
}

// Posición de la figura en un instante; `draw` interpola entre keyframes.
export interface Keyframe {
  t: number;
  pts: Record<string, Point>;
  v?: Record<string, number>;
}

export interface FigureEvent {
  id: string;
  type: FigureEffectType;
  side?: Side;
  startMs: number;
  endMs: number;
  params: { keyframes: Keyframe[] };
  color?: string;
  editedManually: boolean;
}

// Lo que un plugin observa en un cuadro; el segmentador une cuadros consecutivos con la misma `key` en un evento.
export interface FrameState {
  key: string;
  side?: Side;
  pts: Record<string, Point>;
  v?: Record<string, number>;
}

export interface DetectContext {
  tMs: number;
  aspect: number; // ancho / alto del video
  state: Record<string, any>; // memoria propia del plugin entre cuadros
}

export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  map: (p: Point) => Point; // normalizado → píxeles del canvas
  width: number; // ancho en píxeles del contenido del video
  height: number;
}

export interface EffectPlugin {
  type: FigureEffectType;
  label: string;
  description: string;
  defaultColor: string;
  enabledByDefault: boolean;
  detect(pose: Pose, ctx: DetectContext): FrameState[];
  draw(dc: DrawContext, event: FigureEvent, tMs: number): void;
}
