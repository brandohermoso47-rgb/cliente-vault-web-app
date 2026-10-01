import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { withAuth } from '../auth.js';
import { schema } from '../db/index.js';
import { HttpError, handle, parse, type Deps } from '../http.js';

const { spotifyConnections } = schema;

// Solo pedimos lo mínimo: leer el estado de reproducción, controlarla y usar el Web Playback SDK.
const SCOPES = ['streaming', 'user-read-email', 'user-read-private', 'user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing'].join(' ');

const needSpotify = (deps: Deps) => {
  if (!deps.config.SPOTIFY_CLIENT_ID || !deps.config.SPOTIFY_CLIENT_SECRET || !deps.config.SPOTIFY_REDIRECT_URI) {
    throw new HttpError(503, 'spotify_disabled', 'La integración con Spotify todavía no está activada.');
  }
  return { clientId: deps.config.SPOTIFY_CLIENT_ID, clientSecret: deps.config.SPOTIFY_CLIENT_SECRET, redirectUri: deps.config.SPOTIFY_REDIRECT_URI };
};

const basicAuth = (id: string, secret: string) => 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');

type TokenResp = { access_token: string; refresh_token?: string; expires_in: number; scope: string };

const SPOTIFY_STATE_TTL_MS = 10 * 60 * 1000;

export function createSpotifyState(uid: string, clientSecret: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({
    uid,
    nonce: randomBytes(16).toString('hex'),
    createdAt: now,
  })).toString('base64url');
  const signature = createHmac('sha256', clientSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySpotifyState(state: string, uid: string, clientSecret: string, now = Date.now()): boolean {
  const [payload, signature, ...extra] = state.split('.');
  if (!payload || !signature || extra.length) return false;

  const expected = createHmac('sha256', clientSecret).update(payload).digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(signature, 'base64url');
  } catch {
    return false;
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      uid?: unknown;
      nonce?: unknown;
      createdAt?: unknown;
    };
    return parsed.uid === uid
      && typeof parsed.nonce === 'string'
      && typeof parsed.createdAt === 'number'
      && parsed.createdAt <= now
      && now - parsed.createdAt <= SPOTIFY_STATE_TTL_MS;
  } catch {
    return false;
  }
}

async function exchangeCode(cfg: { clientId: string; clientSecret: string; redirectUri: string }, code: string): Promise<TokenResp> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: basicAuth(cfg.clientId, cfg.clientSecret) },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: cfg.redirectUri }),
  });
  if (!res.ok) throw new HttpError(400, 'spotify_exchange_failed', 'No se pudo conectar con Spotify.');
  return res.json() as Promise<TokenResp>;
}

async function refreshToken(cfg: { clientId: string; clientSecret: string }, refresh: string): Promise<TokenResp> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: basicAuth(cfg.clientId, cfg.clientSecret) },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  });
  if (!res.ok) throw new HttpError(409, 'spotify_reauth_required', 'Tu conexión con Spotify caducó; vuelve a conectarla.');
  return res.json() as Promise<TokenResp>;
}

async function fetchProfile(accessToken: string): Promise<{ id: string; product?: string }> {
  const res = await fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new HttpError(502, 'spotify_profile_failed', 'No se pudo leer el perfil de Spotify.');
  return res.json() as Promise<{ id: string; product?: string }>;
}

const exchangeBody = z.object({ code: z.string().min(1), state: z.string().min(1) });

export function spotifyRouter(deps: Deps) {
  const r = Router();

  // Arranca el OAuth: guarda un 'state' de un solo uso (CSRF) atado a este usuario y devuelve la URL de Spotify.
  r.get('/spotify/login', withAuth(deps), handle(deps, 'user', async ({ req }) => {
    const cfg = needSpotify(deps);
    const state = createSpotifyState(req.user!.id, cfg.clientSecret);
    const url = new URL('https://accounts.spotify.com/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', cfg.clientId);
    url.searchParams.set('scope', SCOPES);
    url.searchParams.set('redirect_uri', cfg.redirectUri);
    url.searchParams.set('state', state);
    return { body: { url: url.toString(), state } };
  }));

  // Spotify redirige el navegador a una página del propio frontend (SPOTIFY_REDIRECT_URI), que lee
  // ?code y ?state de la URL y llama a esto autenticada (con el token de Firebase) antes de cerrarse.
  r.post('/spotify/exchange', withAuth(deps), handle(deps, 'user', async ({ req, db }) => {
    const cfg = needSpotify(deps);
    const { code, state } = parse(exchangeBody, req.body ?? {});
    if (!verifySpotifyState(state, req.user!.id, cfg.clientSecret)) {
      throw new HttpError(400, 'spotify_state_mismatch', 'La conexión no corresponde a esta sesión.');
    }
    const tok = await exchangeCode(cfg, code);
    if (!tok.refresh_token) throw new HttpError(502, 'spotify_no_refresh_token', 'Spotify no devolvió un token de refresco.');
    const profile = await fetchProfile(tok.access_token);
    await db.insert(spotifyConnections)
      .values({
        userId: req.user!.id, spotifyUserId: profile.id, accessToken: tok.access_token, refreshToken: tok.refresh_token,
        expiresAt: new Date(Date.now() + tok.expires_in * 1000), scope: tok.scope, product: profile.product ?? null,
      })
      .onConflictDoUpdate({
        target: spotifyConnections.userId,
        set: { spotifyUserId: profile.id, accessToken: tok.access_token, refreshToken: tok.refresh_token, expiresAt: new Date(Date.now() + tok.expires_in * 1000), scope: tok.scope, product: profile.product ?? null, updatedAt: new Date() },
      });
    return { body: { connected: true, premium: profile.product === 'premium' } };
  }));

  // Estado de la conexión (sin exponer tokens).
  r.get('/spotify/status', withAuth(deps), handle(deps, 'user', async ({ req, db }) => {
    const [row] = await db.select().from(spotifyConnections).where(eq(spotifyConnections.userId, req.user!.id)).limit(1);
    if (!row) return { body: { connected: false } };
    return { body: { connected: true, premium: row.product === 'premium', spotifyUserId: row.spotifyUserId } };
  }));

  // Token de acceso vigente para el Web Playback SDK del navegador (se refresca si está por caducar).
  r.get('/spotify/token', withAuth(deps), handle(deps, 'user', async ({ req, db }) => {
    const cfg = needSpotify(deps);
    const [row] = await db.select().from(spotifyConnections).where(eq(spotifyConnections.userId, req.user!.id)).limit(1);
    if (!row) throw new HttpError(409, 'spotify_not_connected', 'Conecta tu cuenta de Spotify primero.');
    if (row.expiresAt.getTime() > Date.now() + 60_000) return { body: { accessToken: row.accessToken, premium: row.product === 'premium' } };
    const tok = await refreshToken(cfg, row.refreshToken);
    await db.update(spotifyConnections).set({
      accessToken: tok.access_token, refreshToken: tok.refresh_token ?? row.refreshToken,
      expiresAt: new Date(Date.now() + tok.expires_in * 1000), updatedAt: new Date(),
    }).where(eq(spotifyConnections.userId, req.user!.id));
    return { body: { accessToken: tok.access_token, premium: row.product === 'premium' } };
  }));

  r.delete('/spotify/connection', withAuth(deps), handle(deps, 'user', async ({ req, db }) => {
    await db.delete(spotifyConnections).where(eq(spotifyConnections.userId, req.user!.id));
    return { body: { connected: false } };
  }));

  return r;
}
