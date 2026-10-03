import type { FigureEvent } from '../../types/motionRecognition';
import { api } from '../api';

const path = (classId: string) => `/classes/${encodeURIComponent(classId)}/figure-events`;

export async function loadFigureEvents(classId: string): Promise<FigureEvent[]> {
  const { events } = await api<{ events: FigureEvent[] }>('GET', path(classId));
  return events;
}

export async function saveFigureEvents(classId: string, events: FigureEvent[]): Promise<FigureEvent[]> {
  const body = events.map(({ type, side, startMs, endMs, params, color, editedManually }) => ({
    type, side, startMs, endMs, params, color, editedManually,
  }));
  const res = await api<{ events: FigureEvent[] }>('PUT', path(classId), { events: body });
  return res.events;
}
