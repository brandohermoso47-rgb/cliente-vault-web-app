import { useMemo, useState, type FormEvent } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, firebaseConfigured } from '../lib/firebase';
import { pending } from '../lib/session';
import { emailOk, handleOk, passwordOk, PASSWORD_HELP } from '../lib/validators';
import { authMessage } from '../lib/authErrors';
import { S, GoogleIcon } from './authStyles';
import RegisterTabs from './RegisterTabs';
import { countryList, countryName, guessCountryCode } from '../lib/countries';

// Registro abierto: cualquier persona crea su cuenta de usuario. El rol inicial siempre es "usuario".
export default function Register({ go }: { go: (view: string) => void }) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [country, setCountry] = useState(guessCountryCode());
  const countries = useMemo(() => countryList('es'), []);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [terms, setTerms] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (name.trim().length < 2) return setErr('Escribe tu nombre completo.');
    if (!handleOk(handle)) return setErr('El usuario debe tener 3–20 caracteres: letras minúsculas, números, punto o guion bajo.');
    if (!country) return setErr('Selecciona tu país.');
    if (!emailOk(email)) return setErr('Introduce un correo válido.');
    if (!passwordOk(pass)) return setErr(PASSWORD_HELP);
    if (pass !== pass2) return setErr('Las contraseñas no coinciden.');
    if (!terms) return setErr('Debes aceptar la política de privacidad.');
    if (!firebaseConfigured) return setErr('Firebase no está configurado (falta .env.local).');
    setBusy(true);
    pending.profile = { displayName: name.trim(), handle: handle.trim().toLowerCase(), countryCode: country, country: countryName(country), accountType: 'usuario' };
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(cred.user, { displayName: name.trim() });
      // App.tsx detecta la sesión nueva, crea users/{uid} con role "usuario" y entra al dashboard.
    } catch (ex) {
      pending.profile = null;
      setErr(authMessage(ex));
      setBusy(false);
    }
  };

  const google = async () => {
    setErr('');
    if (!firebaseConfigured) return setErr('Firebase no está configurado (falta .env.local).');
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (ex: any) { if (ex?.code !== 'auth/popup-closed-by-user' && ex?.code !== 'auth/cancelled-popup-request') setErr(authMessage(ex)); }
  };

  return (
    <div style={S.page}>
      <form style={S.card} onSubmit={submit} noValidate>
        <img src="/uploads/waack_on_gold_3d_depth.png" alt="Waack On" style={S.logo} />
        <h1 style={S.h1}>Crea tu cuenta</h1>
        <p style={S.sub}>Únete gratis a Waack On. Tendrás tu perfil y tu propio almacenamiento para fotos y videos.</p>

        <RegisterTabs active="register" go={go} />

        <label style={S.label}>Nombre completo</label>
        <input style={S.input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Sara Molina" />

        <div style={S.row}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={S.label}>Usuario</label>
            <input style={S.input} value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase())} autoComplete="username" placeholder="sara.waack" />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={S.label}>País</label>
            <select style={S.select} value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country">
              <option value="">Selecciona…</option>
              {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <label style={S.label}>Correo</label>
        <input style={S.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@correo.com" />

        <label style={S.label}>Contraseña</label>
        <input style={S.input} type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="new-password" placeholder="••••••••••" />
        <div style={S.hint}>{PASSWORD_HELP}</div>

        <label style={S.label}>Repite la contraseña</label>
        <input style={S.input} type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} autoComplete="new-password" placeholder="••••••••••" />

        <label style={S.check}>
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ marginTop: 3, accentColor: '#FF2E86' }} />
          <span>He leído y acepto la <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={S.link}>Política de privacidad</a> de Waack On.</span>
        </label>

        {err && <div style={S.err}>{err}</div>}

        <button type="submit" disabled={busy} style={{ ...S.primary, opacity: busy ? 0.6 : 1 }}>{busy ? 'Creando cuenta…' : 'Crear cuenta'}</button>
        <div style={{ height: 12 }} />
        <div style={S.secondary} onClick={google} role="button">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#fff" d={GoogleIcon} /></svg>
          <span>Registrarme con Google</span>
        </div>

        <div style={S.foot}>¿Ya tienes cuenta? <span style={S.link} onClick={() => go('login')}>Inicia sesión</span></div>
      </form>
    </div>
  );
}
