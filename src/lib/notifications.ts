// Notificaciones reales: las crean las Cloud Functions en /functions (ver ese README), nunca el
// cliente directamente — las reglas de Firestore bloquean `create` a propósito. Aquí solo leemos
// las propias y marcamos como leídas/borramos, que sí lo permiten las reglas.
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export type AppNotification = {
  id: string; userId: string; actorId: string | null;
  type: 'like' | 'comment' | 'follow' | 'friend_request' | 'friend_accept' | 'announcement';
  title: string; text: string; read: boolean; createdAt?: any;
};

export function watchMyNotifications(uid: string, cb: (rows: AppNotification[]) => void) {
  const q = query(collection(db, 'notifications'), where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(40));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }, () => cb([]));
}

export const markNotificationRead = (id: string) => updateDoc(doc(db, 'notifications', id), { read: true });

export async function markAllNotificationsRead(rows: AppNotification[]) {
  const unread = rows.filter((n) => !n.read);
  if (!unread.length) return;
  const batch = writeBatch(db);
  for (const n of unread) batch.update(doc(db, 'notifications', n.id), { read: true });
  await batch.commit();
}

export const deleteNotification = (id: string) => deleteDoc(doc(db, 'notifications', id));
