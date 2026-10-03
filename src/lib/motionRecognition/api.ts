import type { FigureEvent } from '../../types/motionRecognition';
import { api } from '../api';

const path = (classId: string) => `/classes/${encodeURIComponent(classId)}/figure-events`;

// videoUrl: video de la clase para el que se calcularon las figuras (null si no hay guardadas).
export type FigureSet = { events: FigureEvent[]; videoUrl: string | null };

export function loadFigureEvents(classId: string): Promise<FigureSet> {
  return api<FigureSet>('GET', path(classId));
}

// La API rechaza con 409 si la clase ya no tiene ese video (p. ej. se cambió en otra pestaña).
export function saveFigureEvents(classId: string, events: FigureEvent[], videoUrl: string | null): Promise<FigureSet> {
  const body = events.map(({ type, side, startMs, endMs, params, color, editedManually }) => ({
    type, side, startMs, endMs, params, color, editedManually,
  }));
  return api<FigureSet>('PUT', path(classId), { events: body, videoUrl });
}
