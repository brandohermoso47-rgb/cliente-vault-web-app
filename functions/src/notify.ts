// Escribe notificaciones reales en la colección `notifications`. Las reglas de Firestore bloquean
// la escritura desde el cliente (allow create: if false) a propósito: solo el servidor (aquí) puede
// crearlas, así nadie puede falsificar un "te dio me gusta" o "te siguió" que nunca pasó.
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './db.js';

export type NotificationType = 'like' | 'comment' | 'follow' | 'friend_request' | 'friend_accept' | 'announcement';

type UserDoc = { displayName?: string; handle?: string };

const actorLabel = async (uid: string): Promise<string> => {
  try {
    const snap = await db.collection('users').doc(uid).get();
    const d = snap.data() as UserDoc | undefined;
    return d?.handle ? '@' + d.handle : d?.displayName || 'Alguien';
  } catch {
    return 'Alguien';
  }
};

export async function notify(opts: {
  userId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  text: string;
}) {
  if (opts.actorId && opts.actorId === opts.userId) return; // nunca notificarse a uno mismo
  await db.collection('notifications').add({
    userId: opts.userId,
    actorId: opts.actorId ?? null,
    type: opts.type,
    title: opts.title,
    text: opts.text,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export { actorLabel };
