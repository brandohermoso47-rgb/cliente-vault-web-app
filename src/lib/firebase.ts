import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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
export const db = app ? (import.meta.env.VITE_FIREBASE_FIRESTORE_DB ? getFirestore(app, import.meta.env.VITE_FIREBASE_FIRESTORE_DB) : getFirestore(app)) : (null as unknown as ReturnType<typeof getFirestore>);
export const storage = app ? getStorage(app) : (null as unknown as ReturnType<typeof getStorage>);
