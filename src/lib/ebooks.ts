// Manuales reales: solo el personal docente (instructor/estudio/admin) sube el PDF,
// con portada opcional. Cualquiera con sesión los lee en la pantalla de Manuales.
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from './firebase';
import { IMAGE_TYPES, MAX_IMAGE_MB, MAX_PDF_MB, PDF_TYPES } from './validators';

const safe = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);

export function checkEbookCover(f: File): true | string {
  if (!IMAGE_TYPES.includes(f.type)) return `«${f.name}»: usa una imagen JPG, PNG, WEBP o GIF.`;
  if (f.size > MAX_IMAGE_MB * 1048576) return `«${f.name}»: la portada puede pesar máx. ${MAX_IMAGE_MB} MB.`;
  return true;
}

export function checkEbookPdf(f: File): true | string {
  if (!PDF_TYPES.includes(f.type)) return `«${f.name}»: sube un archivo PDF.`;
  if (f.size > MAX_PDF_MB * 1048576) return `«${f.name}»: el PDF puede pesar máx. ${MAX_PDF_MB} MB.`;
  return true;
}

async function uploadTo(uid: string, folder: string, file: File, onProgress?: (pct: number) => void) {
  const path = `users/${uid}/${folder}/${Date.now()}-${safe(file.name)}`;
  const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
  return new Promise<string>((resolve, reject) => {
    task.on('state_changed', (s) => onProgress?.((s.bytesTransferred / s.totalBytes) * 100), reject,
      () => getDownloadURL(task.snapshot.ref).then(resolve, reject));
  });
}

export async function publishEbook(opts: {
  uid: string; author: string; kind: 'Manual' | 'Guía'; title: string; meta: string;
  pdfFile: File; coverFile?: File | null; onProgress?: (pct: number) => void;
}) {
  const title = opts.title.trim().slice(0, 120);
  const meta = opts.meta.trim().slice(0, 80);
  if (!title) throw new Error('Escribe un título.');
  const okPdf = checkEbookPdf(opts.pdfFile);
  if (okPdf !== true) throw new Error(okPdf);
  let coverUrl: string | null = null;
  if (opts.coverFile) {
    const okCover = checkEbookCover(opts.coverFile);
    if (okCover !== true) throw new Error(okCover);
    coverUrl = await uploadTo(opts.uid, 'ebooks/covers', opts.coverFile, opts.onProgress);
  }
  const pdfUrl = await uploadTo(opts.uid, 'ebooks', opts.pdfFile, opts.onProgress);
  await addDoc(collection(db, 'ebooks'), {
    ownerId: opts.uid, author: opts.author, kind: opts.kind, title, meta: meta || 'PDF', coverUrl, pdfUrl,
    createdAt: serverTimestamp(),
  });
}

export function subscribeEbooks(cb: (rows: any[]) => void) {
  const q = query(collection(db, 'ebooks'), orderBy('createdAt', 'desc'), limit(60));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => cb([]));
}
