import { initializeApp } from 'firebase/app';
import { browserPopupRedirectResolver, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

// Los valores salen de .env.local (ver .env.example). La config web de Firebase no es secreta,
// pero la seguridad real está en firestore.rules.
export const firebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

const app = firebaseConfigured ? initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}) : null;

// Sin configuración (.env.local) quedan en null y la app corre en modo vista previa.
export const auth = app ? getAuth(app) : (null as unknown as ReturnType<typeof getAuth>);
// Inicio de sesión con Google en ventana emergente: Firebase carga un componente interno (iframe) la PRIMERA vez que se usa,
// y si eso ocurre después del clic, Safari/Firefox y algunos Chrome bloquean la ventana. Lo cargamos por adelantado,
// para que signInWithPopup abra la ventana en el mismo instante del clic.
if (app) {
  try { void Promise.resolve((browserPopupRedirectResolver as unknown as { _initialize: (a: unknown) => Promise<unknown> })._initialize(auth)).catch(() => {}); } catch { /* sin navegador */ }
}

export const db = app ? (import.meta.env.VITE_FIREBASE_FIRESTORE_DB ? getFirestore(app, import.meta.env.VITE_FIREBASE_FIRESTORE_DB) : getFirestore(app)) : (null as unknown as ReturnType<typeof getFirestore>);
export const storage = app ? getStorage(app) : (null as unknown as ReturnType<typeof getStorage>);
export const functions = app ? getFunctions(app, 'us-central1') : null;

// App Check: prueba ante la API y ante Firebase que las peticiones salen de esta app y no de un script.
// Se activa al definir VITE_APPCHECK_SITE_KEY (clave de reCAPTCHA Enterprise). En desarrollo usa un token de depuración.
const siteKey = import.meta.env.VITE_APPCHECK_SITE_KEY;
if (app && siteKey) {
  if (import.meta.env.DEV) (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string }).FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
}
export const appCheck = app && siteKey ? initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(siteKey), isTokenAutoRefreshEnabled: true }) : null;
