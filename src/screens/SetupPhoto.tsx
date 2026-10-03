import { useRef, useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import { IMAGE_TYPES, MAX_IMAGE_MB } from '../lib/validators';
import { S } from './authStyles';
import AvatarEditor from '../components/AvatarEditor';

// Paso único, justo después de crear la cuenta: elegir una foto de perfil (o saltarlo por ahora).
// La foto se puede cambiar en cualquier momento desde «Mi cuenta».

const GRADIENTS = [
  'linear-gradient(135deg,var(--pink),var(--purple))',
  'linear-gradient(135deg,var(--blue),var(--purple))',
  'linear-gradient(135deg,var(--yellow),var(--pink))',
  'linear-gradient(135deg,var(--gold),var(--purple))',
];

export default function SetupPhoto({ go }: { go: (view: string) => void }) {
  const user = auth?.currentUser ?? null;
  const uid = user?.uid ?? '';
  const initial = (user?.displayName || user?.email || '?').trim().slice(0, 1).toUpperCase();
  const grad = GRADIENTS[[...uid].reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length];
  const [preview, setPreview] = useState<string | null>(user?.photoURL ?? null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const done = () => go('dashboard');

  const onPick = (files: FileList | null) => {
    const f = files?.[0];
    if (fileInput.current) fileInput.current.value = '';
    if (!f) return;
    setErr('');
    if (!IMAGE_TYPES.includes(f.type)) return setErr('Formato no permitido (usa JPG, PNG, WEBP o GIF).');
    if (f.size > MAX_IMAGE_MB * 1048576) return setErr(`La foto puede pesar máx. ${MAX_IMAGE_MB} MB.`);
    setEditingFile(f);
  };

  const onEdited = (blob: Blob) => {
    setEditingFile(null);
    if (!user) return;
    const f = new File([blob], 'avatar.png', { type: 'image/png' });
    setBusy(true);
    setPct(0);
    const path = `users/${uid}/avatar/${Date.now()}-avatar.png`;
    const task = uploadBytesResumable(ref(storage, path), f, { contentType: f.type });
    task.on('state_changed',
      (s) => setPct((s.bytesTransferred / s.totalBytes) * 100),
      () => { setBusy(false); setPct(null); setErr('No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo.'); },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          await updateDoc(doc(db, 'users', uid), { photoURL: url, photoPath: path, updatedAt: serverTimestamp() });
          await updateProfile(user, { photoURL: url });
          setPreview(url);
        } catch { setErr('La foto se subió pero no se pudo guardar. Puedes intentarlo de nuevo desde «Mi cuenta».'); }
        setBusy(false);
        setPct(null);
      });
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.h1}>Elige tu foto de perfil</h1>
        <p style={S.sub}>Así te reconocerán en la comunidad. Puedes cambiarla cuando quieras desde «Mi cuenta».</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            {preview ? (
              <img src={preview} alt="Vista previa" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(202,210,242,.34)' }} />
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800, color: '#fff' }}>
                {initial}
              </div>
            )}
            {pct != null && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,.45)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontFamily: "'Geist Mono',monospace" }}>
                {Math.round(pct)}%
              </div>
            )}
          </div>
          {err && <div style={S.err}>{err}</div>}
          <input ref={fileInput} type="file" accept={IMAGE_TYPES.join(',')} style={{ display: 'none' }} onChange={(e) => onPick(e.target.files)} />
          <button type="button" disabled={busy} onClick={() => fileInput.current?.click()} style={{ ...S.primary, opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Subiendo…' : preview ? 'Cambiar foto' : 'Subir una foto'}
          </button>
          <button type="button" onClick={done} style={{ ...S.secondary, marginTop: 2 }}>{preview ? 'Continuar' : 'Saltar por ahora'}</button>
        </div>
      </div>
      {editingFile && <AvatarEditor file={editingFile} onCancel={() => setEditingFile(null)} onSave={onEdited} />}
    </div>
  );
}
