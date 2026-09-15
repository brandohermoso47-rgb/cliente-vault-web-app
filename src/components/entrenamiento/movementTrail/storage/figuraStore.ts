import { z } from 'zod';
import type { MovementFigure } from '../types';
import { createCollectionStore } from './collectionStore';
import { TRAIL_FIGURAS_KEY } from './localStorageKeys';

const movementPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  t: z.number(),
  source: z.enum(['hand', 'pose']),
});

const movementFigureSchema: z.ZodType<MovementFigure> = z.object({
  id: z.string(),
  name: z.string(),
  points: z.array(movementPointSchema),
  durationMs: z.number(),
  mirrored: z.boolean(),
  mirrorAxisX: z.number(),
  color: z.string(),
  strokeWidth: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const figuraStore = createCollectionStore<MovementFigure>(TRAIL_FIGURAS_KEY, movementFigureSchema);
