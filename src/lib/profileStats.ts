// Números reales del perfil: nada de contadores de mentira. Si el usuario es nuevo, todo empieza en 0
// y va subiendo con lo que de verdad publica/gana en la app.
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';

export function watchFollowCounts(uid: string, cb: (counts: { followers: number; following: number }) => void) {
  const state = { followers: 0, following: 0 };
  const emit = () => cb({ ...state });
  const u1 = onSnapshot(query(collection(db, 'follows'), where('followingId', '==', uid)), (s) => { state.followers = s.size; emit(); }, () => {});
  const u2 = onSnapshot(query(collection(db, 'follows'), where('followerId', '==', uid)), (s) => { state.following = s.size; emit(); }, () => {});
  return () => { u1(); u2(); };
}

export type MediaTile = { id: string; kind: 'Vídeo' | 'Foto'; mediaUrl: string | null; likes: number; createdAt?: any };

// Mis publicaciones con foto/video (posts) + mis reels, combinados en una sola grilla en vivo.
export function watchMyMedia(uid: string, cb: (tiles: MediaTile[]) => void) {
  let posts: MediaTile[] = [];
  let reels: MediaTile[] = [];
  const emit = () => {
    const all = [...posts, ...reels].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    cb(all);
  };
  const u1 = onSnapshot(query(collection(db, 'posts'), where('authorId', '==', uid)), (s) => {
    posts = s.docs.filter((d) => d.data().mediaUrl).map((d) => {
      const x: any = d.data();
      return { id: d.id, kind: x.mediaType === 'video' ? 'Vídeo' : 'Foto', mediaUrl: x.mediaUrl, likes: x.likesCount ?? 0, createdAt: x.createdAt } as MediaTile;
    });
    emit();
  }, () => {});
  const u2 = onSnapshot(query(collection(db, 'reels'), where('ownerId', '==', uid)), (s) => {
    reels = s.docs.map((d) => {
      const x: any = d.data();
      return { id: d.id, kind: 'Vídeo', mediaUrl: x.mediaUrl ?? null, likes: 0, createdAt: x.createdAt } as MediaTile;
    });
    emit();
  }, () => {});
  return () => { u1(); u2(); };
}

// Total de publicaciones (con o sin media) + reels — lo que se ve como "Publicaciones" en el perfil.
export function watchMyPostCount(uid: string, cb: (count: number) => void) {
  let posts = 0, reels = 0;
  const emit = () => cb(posts + reels);
  const u1 = onSnapshot(query(collection(db, 'posts'), where('authorId', '==', uid)), (s) => { posts = s.size; emit(); }, () => {});
  const u2 = onSnapshot(query(collection(db, 'reels'), where('ownerId', '==', uid)), (s) => { reels = s.size; emit(); }, () => {});
  return () => { u1(); u2(); };
}
