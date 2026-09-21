// Genera src/App.tsx a partir de la lógica del prototipo (tools/logic.source.js) + Firebase Auth.
import { readFileSync, writeFileSync } from 'node:fs';
let s = readFileSync(new URL('./logic.source.js', import.meta.url), 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('no encontrado: ' + a.slice(0, 60)); s = s.replace(a, b); };

rep('class Component extends DCLogic {', 'class App extends Component<any, any> {\n  static defaultProps = { paleta: \'Fucsia & naranja\', materia: \'Vidrio platinado\', profundidad: 1.6, menu: \'Expandido\' };');
rep("state = { view: 'dashboard', theme: 'dark', navOpen: null, acct: false };", "state: any = { view: (import.meta.env.DEV && new URLSearchParams(location.search).get('view')) || 'login', theme: 'dark', navOpen: null, acct: false, user: null, authReady: false };\n  unsubAuth: any = null;");

// Login real con Firebase Auth
rep(/submitLogin = \(\) => \{[\s\S]*?this\.setState\(\{ view: 'dashboard' \}\);\n  \};/.exec(s)[0], `submitLogin = async () => {
    const { email, pass } = this.loginForm;
    let error = '';
    if (!/^[^ @]+@[^ @]+[.][^ @]+$/.test(email)) error = 'Introduce un correo válido.';
    else if (this.loginForm.mode === 'signup' && !(pass.length >= 9 && /[a-z]/.test(pass) && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass))) error = 'La contraseña debe tener mínimo 9 caracteres, con mayúscula, minúscula, número y símbolo (ej. Waack#2026x).';
    else if (!pass) error = 'Escribe tu contraseña.';
    if (!error && !firebaseConfigured) error = 'Firebase no está configurado (falta .env.local).';
    if (error) {
      this.loginForm = Object.assign({}, this.loginForm, { error });
      this.forceUpdate();
      return;
    }
    try {
      if (this.loginForm.mode === 'signup') await createUserWithEmailAndPassword(auth, email, pass);
      else await signInWithEmailAndPassword(auth, email, pass);
    } catch (e: any) {
      const MSG: any = {
        'auth/invalid-credential': 'Correo o contraseña incorrectos.',
        'auth/wrong-password': 'Correo o contraseña incorrectos.',
        'auth/user-not-found': 'Correo o contraseña incorrectos.',
        'auth/email-already-in-use': 'Ese correo ya tiene una cuenta (quizá creada con Google). Pulsa «Continuar con Google» o inicia sesión.',
        'auth/weak-password': 'La contraseña es muy débil.',
        'auth/password-does-not-meet-requirements': 'La contraseña debe tener mínimo 9 caracteres, con mayúscula, minúscula, número y símbolo.',
        'auth/invalid-email': 'Introduce un correo válido.',
        'auth/network-request-failed': 'Sin conexión con Firebase. Revisa tu internet.',
        'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Authentication.',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
        'auth/operation-not-allowed': 'El acceso con correo no está habilitado en Firebase.',
      };
      this.loginForm = Object.assign({}, this.loginForm, { error: MSG[e?.code] || ('No se pudo completar (' + (e?.code || e?.message || 'error desconocido') + ').') });
      this.forceUpdate();
    }
  };

  googleLogin = async () => {
    if (!firebaseConfigured) {
      this.loginForm = Object.assign({}, this.loginForm, { error: 'Firebase no está configurado (falta .env.local).' });
      this.forceUpdate();
      return;
    }
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e: any) {
      if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') return;
      const MSG: any = {
        'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes y reintenta.',
        'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Authentication.',
        'auth/network-request-failed': 'Sin conexión con Firebase. Revisa tu internet.',
      };
      this.loginForm = Object.assign({}, this.loginForm, { error: MSG[e?.code] || ('No se pudo entrar con Google (' + (e?.code || 'error desconocido') + ').'), info: '' });
      this.forceUpdate();
    }
  };

  toggleLoginMode = () => {
    this.loginForm = Object.assign({}, this.loginForm, { mode: this.loginForm.mode === 'signup' ? 'login' : 'signup', error: '', info: '' });
    this.forceUpdate();
  };

  forgotPassword = async () => {
    const { email } = this.loginForm;
    if (!/^[^ @]+@[^ @]+[.][^ @]+$/.test(email)) {
      this.loginForm = Object.assign({}, this.loginForm, { error: 'Escribe tu correo arriba y vuelve a pulsar «Forgot Password?».', info: '' });
    } else if (!firebaseConfigured) {
      this.loginForm = Object.assign({}, this.loginForm, { error: 'Firebase no está configurado (falta .env.local).', info: '' });
    } else {
      try { await sendPasswordResetEmail(auth, email); } catch (e) {}
      // Mismo mensaje exista o no la cuenta, para no revelar qué correos están registrados.
      this.loginForm = Object.assign({}, this.loginForm, { error: '', info: 'Si existe una cuenta con ese correo, te enviamos un enlace para restablecer la contraseña.' });
    }
    this.forceUpdate();
  };

  logout = async () => {
    this.setState({ acct: false });
    try { await signOut(auth); } catch (e) {}
  };`);

