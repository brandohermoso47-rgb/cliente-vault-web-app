// Publicar un reel real: sube el video a Storage y crea el documento en Firestore (`reels`),
// que cualquier persona con sesión puede publicar (no solo instructores) — es el feed de la comunidad.
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from './firebase';
import { MAX_VIDEO_MB, VIDEO_TYPES } from './validators';

const safe = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);
const GRAD_PAIRS: [string, string][] = [['--pink', '--purple'], ['--blue', '--purple'], ['--yellow', '--pink'], ['--purple', '--blue']];

export function checkReelFile(f: File): true | string {
  if (!VIDEO_TYPES.includes(f.type)) return `«${f.name}»: sube un video (MP4, WEBM o MOV).`;
  if (f.size > MAX_VIDEO_MB * 1048576) return `«${f.name}»: el video puede pesar máx. ${MAX_VIDEO_MB} MB.`;
  return true;
}

export async function publishReel(opts: {
  uid: string; ownerHandle: string; caption: string; music: string; file: File; onProgress?: (pct: number) => void;
}) {
  const ok = checkReelFile(opts.file);
  if (ok !== true) throw new Error(ok);
  const caption = opts.caption.trim().slice(0, 300);
  const path = `users/${opts.uid}/reels/${Date.now()}-${safe(opts.file.name)}`;
  const task = uploadBytesResumable(ref(storage, path), opts.file, { contentType: opts.file.type });
  const mediaUrl = await new Promise<string>((resolve, reject) => {
    task.on('state_changed', (s) => opts.onProgress?.((s.bytesTransferred / s.totalBytes) * 100), reject,
      () => getDownloadURL(task.snapshot.ref).then(resolve, reject));
  });
  const [c1, c2] = GRAD_PAIRS[Math.floor(Math.random() * GRAD_PAIRS.length)];
  await addDoc(collection(db, 'reels'), {
    ownerId: opts.uid, user: opts.ownerHandle, caption, music: opts.music.trim().slice(0, 120) || 'Sonido original',
    mediaUrl, mediaType: 'video', c1, c2, createdAt: serverTimestamp(),
  });
}
