// Calendario de clases: los instructores programan sus clases y cada persona las agrega a su calendario
// (archivo .ics, que abren Apple/Outlook/Google, o enlace directo a Google Calendar).
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export type ClassEvent = { id: string; ownerId: string; author: string; title: string; description: string; startsAt: any; durationMin: number };

export async function createEvent(o: { uid: string; author: string; title: string; description: string; startsAt: Date; durationMin: number }) {
  const title = o.title.trim().slice(0, 100);
  if (!title) throw new Error('Ponle un título a la clase.');
  if (isNaN(o.startsAt.getTime())) throw new Error('Elige la fecha y la hora.');
  if (o.startsAt.getTime() < Date.now() - 3600_000) throw new Error('La fecha ya pasó. Elige una futura.');
  const durationMin = Math.min(Math.max(Math.round(o.durationMin) || 60, 10), 480);
  await addDoc(collection(db, 'events'), {
    ownerId: o.uid, author: o.author, title, description: o.description.trim().slice(0, 500),
    startsAt: Timestamp.fromDate(o.startsAt), durationMin, createdAt: serverTimestamp(),
  });
}

export const deleteEvent = (id: string) => deleteDoc(doc(db, 'events', id));

export function subscribeEvents(cb: (rows: ClassEvent[]) => void) {
  return onSnapshot(query(collection(db, 'events'), orderBy('startsAt', 'asc'), limit(100)), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ClassEvent[]);
  }, (err) => { console.error('subscribeEvents', err); cb([]); });
}

const pad = (n: number) => String(n).padStart(2, '0');
const utc = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const range = (e: ClassEvent) => { const s: Date = e.startsAt.toDate(); return [s, new Date(s.getTime() + e.durationMin * 60000)] as const; };

export function downloadIcs(e: ClassEvent) {
  const [s, en] = range(e);
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Waack On//Clases//ES', 'BEGIN:VEVENT', `UID:${e.id}@waack-on.com`, `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(s)}`, `DTEND:${utc(en)}`, `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc((e.description ? e.description + '\n' : '') + 'Con ' + e.author + ' en Waack On: https://waack-on.com')}`,
    'URL:https://waack-on.com', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  a.download = 'clase-waack-on.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function googleCalendarUrl(e: ClassEvent) {
  const [s, en] = range(e);
  const p = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates: `${utc(s)}/${utc(en)}`, details: (e.description ? e.description + '\n' : '') + 'Con ' + e.author + ' en Waack On: https://waack-on.com' });
  return 'https://calendar.google.com/calendar/render?' + p.toString();
}
