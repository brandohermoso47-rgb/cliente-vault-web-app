// Parches sobre la lógica del prototipo: registro abierto, registro pro, "Mi cuenta" y perfil en Firestore.
import patchesPayments from './patches-payments.mjs';

export default function patches(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado: ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  // Rutas que viven fuera del shell (sin barra lateral)
  rep("isApp: v !== 'login',", "isApp: !['login', 'register', 'registerInstructor', 'registerStudio'].includes(v),\n      isRegister: v === 'register',\n      isRegisterInstructor: v === 'registerInstructor',\n      isRegisterStudio: v === 'registerStudio',\n      isCuenta: v === 'cuenta',\n      goView: (view) => this.setState({ view }),\n      goRegisterPro: () => this.setState({ view: 'registerInstructor' }),");
  rep("perfil:'Mi perfil',", "perfil:'Mi perfil', cuenta:'Mi cuenta',");
  rep("{ label: 'Mi perfil', view: 'perfil' },", "{ label: 'Mi cuenta', view: 'cuenta' },\n        { label: 'Mi perfil', view: 'perfil' },");

  // "Sign Up" del login lleva al formulario completo de registro
  rep("this.loginForm = Object.assign({}, this.loginForm, { mode: this.loginForm.mode === 'signup' ? 'login' : 'signup', error: '', info: '' });\n    this.forceUpdate();", "this.setState({ view: 'register' });");

  // Sesión: las pantallas de registro no se cierran al iniciar sesión hasta que Firebase confirma
  rep("view: user ? (st.view === 'login' ? 'dashboard' : st.view) : 'login'", "view: user ? (['login', 'register', 'registerInstructor', 'registerStudio'].includes(st.view) ? 'dashboard' : st.view) : (['register', 'registerInstructor', 'registerStudio'].includes(st.view) ? st.view : 'login')");

  // Perfil + solicitud profesional al crearse la cuenta
  rep("if (!(await getDoc(ref)).exists()) await setDoc(ref, { email: user.email, displayName: user.displayName ?? null, role: 'usuario', createdAt: serverTimestamp() });",
      "const p = takePending();\n          if (!(await getDoc(ref)).exists()) await setDoc(ref, { displayName: user.displayName ?? null, photoURL: user.photoURL ?? null, ...(p.profile || {}), role: 'usuario', createdAt: serverTimestamp() });\n          if (p.application) await setDoc(doc(db, 'applications', user.uid), { ...p.application, uid: user.uid, email: user.email, status: 'pendiente', createdAt: serverTimestamp() });");
  return patchesPayments(s);
}
