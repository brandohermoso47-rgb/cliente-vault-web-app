// Publicaciones reales del dashboard: colección `posts` en Firestore. El feed de cada usuario se arma
// con sus propias publicaciones + las de sus amigos aceptados (nunca las de un desconocido).
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from './firebase';
import { IMAGE_TYPES, MAX_IMAGE_MB, MAX_VIDEO_MB, VIDEO_TYPES } from './validators';

export type Post = {
  id: string; authorId: string; authorName: string; authorHandle: string; authorPhotoURL: string | null;
  text: string; mediaUrl: string | null; mediaType: 'image' | 'video' | null; likesCount: number; commentsCount: number; createdAt?: any;
};

const safe = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);

export function checkPostFile(f: File): 'image' | 'video' | string {
  if (IMAGE_TYPES.includes(f.type)) return f.size > MAX_IMAGE_MB * 1048576 ? `«${f.name}»: las fotos pueden pesar máx. ${MAX_IMAGE_MB} MB.` : 'image';
  if (VIDEO_TYPES.includes(f.type)) return f.size > MAX_VIDEO_MB * 1048576 ? `«${f.name}»: los videos pueden pesar máx. ${MAX_VIDEO_MB} MB.` : 'video';
  return `«${f.name}»: formato no permitido (fotos JPG/PNG/WEBP/GIF o videos MP4/WEBM/MOV).`;
}

export async function publishPost(opts: {
  uid: string; authorName: string; authorHandle: string; authorPhotoURL: string | null; text: string; file?: File | null;
  onProgress?: (pct: number) => void;
}) {
  const text = opts.text.trim().slice(0, 2000);
  if (!text && !opts.file) throw new Error('Escribe algo o adjunta una foto o un video.');
  let mediaUrl: string | null = null;
  let mediaType: 'image' | 'video' | null = null;
  if (opts.file) {
    const kind = checkPostFile(opts.file);
    if (kind !== 'image' && kind !== 'video') throw new Error(kind);
    mediaType = kind;
    const path = `users/${opts.uid}/posts/${Date.now()}-${safe(opts.file.name)}`;
    const task = uploadBytesResumable(ref(storage, path), opts.file, { contentType: opts.file.type });
    mediaUrl = await new Promise<string>((resolve, reject) => {
      task.on('state_changed',
        (s) => opts.onProgress?.((s.bytesTransferred / s.totalBytes) * 100),
        reject,
        () => getDownloadURL(task.snapshot.ref).then(resolve, reject));
    });
  }
  await addDoc(collection(db, 'posts'), {
    authorId: opts.uid, authorName: opts.authorName, authorHandle: opts.authorHandle, authorPhotoURL: opts.authorPhotoURL,
    text, mediaUrl, mediaType, likesCount: 0, commentsCount: 0, createdAt: serverTimestamp(),
  });
}

// Firestore permite hasta 30 valores por consulta "in": si hay más amigos, se reparte en varias
// consultas y se combinan. Con pocos amigos (lo normal al principio) es una sola consulta.
export function subscribeFeed(authorIds: string[], cb: (posts: Post[]) => void) {
  const ids = authorIds.length ? authorIds : ['__none__'];
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));
  const byChunk = new Map<number, Post[]>();
  const emit = () => {
    const all = ([] as Post[]).concat(...byChunk.values());
    all.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    cb(all.slice(0, 50));
  };
  const unsubs = chunks.map((chunk, i) =>
    onSnapshot(query(collection(db, 'posts'), where('authorId', 'in', chunk), orderBy('createdAt', 'desc')), (snap) => {
      byChunk.set(i, snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      emit();
    }, (err) => { console.error('subscribeFeed', err); byChunk.set(i, []); emit(); }));
  return () => unsubs.forEach((u) => u());
}
