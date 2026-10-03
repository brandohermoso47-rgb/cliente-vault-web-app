import { api } from './api';

// Integración con Spotify: el backend guarda y refresca los tokens (ver api/src/routes/spotify.ts);
// aquí solo pedimos un access token vigente y hablamos directo con el Web Playback SDK / Web API.

export type SpotifyStatus = { connected: boolean; premium?: boolean; spotifyUserId?: string };

export const spotifyStatus = () => api<SpotifyStatus>('GET', '/spotify/status');

export const spotifyDisconnect = async () => {
  const result = await api<{ connected: false }>('DELETE', '/spotify/connection');
  clearSpotifyTokenCache();
  return result;
};

// Igual que startCheckout/startConnectOnboarding en lib/payments.ts: navega fuera de la app y Spotify
// devuelve al navegador aquí mismo (ver handleSpotifyReturnIfPresent, que recoge ?code&state al volver).
export async function connectSpotify(): Promise<void> {
  const { url } = await api<{ url: string }>('GET', '/spotify/login');
  window.location.assign(url);
}

// Spotify redirige el navegador de vuelta a SPOTIFY_REDIRECT_URI (la propia app; Firebase Hosting sirve
// index.html para cualquier ruta) con ?code&state. Se llama tras iniciar sesión, igual que el retorno de
// Stripe Checkout/Connect. Devuelve true si venía de Spotify (para que App.tsx abra la vista Música).
export async function handleSpotifyReturnIfPresent(): Promise<boolean> {
  const qs = new URLSearchParams(location.search);
  const code = qs.get('code');
  const state = qs.get('state');
  if (!code || !state) return false;
  history.replaceState(null, '', location.pathname); // limpia ?code&state antes de nada, aunque falle
  try {
    await api('POST', '/spotify/exchange', { code, state });
  } catch (e) {
    console.warn('No se pudo completar la conexión con Spotify', e);
  }
  return true;
}

let cachedToken: { value: string; expiresAt: number; premium: boolean } | null = null;

// El backend ya sabe si conviene refrescar; aquí solo cacheamos en memoria unos segundos para no pedirlo en cada clic.
export async function getSpotifyAccessToken(): Promise<{ token: string; premium: boolean }> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return { token: cachedToken.value, premium: cachedToken.premium };
  const { accessToken, premium } = await api<{ accessToken: string; premium: boolean }>('GET', '/spotify/token');
  cachedToken = { value: accessToken, expiresAt: Date.now() + 50_000, premium };
  return { token: accessToken, premium };
}

export function clearSpotifyTokenCache() { cachedToken = null; }

// ── Web API (búsqueda y control remoto: funcionan con Free y Premium) ─────────────────────────────
export type SpotifyTrack = {
  id: string; name: string; uri: string; durationMs: number;
  artists: string; album: string; imageUrl?: string; previewUrl: string | null;
};

const toTrack = (t: any): SpotifyTrack => ({
  id: t.id, name: t.name, uri: t.uri, durationMs: t.duration_ms,
  artists: (t.artists ?? []).map((a: any) => a.name).join(', '),
  album: t.album?.name ?? '', imageUrl: t.album?.images?.[2]?.url ?? t.album?.images?.[0]?.url,
  previewUrl: t.preview_url ?? null,
});

async function spotifyWebApi(path: string, init: RequestInit = {}): Promise<Response> {
  const { token } = await getSpotifyAccessToken();
  return fetch(`https://api.spotify.com/v1${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) } });
}

export async function searchTracks(q: string): Promise<SpotifyTrack[]> {
  if (!q.trim()) return [];
  const res = await spotifyWebApi(`/search?type=track&limit=20&q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('No se pudo buscar en Spotify.');
  const data = await res.json();
  return (data.tracks?.items ?? []).map(toTrack);
}

// Reanuda/inicia la reproducción en un dispositivo (deviceId del Web Playback SDK, o el activo si se omite).
export async function playOnDevice(uri: string, deviceId?: string): Promise<void> {
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : '';
  const res = await spotifyWebApi(`/me/player/play${qs}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uris: [uri] }) });
  if (!res.ok && res.status !== 204) {
    if (res.status === 404) throw new Error('Abre Spotify en algún dispositivo (móvil, PC) para poder controlarlo.');
    throw new Error('Spotify no pudo iniciar la reproducción (requiere cuenta Premium).');
  }
}

export async function pausePlayback(deviceId?: string): Promise<void> {
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : '';
  await spotifyWebApi(`/me/player/pause${qs}`, { method: 'PUT' });
}

// ── Web Playback SDK (Premium): crea un reproductor "Waack On" dentro del navegador ────────────────
declare global {
  interface Window { onSpotifyWebPlaybackSDKReady?: () => void; Spotify?: any }
}

let sdkLoading: Promise<void> | null = null;
function loadSpotifySdk(): Promise<void> {
  if (window.Spotify) return Promise.resolve();
  if (sdkLoading) return sdkLoading;
  sdkLoading = new Promise((resolve) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve();
    const s = document.createElement('script');
    s.src = 'https://sdk.scdn.co/spotify-player.js';
    s.async = true;
    document.body.appendChild(s);
  });
  return sdkLoading;
}

export type SpotifyPlayerHandle = { player: any; deviceId: string; disconnect: () => void };

// Solo funciona con cuentas Premium: Spotify devuelve error de reproducción para cuentas Free.
export async function createSpotifyPlayer(onStateChange: (state: any) => void): Promise<SpotifyPlayerHandle> {
  await loadSpotifySdk();
  const player = new window.Spotify.Player({
    name: 'Waack On',
    getOAuthToken: (cb: (t: string) => void) => { getSpotifyAccessToken().then(({ token }) => cb(token)); },
    volume: 0.8,
  });
  player.addListener('player_state_changed', onStateChange);
  const deviceId: string = await new Promise((resolve, reject) => {
    player.addListener('ready', ({ device_id }: { device_id: string }) => resolve(device_id));
    player.addListener('initialization_error', ({ message }: { message: string }) => reject(new Error(message)));
    player.addListener('authentication_error', ({ message }: { message: string }) => reject(new Error(message)));
    player.connect();
  });
  return { player, deviceId, disconnect: () => player.disconnect() };
}
