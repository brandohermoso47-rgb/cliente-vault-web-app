import { useMemo, useState, type FormEvent } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from '../lib/firebase';
import { pending } from '../lib/session';
import { emailOk, passwordOk, PASSWORD_HELP } from '../lib/validators';
import { authMessage } from '../lib/authErrors';
import { S } from './authStyles';
import RegisterTabs from './RegisterTabs';
import { countryList, countryName, guessCountryCode } from '../lib/countries';

type Kind = 'instructor' | 'estudio';

// Registro aparte para instructores y estudios. La cuenta nace como "usuario" y se crea una solicitud
// (applications/{uid}, estado "pendiente"). Un administrador la aprueba y cambia el rol; nadie se
// auto-asigna el rol de instructor o estudio.
export default function RegisterPro({ kind, go }: { kind: Kind; go: (view: string) => void }) {
  const signedIn = !!auth?.currentUser; // quien ya tiene cuenta solo envía la solicitud
  const [orgName, setOrgName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [country, setCountry] = useState(guessCountryCode());
  const countries = useMemo(() => countryList('es'), []);
  const [city, setCity] = useState('');
  const [styles, setStyles] = useState('');
  const [web, setWeb] = useState('');
  const [about, setAbout] = useState('');
  const [terms, setTerms] = useState(false);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const isStudio = kind === 'estudio';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (orgName.trim().length < 2) return setErr(isStudio ? 'Escribe el nombre del estudio o academia.' : 'Escribe tu nombre artístico.');
    if (isStudio && contact.trim().length < 2) return setErr('Escribe el nombre de la persona de contacto.');
    if (!signedIn) {
      if (!emailOk(email)) return setErr('Introduce un correo válido.');
      if (!passwordOk(pass)) return setErr(PASSWORD_HELP);
      if (pass !== pass2) return setErr('Las contraseñas no coinciden.');
    }
    if (!country || !city.trim()) return setErr('Indica tu país y ciudad.');
    if (styles.trim().length < 2) return setErr('Indica tus especialidades o estilos.');
    if (about.trim().length < 20) return setErr('Cuéntanos un poco más sobre ti o tu estudio (mínimo 20 caracteres).');
    if (!terms) return setErr('Debes aceptar la política de privacidad.');
    if (!firebaseConfigured) return setErr('Firebase no está configurado (falta .env.local).');

    const application = {
      kind,
      orgName: orgName.trim(),
      contactName: (isStudio ? contact : orgName).trim(),
      countryCode: country,
      country: countryName(country),
      city: city.trim(),
      styles: styles.trim(),
      web: web.trim(),
      about: about.trim(),
    };
    setBusy(true);
    try {
      if (signedIn) {
        const u = auth.currentUser!;
        await setDoc(doc(db, 'applications', u.uid), { ...application, uid: u.uid, email: u.email, status: 'pendiente', createdAt: serverTimestamp() });
        setSent(true);
      } else {
        pending.profile = { displayName: application.contactName, countryCode: application.countryCode, country: application.country, accountType: 'usuario' };
        pending.application = application;
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
        await updateProfile(cred.user, { displayName: application.contactName });
        // App.tsx crea users/{uid} + applications/{uid} y entra a la app.
      }
    } catch (ex) {
      pending.profile = null;
      pending.application = null;
      setErr(authMessage(ex));
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <h1 style={S.h1}>Solicitud enviada</h1>
          <p style={S.sub}>Un administrador de Waack On revisará tu solicitud. Mientras tanto ya puedes usar tu cuenta como usuario. Te avisaremos cuando esté aprobada.</p>
          <button style={S.primary} onClick={() => go('cuenta')}>Volver a mi cuenta</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <form style={S.card} onSubmit={submit} noValidate>
        <img src="/uploads/waack_on_gold_3d_depth.png" alt="Waack On" style={S.logo} />
        <h1 style={S.h1}>{isStudio ? 'Registro de estudio o academia' : 'Registro de instructor/a'}</h1>
        <p style={S.sub}>{isStudio ? 'Presenta tu estudio o academia y publica sus clases, cursos y lives en Waack On.' : 'Publica tus clases, cursos y lives en Waack On.'} Revisamos cada solicitud antes de activar el perfil profesional.</p>

        <RegisterTabs active={isStudio ? 'registerStudio' : 'registerInstructor'} go={go} signedIn={signedIn} />

        <label style={S.label}>{isStudio ? 'Nombre del estudio o academia' : 'Nombre artístico'}</label>
        <input style={S.input} value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder={isStudio ? 'Waack Academy Madrid' : 'Lorena "WaackQueen"'} />

        {isStudio && (
          <>
            <label style={S.label}>Persona de contacto</label>
            <input style={S.input} value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="name" placeholder="Nombre y apellido" />
          </>
        )}

        {!signedIn && (
          <>
            <label style={S.label}>Correo</label>
            <input style={S.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="contacto@estudio.com" />
            <label style={S.label}>Contraseña</label>
            <input style={S.input} type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="new-password" placeholder="••••••••••" />
            <div style={S.hint}>{PASSWORD_HELP}</div>
            <label style={S.label}>Repite la contraseña</label>
            <input style={S.input} type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} autoComplete="new-password" placeholder="••••••••••" />
          </>
        )}
        {signedIn && <div style={S.hint}>Enviarás la solicitud con tu cuenta actual ({auth.currentUser?.email}).</div>}

        <div style={S.row}>
          <div style={{ flex: '1 1 160px' }}>
            <label style={S.label}>País</label>
            <select style={S.select} value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country">
              <option value="">Selecciona…</option>
              {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={S.label}>Ciudad</label>
            <input style={S.input} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Madrid" />
          </div>
        </div>

        <label style={S.label}>Especialidades / estilos</label>
        <input style={S.input} value={styles} onChange={(e) => setStyles(e.target.value)} placeholder="Waacking, Punking, Speed-Waack…" />

        <label style={S.label}>Web o Instagram (opcional)</label>
        <input style={S.input} value={web} onChange={(e) => setWeb(e.target.value)} placeholder="https://instagram.com/tuestudio" />

        <label style={S.label}>{isStudio ? 'Sobre el estudio o academia' : 'Sobre ti'}</label>
        <textarea style={{ ...S.input, minHeight: 96, resize: 'vertical' }} value={about} onChange={(e) => setAbout(e.target.value)} maxLength={600} placeholder="Trayectoria, tipo de clases, nivel, experiencia…" />

        <label style={S.check}>
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ marginTop: 3, accentColor: '#FF2E86' }} />
          <span>He leído y acepto la <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={S.link}>Política de privacidad</a> y confirmo que los datos son verdaderos.</span>
        </label>

        {err && <div style={S.err}>{err}</div>}
        <button type="submit" disabled={busy} style={{ ...S.primary, opacity: busy ? 0.6 : 1 }}>{busy ? 'Enviando…' : signedIn ? 'Enviar solicitud' : 'Crear cuenta y enviar solicitud'}</button>

        <div style={S.foot}>
          {signedIn ? <span style={S.link} onClick={() => go('cuenta')}>Volver a mi cuenta</span> : <>¿Solo quieres entrenar? <span style={S.link} onClick={() => go('register')}>Registro de usuario</span> · <span style={S.link} onClick={() => go('login')}>Iniciar sesión</span></>}
        </div>
      </form>
    </div>
  );
}
