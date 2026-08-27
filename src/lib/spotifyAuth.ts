// Client-side helpers for the Spotify OAuth (Authorization Code) flow used by
// SpotifyMusicPlayer and SpotifyPlaylistModal. Centralizes token storage and
// silent refresh so both components stay in sync and never duplicate the
// (security-sensitive) token-handling logic.

const TOKEN_KEY = 'waackon_spotify_token';
const REFRESH_KEY = 'waackon_spotify_refresh_token';
const EXPIRES_KEY = 'waackon_spotify_token_expires_at';

export interface SpotifyTokenState {
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export function getStoredSpotifyTokens(): SpotifyTokenState {
  const expiresRaw = localStorage.getItem(EXPIRES_KEY);
  return {
    token: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
    expiresAt: expiresRaw ? Number(expiresRaw) : null
  };
}

export function hasStoredSpotifyToken(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function storeSpotifyTokens(token: string, refreshToken: string | null, expiresIn: number): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
  localStorage.setItem(EXPIRES_KEY, String(Date.now() + Math.max(0, expiresIn) * 1000));
}

export function clearSpotifyTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

/**
 * Returns a Spotify access token that is safe to use right now, transparently
 * refreshing it via /api/spotify/refresh-token if it has expired (Spotify
 * access tokens only last ~1h). Returns null when there is no linked account,
 * or when the refresh token itself was rejected (e.g. the user revoked access
 * from their Spotify account) — callers should treat null as "not connected"
 * and prompt the user to reconnect rather than silently falling back.
 */
export async function getValidSpotifyAccessToken(): Promise<string | null> {
  const { token, refreshToken, expiresAt } = getStoredSpotifyTokens();
  if (!token) return null;

  const isFresh = !expiresAt || Date.now() < expiresAt - 60_000;
  if (isFresh) return token;

  if (!refreshToken) {
    clearSpotifyTokens();
    return null;
  }

  try {
    const res = await fetch('/api/spotify/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!res.ok) {
      clearSpotifyTokens();
      return null;
    }

    const data = await res.json();
    if (!data.accessToken) {
      clearSpotifyTokens();
      return null;
    }

    storeSpotifyTokens(data.accessToken, data.refreshToken || refreshToken, data.expiresIn || 3600);
    return data.accessToken;
  } catch {
    // Network hiccup talking to our own backend — keep the existing token
    // around and let the caller retry later instead of force-disconnecting.
    return token;
  }
}