// Sesión: entra a la app al autenticarse y vuelve al login al salir; crea users/{uid} la primera vez
rep('componentDidMount() { this.syncTheme(); this.syncVars(); }', `componentDidMount() {
    this.syncTheme(); this.syncVars();
    if (!firebaseConfigured) { this.setState({ authReady: true }); return; }
    this.unsubAuth = onAuthStateChanged(auth, async (user) => {
      this.setState((st: any) => ({ user, authReady: true, view: user ? (st.view === 'login' ? 'dashboard' : st.view) : 'login' }));
      if (user) this.startData(); else this.stopData();
      if (user) {
        try {
          const ref = doc(db, 'users', user.uid);
          if (!(await getDoc(ref)).exists()) await setDoc(ref, { email: user.email, displayName: user.displayName ?? null, role: 'usuario', createdAt: serverTimestamp() });
        } catch (e) { console.warn('No se pudo crear el perfil en Firestore', e); }
      }
    });
  }`);
rep('componentWillUnmount() { clearInterval(this._podTimer); }', `componentWillUnmount() { clearInterval(this._podTimer); this.fisClearTimer && this.fisClearTimer(); this.unsubAuth && this.unsubAuth(); this.stopData(); }

  /* ---------- Datos en vivo desde Firestore (reels, teachers, lives) ----------
     Si una colección está vacía se conservan los datos de ejemplo del prototipo. */
  unsubData: any[] = [];
  stopData() { this.unsubData.forEach((u: any) => u()); this.unsubData = []; }
  startData() {
    this.stopData();
    const byNewest = (a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    const byOrder = (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0);
    const watch = (name: string, apply: (rows: any[]) => void) =>
      onSnapshot(collection(db, name), (snap) => {
        if (snap.empty) return;
        apply(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        this.forceUpdate();
      }, (e) => console.warn('Firestore ' + name + ':', e.code));
    this.unsubData = [
      watch('reels', (rows) => {
        this.reelData = rows.sort(byNewest).map((r: any) => ({ c1: 'var(--pink)', c2: 'var(--purple)', likes: 0, comments: 0, ...r }));
      }),
      watch('teachers', (rows) => {
        this.teacherData = rows.sort(byOrder).map((t: any) => ({ c1: 'var(--blue)', c2: 'var(--purple)', plan: '', courses: [], ...t }));
        if (this.teacherFilter !== 'all' && !this.teacherData.some((t: any) => t.id === this.teacherFilter)) this.teacherFilter = 'all';
      }),
      watch('lives', (rows) => {
        this.insClasses = rows.sort(byOrder).map((c: any) => ({ t: c.title ?? c.t ?? '', when: c.when ?? '', who: c.who ?? '', state: c.state ?? 'Programada', live: !!c.live }));
      }),
    ];
  }`);

rep("showLoginToggle: v !== 'inicio',", `showLoginToggle: false,
      logout: this.logout,
      loginInfo: this.loginForm.info,
      loginSubmitLabel: this.loginForm.mode === 'signup' ? 'Crear cuenta' : 'Log In',
      loginSwitchText: this.loginForm.mode === 'signup' ? 'Already have an account?' : "Don't have an account?",
      loginSwitchLabel: this.loginForm.mode === 'signup' ? 'Log In' : 'Sign Up',
      toggleLoginMode: this.toggleLoginMode,
      googleLogin: this.googleLogin,
      forgotPassword: this.forgotPassword,`);

s = (await import('./patches.mjs')).default(s);

const head = `// GENERADO por tools/port-logic.mjs desde la lógica del prototipo. Edita tools/logic.source.js o el script, no este archivo.
/* eslint-disable */
// @ts-nocheck
import React, { Component } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from './lib/firebase';
import Shell from './Shell';
import Login from './views/Login';
import ChatDock from './views/ChatDock';
import Register from './screens/Register';
import RegisterPro from './screens/RegisterPro';
import { takePending } from './lib/session';
import { startCheckout } from './lib/payments';

`;
const render = `
  render() {
    const v = { ...this.props, ...this.renderVals() };
    if (!this.state.authReady) return <div style={{ minHeight: '100vh', background: '#000' }} />;
    return (
      <div data-theme={v.theme} style={{ minHeight: '100vh', background: 'var(--ground)', color: 'var(--ink)', position: 'relative', overflow: 'hidden', fontFamily: 'Geist,system-ui,sans-serif' }} ref={v.rootRef}>
        <div style={sty(v.ambientLayer)}></div>
        {v.isLogin && <Login v={v} />}
        {v.isRegister && <Register go={v.goView} />}
        {v.isRegisterInstructor && <RegisterPro kind="instructor" go={v.goView} />}
        {v.isRegisterStudio && <RegisterPro kind="estudio" go={v.goView} />}
        {v.isApp && <Shell v={v} />}
        {v.isApp && <ChatDock v={v} />}
      </div>
    );
  }
`;
s = s.replace(/\n}\s*$/, render + '}\n');
writeFileSync(new URL('../src/App.tsx', import.meta.url), head + "import { sty } from './lib/dc';\n\n" + s + '\nexport default App;\n');
