import { getToken } from 'firebase/app-check';
import { appCheck, auth } from './firebase';

// Cliente de la API de Waack On (Express en Cloud Run, servida en /api por Firebase Hosting).
// Cada petición lleva el ID token de Firebase; el servidor lo verifica.
const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api/v1';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export async function api<T = any>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const user = auth?.currentUser;
  if (!user) throw new ApiError(401, 'unauthenticated', 'Inicia sesión para continuar.');
  const token = await user.getIdToken();
  // Si App Check está activo, cada petición demuestra que sale de la app real.
  let appCheckToken = '';
  if (appCheck) { try { appCheckToken = (await getToken(appCheck, false)).token; } catch { /* la API decidirá si lo exige */ } }
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'network', 'Sin conexión con el servidor.');
  }
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  // Si la API aún no está desplegada, Hosting devuelve la página de la app (HTML) en lugar de JSON.
  if (!isJson) throw new ApiError(503, 'api_unavailable', 'El servicio todavía no está disponible.');
  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, data?.error || 'error', data?.message || 'No se pudo completar la operación.');
  return data as T;
}
