// Interacción social real sobre contenido (Reels, Lives): like, comentarios y seguir a alguien.
// Un "me gusta" o un comentario nunca tocan el documento del reel (que es del dueño del contenido);
// viven en subcolecciones propias, así cualquier persona con sesión puede reaccionar sin pisar reglas.
import { addDoc, collection, deleteDoc, doc, getCountFromServer, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type Comment = { id: string; uid: string; authorName: string; text: string; createdAt?: any };

export const toggleLike = async (kind: 'reels' | 'lives', itemId: string, uid: string, liked: boolean) => {
  const ref = doc(db, kind, itemId, 'likes', uid);
  if (liked) await deleteDoc(ref); else await setDoc(ref, { createdAt: serverTimestamp() });
};

export async function likeInfo(kind: 'reels' | 'lives', itemId: string, uid: string): Promise<{ count: number; liked: boolean }> {
  const [count, mine] = await Promise.all([
    getCountFromServer(collection(db, kind, itemId, 'likes')).then((s) => s.data().count).catch(() => 0),
    getDoc(doc(db, kind, itemId, 'likes', uid)).then((s) => s.exists()).catch(() => false),
  ]);
  return { count, liked: mine };
}

export function watchComments(kind: 'reels' | 'lives', itemId: string, cb: (rows: Comment[]) => void) {
  return onSnapshot(query(collection(db, kind, itemId, 'comments'), orderBy('createdAt', 'desc')), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }, () => cb([]));
}

export const addComment = (kind: 'reels' | 'lives', itemId: string, uid: string, authorName: string, text: string) =>
  addDoc(collection(db, kind, itemId, 'comments'), { uid, authorName, text: text.trim().slice(0, 500), createdAt: serverTimestamp() });

export const followId = (followerId: string, followingId: string) => `${followerId}_${followingId}`;

export const toggleFollow = async (followerId: string, followingId: string, following: boolean) => {
  const ref = doc(db, 'follows', followId(followerId, followingId));
  if (following) await deleteDoc(ref); else await setDoc(ref, { followerId, followingId, createdAt: serverTimestamp() });
};

export const isFollowing = (followerId: string, followingId: string) =>
  getDoc(doc(db, 'follows', followId(followerId, followingId))).then((s) => s.exists()).catch(() => false);
