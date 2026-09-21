import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { sendEmailVerification, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import { countryList, countryName } from '../lib/countries';
import { api, ApiError } from '../lib/api';
import { openBillingPortal, startConnectOnboarding } from '../lib/payments';
import { IMAGE_TYPES, VIDEO_TYPES, MAX_IMAGE_MB, MAX_VIDEO_MB, MAX_TOTAL_MB } from '../lib/validators';

const card: CSSProperties = { border: '1px solid var(--hair)', background: 'var(--glass)', backdropFilter: 'var(--lg-blur)', WebkitBackdropFilter: 'var(--lg-blur)', boxShadow: 'var(--lg-edge), var(--lg-lift)', borderRadius: 22, padding: 24 };
const label: CSSProperties = { display: 'block', fontFamily: "'Geist Mono',monospace", fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink-2)', margin: '0 0 6px 2px' };
const input: CSSProperties = { display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px 15px', marginBottom: 14, borderRadius: 14, border: '1px solid var(--hair)', background: 'var(--glass-2)', color: 'var(--ink)', fontFamily: 'Geist,sans-serif', fontSize: 14, outline: 'none' };
const btn: CSSProperties = { padding: '11px 20px', borderRadius: 999, border: 0, fontFamily: 'Geist,sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg,#FF7A2F,#FF2E86)', cursor: 'pointer', boxShadow: '0 10px 26px -10px rgba(255,60,130,.6)' };
const ghost: CSSProperties = { padding: '10px 18px', borderRadius: 999, border: '1px solid var(--hair)', background: 'var(--glass-2)', color: 'var(--ink)', fontFamily: 'Geist,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const h2: CSSProperties = { margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: 'var(--ink)' };
const note: CSSProperties = { margin: '0 0 16px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--ink-2)' };

const ROLE: Record<string, string> = { usuario: 'Usuario', instructor: 'Instructor', estudio: 'Estudio', admin: 'Administrador' };
const SUB_STATUS: Record<string, string> = { active: 'Activa', trialing: 'En prueba', past_due: 'Pago pendiente', canceled: 'Cancelada', unpaid: 'Impagada', incomplete: 'Incompleta', incomplete_expired: 'Caducada', paused: 'En pausa' };
const PLAN_NAME: Record<string, string> = { catedra: 'Una cátedra', escuela: 'Escuela completa' };
const STATUS: Record<string, string> = { pendiente: 'En revisión', aprobada: 'Aprobada', rechazada: 'Rechazada' };
const mb = (b: number) => (b / 1048576).toFixed(b > 10485760 ? 0 : 1) + ' MB';
const safe = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);

type Media = { id: string; path: string; url: string; type: 'image' | 'video'; name: string; size: number };

export default function Account({ go }: { go: (view: string) => void }) {
  const user = auth?.currentUser ?? null;
  const uid = user?.uid ?? '';
  const [profile, setProfile] = useState<any>(null);
  const [me, setMe] = useState<any>(null); // rol, solicitud, suscripciones y cobros (API / PostgreSQL)
  const [media, setMedia] = useState<Media[]>([]);
  const [form, setForm] = useState({ displayName: '', handle: '', country: '', countryCode: '', bio: '' });
  const countries = useMemo(() => countryList('es'), []);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploads, setUploads] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const mediaInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!uid) return;
    const offs = [
      onSnapshot(doc(db, 'users', uid), (s) => {
        const d: any = s.data() ?? {};
        setProfile(d);
        setForm((f) => (f.displayName || f.handle || f.country || f.bio ? f : { displayName: d.displayName ?? user?.displayName ?? '', handle: d.handle ?? '', country: d.country ?? '', countryCode: d.countryCode ?? '', bio: d.bio ?? '' }));
      }, () => {}),
      onSnapshot(query(collection(db, 'users', uid, 'media'), orderBy('createdAt', 'desc')), (s) => setMedia(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))), () => {}),
    ];
    return () => offs.forEach((o) => o());
  }, [uid]);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const c = q.get('checkout'), k = q.get('connect');
    if (!c && !k) return;
    if (c === 'success') setMsg({ ok: true, text: '¡Pago recibido! Tu suscripción se activará en unos segundos.' });
    else if (c === 'cancel') setMsg({ ok: false, text: 'Cancelaste el pago. No se ha cobrado nada.' });
    else if (k === 'done') setMsg({ ok: true, text: 'Datos de cobro enviados. Stripe los verificará y te avisaremos aquí.' });
    else if (k === 'refresh') setMsg({ ok: false, text: 'El enlace de configuración caducó. Pulsa «Configurar cobros» para continuar.' });
    history.replaceState(null, '', location.pathname);
  }, []);

  const loadMe = useCallback(() => { api('GET', '/me').then(setMe).catch(() => {}); }, []);
  useEffect(() => {
    if (!uid) return;
    loadMe();
    if (!/[?&](checkout|connect)=/.test(location.search)) return;
    const ts = [3000, 8000, 15000].map((ms) => setTimeout(loadMe, ms));
    return () => ts.forEach(clearTimeout);
  }, [uid, loadMe]);

  const subs: any[] = me?.subscriptions ?? [];
  const payout = me?.payout ?? null;
  const application = me?.application ?? null;

  const used = useMemo(() => media.reduce((n, m) => n + (m.size || 0), 0), [media]);
  const pct = Math.min(100, (used / (MAX_TOTAL_MB * 1048576)) * 100);
  const role = me?.user?.role ?? profile?.role ?? 'usuario';
  const photo = profile?.photoURL || user?.photoURL || '';
  const initials = (form.displayName || user?.email || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  if (!user) return <div style={{ ...card, color: 'var(--ink)' }}>Inicia sesión para ver tu cuenta.</div>;

  const say = (ok: boolean, text: string) => setMsg({ ok, text });

  const saveProfile = async () => {
    setBusy(true); setMsg(null);
    const handle = form.handle.trim().toLowerCase();
    if (handle && !/^[a-z0-9_.]{3,20}$/.test(handle)) { setBusy(false); return say(false, 'El usuario debe tener 3–20 caracteres: minúsculas, números, punto o guion bajo.'); }
    try {
      const patch: Record<string, unknown> = { displayName: form.displayName.trim(), bio: form.bio.trim().slice(0, 280) };
      if (handle) patch.handle = handle;
      if (form.countryCode) patch.countryCode = form.countryCode;
      try { await api('PATCH', '/me', patch); loadMe(); }
      catch (e) {
        if (e instanceof ApiError && (e.code === 'handle_taken' || e.status === 400)) { setBusy(false); return say(false, e.message); }
        /* API no disponible: se guarda solo en Firestore */
      }
      await updateDoc(doc(db, 'users', uid), { displayName: form.displayName.trim(), handle, countryCode: form.countryCode, country: form.countryCode ? countryName(form.countryCode) : form.country.trim(), bio: form.bio.trim().slice(0, 280), updatedAt: serverTimestamp() });
      await updateProfile(user, { displayName: form.displayName.trim() });
      say(true, 'Perfil guardado.');
    } catch { say(false, 'No se pudo guardar el perfil. Inténtalo de nuevo.'); }
    setBusy(false);
  };

  const checkFile = (f: File, onlyImage = false): 'image' | 'video' | string => {
    if (IMAGE_TYPES.includes(f.type)) return f.size > MAX_IMAGE_MB * 1048576 ? `«${f.name}»: las fotos pueden pesar máx. ${MAX_IMAGE_MB} MB.` : 'image';
    if (!onlyImage && VIDEO_TYPES.includes(f.type)) return f.size > MAX_VIDEO_MB * 1048576 ? `«${f.name}»: los videos pueden pesar máx. ${MAX_VIDEO_MB} MB.` : 'video';
    return `«${f.name}»: formato no permitido (${onlyImage ? 'JPG, PNG, WEBP o GIF' : 'fotos JPG/PNG/WEBP/GIF o videos MP4/WEBM/MOV'}).`;
  };

  const upload = (f: File, folder: string, done: (path: string, url: string) => Promise<void>) => {
    const path = `users/${uid}/${folder}/${Date.now()}-${safe(f.name)}`;
    const task = uploadBytesResumable(ref(storage, path), f, { contentType: f.type });
    setUploads((u) => ({ ...u, [path]: 0 }));
    task.on('state_changed',
      (s) => setUploads((u) => ({ ...u, [path]: (s.bytesTransferred / s.totalBytes) * 100 })),
      () => { setUploads((u) => { const { [path]: _, ...r } = u; return r; }); say(false, `No se pudo subir «${f.name}». Revisa tu conexión e inténtalo de nuevo.`); },
      async () => {
        try { await done(path, await getDownloadURL(task.snapshot.ref)); }
        catch { say(false, `«${f.name}» se subió pero no se pudo registrar.`); }
        setUploads((u) => { const { [path]: _, ...r } = u; return r; });
      });
  };

  const onMedia = (files: FileList | null) => {
    if (!files) return;
    setMsg(null);
    let extra = 0;
    for (const f of Array.from(files)) {
      const kind = checkFile(f);
      if (kind !== 'image' && kind !== 'video') { say(false, kind); continue; }
      if (used + extra + f.size > MAX_TOTAL_MB * 1048576) { say(false, `Superarías tu almacenamiento (${MAX_TOTAL_MB / 1024} GB). Borra archivos para liberar espacio.`); break; }
      extra += f.size;
      upload(f, 'media', async (path, url) => {
        await addDoc(collection(db, 'users', uid, 'media'), { path, url, type: kind, name: f.name, size: f.size, createdAt: serverTimestamp() });
      });
    }
    if (mediaInput.current) mediaInput.current.value = '';
  };

  const onAvatar = (files: FileList | null) => {
    const f = files?.[0];
    if (avatarInput.current) avatarInput.current.value = '';
    if (!f) return;
    const kind = checkFile(f, true);
    if (kind !== 'image') return say(false, kind);
    setMsg(null);
    const old = profile?.photoPath as string | undefined;
    upload(f, 'avatar', async (path, url) => {
      await updateDoc(doc(db, 'users', uid), { photoURL: url, photoPath: path, updatedAt: serverTimestamp() });
      await updateProfile(user, { photoURL: url });
      if (old) deleteObject(ref(storage, old)).catch(() => {});
      say(true, 'Foto de perfil actualizada.');
    });
  };

  const remove = async (m: Media) => {
    if (!confirm(`¿Borrar «${m.name}»? No se puede deshacer.`)) return;
    try { await deleteObject(ref(storage, m.path)); } catch { /* si ya no existe en Storage, igual limpiamos el registro */ }
    try { await deleteDoc(doc(db, 'users', uid, 'media', m.id)); } catch { say(false, 'No se pudo borrar el archivo.'); }
  };

  const resetPassword = async () => {
    if (!user.email) return;
    try { await sendPasswordResetEmail(auth, user.email); say(true, `Te enviamos un enlace para cambiar la contraseña a ${user.email}.`); }
    catch { say(false, 'No se pudo enviar el correo. Inténtalo más tarde.'); }
  };

  const canGetPaid = ['instructor', 'estudio', 'admin'].includes(role);
  const payErr = (e: unknown) => say(false, e instanceof Error ? e.message : 'No se pudo completar la operación.');
  const fmtDate = (v: any) => { const d = v ? new Date(v) : null; return d ? d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' }) : ''; };

  const [, bump] = useState(0);
  const resendVerification = async () => {
    try { await sendEmailVerification(user); say(true, `Te enviamos un correo de verificación a ${user.email}. Revisa también la carpeta de spam.`); }
    catch { say(false, 'No se pudo enviar el correo. Espera un momento e inténtalo de nuevo.'); }
  };
  const checkVerified = async () => {
    await user.reload();
    await user.getIdToken(true); // el servidor lee "correo verificado" del token
    bump((n) => n + 1);
    loadMe();
    say(user.emailVerified, user.emailVerified ? '¡Correo verificado!' : 'Aún no aparece como verificado. Abre el enlace del correo y vuelve a pulsar.');
  };

  const hasPassword = user.providerData.some((p) => p.providerId === 'password');
  const uploading = Object.entries(uploads);

  return (
    <div style={{ display: 'grid', gap: 22, maxWidth: 980, color: 'var(--ink)' }}>
      {/* Cabecera */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg,var(--purple),var(--pink))', border: '2px solid var(--hair)' }}>
            {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <div onClick={() => avatarInput.current?.click()} title="Cambiar foto" style={{ position: 'absolute', right: -4, bottom: -4, width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pink)', color: '#fff', cursor: 'pointer', border: '2px solid var(--ground)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" /><circle cx="12" cy="13" r="4" /></svg>
          </div>
          <input ref={avatarInput} type="file" accept={IMAGE_TYPES.join(',')} hidden onChange={(e) => onAvatar(e.target.files)} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{form.displayName || 'Sin nombre'}</div>
          <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: 'var(--ink-2)', marginTop: 4 }}>{form.handle ? '@' + form.handle : user.email}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#fff', background: role === 'usuario' ? 'var(--purple)' : 'var(--pink)', padding: '4px 10px', borderRadius: 999 }}>{ROLE[role] ?? role}</span>
            {application && <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink)', border: '1px solid var(--hair)', padding: '4px 10px', borderRadius: 999 }}>Solicitud {application.kind}: {STATUS[application.status] ?? application.status}</span>}
          </div>
        </div>
      </div>

      {!user.emailVerified && hasPassword && (
        <div style={{ ...card, padding: '18px 22px', borderColor: 'rgba(245,197,24,.6)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>Verifica tu correo</div>
          <p style={{ ...note, marginBottom: 12 }}>Necesitas confirmar {user.email} para poder pagar suscripciones o solicitar una cuenta de instructor o estudio.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button style={btn} onClick={resendVerification}>Reenviar correo</button>
            <button style={ghost} onClick={checkVerified}>Ya lo verifiqué</button>
          </div>
        </div>
      )}

      {msg && <div style={{ ...card, padding: '14px 18px', fontSize: 13, color: msg.ok ? '#3DBA78' : '#FF7A5C', borderColor: msg.ok ? 'rgba(61,186,120,.5)' : 'rgba(255,122,92,.5)' }}>{msg.text}</div>}

      {/* Datos del perfil */}
      <div style={card}>
        <h2 style={h2}>Datos del perfil</h2>
        <p style={note}>Así te ven los demás bailarines. El correo ({user.email}) no es público.</p>
        <label style={label}>Nombre</label>
        <input style={input} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px' }}><label style={label}>Usuario</label><input style={input} value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase() })} placeholder="sara.waack" /></div>
          <div style={{ flex: '1 1 220px' }}><label style={label}>País</label><select style={{ ...input, colorScheme: 'dark light' }} value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value, country: countryName(e.target.value) })}>
            <option value="">{form.country || 'Selecciona…'}</option>
            {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select></div>
        </div>
        <label style={label}>Bio <span style={{ opacity: 0.6 }}>({form.bio.length}/280)</span></label>
        <textarea style={{ ...input, minHeight: 84, resize: 'vertical' }} maxLength={280} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Cuéntanos qué bailas y qué buscas en Waack On" />
        <button style={{ ...btn, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={saveProfile}>Guardar cambios</button>
      </div>

      {/* Almacenamiento */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={h2}>Mi almacenamiento</h2>
            <p style={{ ...note, marginBottom: 10 }}>Sube tus fotos ({MAX_IMAGE_MB} MB máx.) y videos ({MAX_VIDEO_MB} MB máx.). Solo tú puedes borrarlos.</p>
          </div>
          <button style={btn} onClick={() => mediaInput.current?.click()}>Subir fotos o videos</button>
          <input ref={mediaInput} type="file" multiple accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(',')} hidden onChange={(e) => onMedia(e.target.files)} />
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'var(--hair-soft)', overflow: 'hidden', marginTop: 4 }}>
          <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg,#FF7A2F,#FF2E86)' }} />
        </div>
        <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, color: 'var(--ink-2)', margin: '8px 0 16px' }}>{mb(used)} de {MAX_TOTAL_MB / 1024} GB usados · {media.length} archivo{media.length === 1 ? '' : 's'}</div>

        {uploading.map(([p, v]) => (
          <div key={p} style={{ fontSize: 12, color: 'var(--ink-2)', margin: '0 0 8px' }}>
            Subiendo {p.split('/').pop()?.replace(/^\d+-/, '')} — {Math.round(v)}%
            <div style={{ height: 4, borderRadius: 999, background: 'var(--hair-soft)', marginTop: 4 }}><div style={{ width: v + '%', height: '100%', borderRadius: 999, background: 'var(--pink)' }} /></div>
          </div>
        ))}

        {media.length === 0 && uploading.length === 0 ? (
          <div style={{ padding: '30px 10px', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', border: '1px dashed var(--hair)', borderRadius: 16 }}>Aún no has subido nada.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
            {media.map((m) => (
              <div key={m.id} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--hair)', background: 'var(--glass-2)', aspectRatio: '1 / 1' }}>
                {m.type === 'video'
                  ? <video src={m.url} controls preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} />
                  : <img src={m.url} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                <div onClick={() => remove(m)} title="Borrar" style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.65)', color: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</div>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 8px 6px', fontSize: 10.5, color: '#fff', background: 'linear-gradient(transparent, rgba(0,0,0,.7))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none' }}>{m.name} · {mb(m.size)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cuenta profesional */}
      {role === 'usuario' && (
        <div style={card}>
          <h2 style={h2}>Instructores y estudios</h2>
          {application ? (
            <p style={{ ...note, marginBottom: 0 }}>Tu solicitud de {application.kind} ({application.orgName}) está <b>{(STATUS[application.status] ?? application.status).toLowerCase()}</b>.</p>
          ) : (
            <>
              <p style={note}>¿Das clases o tienes un estudio? Solicita tu perfil profesional para publicar cursos y lives. Un administrador lo revisa.</p>
              <button style={ghost} onClick={() => go('registerInstructor')}>Solicitar cuenta de instructor o estudio/academia</button>
            </>
          )}
        </div>
      )}

      {/* Suscripciones y cobros */}
      <div style={card}>
        <h2 style={h2}>Suscripciones y pagos</h2>
        <p style={note}>Pagas con los medios disponibles en tu país; el cobro lo procesa Stripe. Nosotros no guardamos los datos de tu tarjeta.</p>
        {subs.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>No tienes suscripciones.</span>
            <button style={ghost} onClick={() => go('planes')}>Ver planes</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
              {subs.map((x) => (
                <div key={x.id} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: '12px 14px', borderRadius: 14, border: '1px solid var(--hair)', background: 'var(--glass-2)', fontSize: 13 }}>
                  <b style={{ flex: 1, minWidth: 140 }}>{PLAN_NAME[x.planId] ?? x.planId ?? 'Suscripción'}</b>
                  <span style={{ color: 'var(--ink-2)' }}>{SUB_STATUS[x.status] ?? x.status}</span>
                  {x.currentPeriodEnd && <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>{x.cancelAtPeriodEnd ? 'Termina' : 'Renueva'} el {fmtDate(x.currentPeriodEnd)}</span>}
                </div>
              ))}
            </div>
            <button style={ghost} onClick={() => openBillingPortal().catch(payErr)}>Gestionar suscripciones y facturas</button>
          </>
        )}

        {canGetPaid && (
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--hair-soft)' }}>
            <h2 style={{ ...h2, fontSize: 14.5 }}>Cobros como {role === 'estudio' ? 'estudio o academia' : 'instructor/a'}</h2>
            <p style={note}>{payout?.chargesEnabled ? 'Tu cuenta de cobro está activa: recibirás tu parte de cada suscripción directamente en tu cuenta bancaria, en tu moneda y país.' : payout?.detailsSubmitted ? 'Stripe está verificando tus datos. Te avisaremos cuando puedas cobrar.' : 'Configura tu cuenta de cobro (datos fiscales y bancarios) para recibir el dinero de tus suscriptores. Stripe lo gestiona de forma segura y compatible con tu país.'}</p>
            {!payout?.chargesEnabled && <button style={btn} onClick={() => startConnectOnboarding().catch(payErr)}>{payout ? 'Continuar configuración de cobros' : 'Configurar cobros'}</button>}
          </div>
        )}
      </div>

      {/* Seguridad */}
      <div style={card}>
        <h2 style={h2}>Seguridad</h2>
        <p style={note}>Sesión iniciada como {user.email}.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {hasPassword && <button style={ghost} onClick={resetPassword}>Cambiar contraseña por correo</button>}
          <button style={ghost} onClick={() => signOut(auth)}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}
