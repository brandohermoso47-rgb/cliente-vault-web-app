// Amistades reales: usa la colección `friendships` que ya definen las reglas de Firestore
// ({ users:[uidA,uidB], requesterId, status }). Nada de esto es de mentira ni local: cada acción
// escribe en Firestore y solo la ven las dos personas involucradas.
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export type Friendship = { id: string; users: string[]; requesterId: string; status: 'pending' | 'accepted' | 'declined' | 'blocked'; createdAt?: unknown };

export async function sendFriendRequest(myUid: string, otherUid: string) {
  if (myUid === otherUid) throw new Error('No puedes agregarte a ti mismo.');
  await addDoc(collection(db, 'friendships'), { users: [myUid, otherUid], requesterId: myUid, status: 'pending', createdAt: serverTimestamp() });
}

export const acceptFriend = (id: string) => updateDoc(doc(db, 'friendships', id), { status: 'accepted' });
export const declineFriend = (id: string) => updateDoc(doc(db, 'friendships', id), { status: 'declined' });
export const removeFriend = (id: string) => deleteDoc(doc(db, 'friendships', id));

// Todas mis relaciones de amistad en vivo (pendientes + aceptadas), para que la pantalla decida qué mostrar.
export function watchMyFriendships(uid: string, cb: (rows: Friendship[]) => void) {
  return onSnapshot(query(collection(db, 'friendships'), where('users', 'array-contains', uid)), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }, () => cb([]));
}

// Solo los IDs de amigos ya aceptados (para filtrar el feed).
export function myFriendIds(rows: Friendship[], uid: string): string[] {
  return rows.filter((f) => f.status === 'accepted').map((f) => f.users.find((u) => u !== uid)).filter((u): u is string => !!u);
}
