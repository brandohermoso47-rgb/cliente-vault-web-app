// Anuncios reales: solo el personal docente (instructor/estudio/admin) publica, con imagen opcional.
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from './firebase';
import { IMAGE_TYPES, MAX_IMAGE_MB } from './validators';

const safe = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);

export function checkAnnouncementImage(f: File): true | string {
  if (!IMAGE_TYPES.includes(f.type)) return `«${f.name}»: usa una imagen JPG, PNG, WEBP o GIF.`;
  if (f.size > MAX_IMAGE_MB * 1048576) return `«${f.name}»: la imagen puede pesar máx. ${MAX_IMAGE_MB} MB.`;
  return true;
}

export async function publishAnnouncement(opts: {
  uid: string; author: string; role: string; cat: string; title: string; body: string;
  file?: File | null; onProgress?: (pct: number) => void;
}) {
  const title = opts.title.trim().slice(0, 120);
  const body = opts.body.trim().slice(0, 600);
  if (!title || !body) throw new Error('Escribe un título y una descripción.');
  let imageUrl: string | null = null;
  if (opts.file) {
    const ok = checkAnnouncementImage(opts.file);
    if (ok !== true) throw new Error(ok);
    const path = `users/${opts.uid}/announcements/${Date.now()}-${safe(opts.file.name)}`;
    const task = uploadBytesResumable(ref(storage, path), opts.file, { contentType: opts.file.type });
    imageUrl = await new Promise<string>((resolve, reject) => {
      task.on('state_changed', (s) => opts.onProgress?.((s.bytesTransferred / s.totalBytes) * 100), reject,
        () => getDownloadURL(task.snapshot.ref).then(resolve, reject));
    });
  }
  await addDoc(collection(db, 'announcements'), {
    ownerId: opts.uid, author: opts.author, role: opts.role, cat: opts.cat, title, body,
    imageUrl, createdAt: serverTimestamp(),
  });
}

export function subscribeAnnouncements(cb: (rows: any[]) => void) {
  const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => cb([]));
}
