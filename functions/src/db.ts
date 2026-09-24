// El proyecto usa una base de datos de Firestore con nombre (no la "(default)"), así que hay que
// pedirla explícitamente tanto en el Admin SDK como en cada trigger (ver DATABASE_ID en las opciones
// de los triggers de src/*.ts).
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const DATABASE_ID = 'ai-studio-waackonplataform-995cd1f5-e15c-4eff-aaa2-62e6d650abe1';

const app = initializeApp();
export const db = getFirestore(app, DATABASE_ID);
