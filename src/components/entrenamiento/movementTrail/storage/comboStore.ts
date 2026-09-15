import { z } from 'zod';
import type { MovementCombo } from '../types';
import { createCollectionStore } from './collectionStore';
import { TRAIL_COMBOS_KEY } from './localStorageKeys';

const movementComboSchema: z.ZodType<MovementCombo> = z.object({
  id: z.string(),
  name: z.string(),
  figureIds: z.array(z.string()),
  bpm: z.number(),
  beatsPerFigure: z.number(),
  loop: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const comboStore = createCollectionStore<MovementCombo>(TRAIL_COMBOS_KEY, movementComboSchema);
