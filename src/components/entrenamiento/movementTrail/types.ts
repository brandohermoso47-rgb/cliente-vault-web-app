export type MovementPointSource = 'hand' | 'pose';

/** Un punto normalizado (0-1) del trazo, ya corregido para el espejo del video. */
export interface MovementPoint {
  x: number;
  y: number;
  /** milisegundos relativos al inicio de la grabación */
  t: number;
  source: MovementPointSource;
}

export const FIGURE_COLORS = [
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#10b981', // emerald
  '#d9a9ff', // gold
  '#f43f5e', // rose
  '#f5f5f7', // blanco
] as const;

export interface MovementFigure {
  id: string;
  name: string;
  points: MovementPoint[];
  durationMs: number;
  mirrored: boolean;
  mirrorAxisX: number;
  color: string;
  strokeWidth: number;
  createdAt: number;
  updatedAt: number;
}

export interface MovementCombo {
  id: string;
  name: string;
  figureIds: string[];
  bpm: number;
  beatsPerFigure: number;
  loop: boolean;
  createdAt: number;
  updatedAt: number;
}

export type MovementTrailTab = 'camara' | 'galeria' | 'combos' | 'practica';
