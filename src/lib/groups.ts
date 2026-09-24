// Grupos con chat en vivo. El id del documento es el código de invitación (10 caracteres al azar):
// quien lo conoce puede unirse; solo los miembros ven el grupo y su chat. Un grupo tipo "clase" solo
// lo crea personal docente y solo su dueño publica el "resumen de la clase".
import {
  addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp,
  setDoc, updateDoc, where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from './firebase';
import { IMAGE_TYPES, MAX_IMAGE_MB, MAX_VIDEO_MB, VIDEO_TYPES } from './validators';

export type Group = { id: string; name: string; description: string; kind: 'grupo' | 'clase'; ownerId: string; memberIds: string[]; createdAt?: any };
export type GroupMessage = { id: string; uid: string; name: string; text: string; kind: 'msg' | 'resumen'; mediaUrl: string | null; mediaType: 'image' | 'video' | null; createdAt?: any };

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
export const newGroupCode = () => Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => ALPHABET[b % ALPHABET.length]).join('');
export const cleanGroupCode = (v: string) => v.trim().toLowerCase().replace(/^.*[?&]grupo=/, '').replace(/[^a-z0-9]/g, '').slice(0, 10);

const safe = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);

export async function createGroup(opts: { uid: string; name: string; description: string; kind: 'grupo' | 'clase' }) {
  const name = opts.name.trim().slice(0, 60);
  if (!name) throw new Error('Ponle un nombre al grupo.');
  const id = newGroupCode();
  await setDoc(doc(db, 'groups', id), {
    name, description: opts.description.trim().slice(0, 280), kind: opts.kind, ownerId: opts.uid, memberIds: [opts.uid], createdAt: serverTimestamp(),
  });
  return id;
}

export function watchMyGroups(uid: string, cb: (rows: Group[]) => void) {
  return onSnapshot(query(collection(db, 'groups'), where('memberIds', 'array-contains', uid)), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Group[];
    rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    cb(rows);
  }, (err) => { console.error('watchMyGroups', err); cb([]); });
}

export const joinGroup = (code: string, uid: string) => updateDoc(doc(db, 'groups', code), { memberIds: arrayUnion(uid) });
export const leaveGroup = (id: string, uid: string) => updateDoc(doc(db, 'groups', id), { memberIds: arrayRemove(uid) });
export const deleteGroup = (id: string) => deleteDoc(doc(db, 'groups', id));

export function watchMessages(groupId: string, cb: (rows: GroupMessage[]) => void) {
  return onSnapshot(query(collection(db, 'groups', groupId, 'messages'), orderBy('createdAt', 'desc'), limit(100)), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as GroupMessage[]);
  }, (err) => { console.error('watchMessages', err); cb([]); });
}

export function checkGroupFile(f: File): 'image' | 'video' | string {
  if (IMAGE_TYPES.includes(f.type)) return f.size > MAX_IMAGE_MB * 1048576 ? `«${f.name}»: las fotos pueden pesar máx. ${MAX_IMAGE_MB} MB.` : 'image';
  if (VIDEO_TYPES.includes(f.type)) return f.size > MAX_VIDEO_MB * 1048576 ? `«${f.name}»: los videos pueden pesar máx. ${MAX_VIDEO_MB} MB.` : 'video';
  return `«${f.name}»: formato no permitido (fotos JPG/PNG/WEBP/GIF o videos MP4/WEBM/MOV).`;
}

export async function sendMessage(opts: {
  groupId: string; uid: string; name: string; text: string; kind?: 'msg' | 'resumen'; file?: File | null; onProgress?: (pct: number) => void;
}) {
  const text = opts.text.trim().slice(0, 2000);
  if (!text && !opts.file) throw new Error('Escribe un mensaje o adjunta una foto o un video.');
  let mediaUrl: string | null = null;
  let mediaType: 'image' | 'video' | null = null;
  if (opts.file) {
    const kind = checkGroupFile(opts.file);
    if (kind !== 'image' && kind !== 'video') throw new Error(kind);
    mediaType = kind;
    const task = uploadBytesResumable(ref(storage, `users/${opts.uid}/groups/${opts.groupId}/${Date.now()}-${safe(opts.file.name)}`), opts.file, { contentType: opts.file.type });
    mediaUrl = await new Promise<string>((resolve, reject) => {
      task.on('state_changed', (s) => opts.onProgress?.((s.bytesTransferred / s.totalBytes) * 100), reject,
        () => getDownloadURL(task.snapshot.ref).then(resolve, reject));
    });
  }
  await addDoc(collection(db, 'groups', opts.groupId, 'messages'), {
    uid: opts.uid, name: opts.name, text, kind: opts.kind ?? 'msg', mediaUrl, mediaType, createdAt: serverTimestamp(),
  });
}

export const deleteMessage = (groupId: string, id: string) => deleteDoc(doc(db, 'groups', groupId, 'messages', id));
