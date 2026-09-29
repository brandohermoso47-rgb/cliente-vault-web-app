import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { ApiError } from '../lib/api';
import {
  connectSpotify, createSpotifyPlayer, pausePlayback, playOnDevice, searchTracks,
  spotifyDisconnect, spotifyStatus, type SpotifyPlayerHandle, type SpotifyStatus, type SpotifyTrack,
} from '../lib/spotify';

const card: CSSProperties = { border: '1px solid var(--hair)', background: 'var(--glass)', backdropFilter: 'var(--lg-blur)', WebkitBackdropFilter: 'var(--lg-blur)', boxShadow: 'var(--lg-edge), var(--lg-lift)', borderRadius: 22, padding: 24 };
const h2: CSSProperties = { margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: 'var(--ink)' };
const note: CSSProperties = { margin: '0 0 16px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--ink-2)' };
const btn: CSSProperties = { padding: '11px 20px', borderRadius: 999, border: 0, fontFamily: 'Geist,sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg,#1DB954,#169c46)', cursor: 'pointer', boxShadow: '0 10px 26px -10px rgba(29,185,84,.6)' };
const ghost: CSSProperties = { padding: '10px 18px', borderRadius: 999, border: '1px solid var(--hair)', background: 'var(--glass-2)', color: 'var(--ink)', fontFamily: 'Geist,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const input: CSSProperties = { display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px 15px', borderRadius: 14, border: '1px solid var(--hair)', background: 'var(--glass-2)', color: 'var(--ink)', fontFamily: 'Geist,sans-serif', fontSize: 14, outline: 'none' };
const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 14, cursor: 'pointer' };

export default function Musica({ go }: { go: (view: string) => void }) {
  const [status, setStatus] = useState<SpotifyStatus | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<SpotifyTrack | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const playerRef = useRef<SpotifyPlayerHandle | null>(null);

  const refreshStatus = useCallback(async () => {
    try { setStatus(await spotifyStatus()); } catch { setStatus({ connected: false }); }
  }, []);

  useEffect(() => { refreshStatus(); }, [refreshStatus]);

  // Cuando la cuenta es Premium, levanta un reproductor "Waack On" dentro del navegador (Web Playback SDK).
  useEffect(() => {
    if (!status?.connected || !status.premium) return;
    let cancelled = false;
    createSpotifyPlayer((state) => {
      if (cancelled || !state) return;
      setIsPaused(state.paused);
      const t = state.track_window?.current_track;
      if (t) setNowPlaying({ id: t.id, name: t.name, uri: t.uri, durationMs: t.duration_ms, artists: (t.artists ?? []).map((a: any) => a.name).join(', '), album: t.album?.name ?? '', imageUrl: t.album?.images?.[0]?.url, previewUrl: null });
    }).then((h) => { if (cancelled) h.disconnect(); else playerRef.current = h; })
      .catch((e) => setMsg({ ok: false, text: e?.message || 'No se pudo iniciar el reproductor de Spotify.' }));
    return () => { cancelled = true; playerRef.current?.disconnect(); playerRef.current = null; };
  }, [status?.connected, status?.premium]);

  const onConnect = async () => {
    setConnecting(true); setMsg(null);
    try { await connectSpotify(); await refreshStatus(); }
    catch (e: any) { setMsg({ ok: false, text: e?.message || 'No se pudo conectar con Spotify.' }); }
    finally { setConnecting(false); }
  };

  const onDisconnect = async () => {
    try { await spotifyDisconnect(); playerRef.current?.disconnect(); playerRef.current = null; setNowPlaying(null); await refreshStatus(); }
    catch (e: any) { setMsg({ ok: false, text: e?.message || 'No se pudo desconectar.' }); }
  };

  const onSearch = async (e: FormEvent) => {
    e.preventDefault(); setSearching(true); setMsg(null);
    try { setResults(await searchTracks(q)); }
    catch (e: any) {
      if (e instanceof ApiError && e.code === 'spotify_not_connected') setStatus({ connected: false });
      setMsg({ ok: false, text: e?.message || 'No se pudo buscar en Spotify.' });
    } finally { setSearching(false); }
  };

  const onPlay = async (t: SpotifyTrack) => {
    setMsg(null);
    try {
      await playOnDevice(t.uri, playerRef.current?.deviceId);
      setNowPlaying(t); setIsPaused(false);
    } catch (e: any) { setMsg({ ok: false, text: e?.message || 'Spotify no pudo reproducir esta canción.' }); }
  };

  const onTogglePause = async () => {
    if (!playerRef.current) return;
    if (isPaused) await playerRef.current.player.resume(); else await pausePlayback(playerRef.current.deviceId);
    setIsPaused((p) => !p);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--ink)' }}>Música</h1>
        <button style={ghost} onClick={() => go('dashboard')}>Volver</button>
      </div>

      {msg && <div style={{ ...card, padding: 14, borderColor: msg.ok ? 'color-mix(in oklch, #1DB954 40%, transparent)' : 'color-mix(in oklch, #FF2E86 40%, transparent)', color: msg.ok ? '#1DB954' : '#FF2E86', fontSize: 13 }}>{msg.text}</div>}

      <div style={card}>
        <h2 style={h2}>Spotify</h2>
        {status === null ? (
          <p style={note}>Comprobando tu conexión…</p>
        ) : !status.connected ? (
          <>
            <p style={note}>Conecta tu cuenta de Spotify para buscar y reproducir canciones dentro de Waack On. Necesitas Spotify (Free o Premium); reproducir la canción completa dentro de la app requiere Premium.</p>
            <button style={btn} onClick={onConnect} disabled={connecting}>{connecting ? 'Conectando…' : 'Conectar con Spotify'}</button>
          </>
        ) : (
          <>
            <p style={note}>Conectado como <b>{status.spotifyUserId}</b> · {status.premium ? 'Cuenta Premium: reproducción completa en la app.' : 'Cuenta Free: puedes buscar y controlar la reproducción, pero Spotify exige Premium para sonar dentro de la app.'}</p>
            <button style={ghost} onClick={onDisconnect}>Desconectar Spotify</button>
          </>
        )}
      </div>

      {status?.connected && (
        <div style={card}>
          <h2 style={h2}>Buscar canciones</h2>
          <form onSubmit={onSearch} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <input style={input} placeholder="Artista, canción…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button style={btn} disabled={searching}>{searching ? 'Buscando…' : 'Buscar'}</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 380, overflowY: 'auto' }}>
            {results.map((t) => (
              <div key={t.id} style={row} onClick={() => onPlay(t)} title="Reproducir">
                {t.imageUrl && <img src={t.imageUrl} alt="" width={40} height={40} style={{ borderRadius: 8, flex: '0 0 40px' }} />}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.artists}</div>
                </div>
              </div>
            ))}
            {!results.length && !searching && <p style={{ ...note, margin: 0 }}>Busca una canción para empezar.</p>}
          </div>
        </div>
      )}

      {nowPlaying && (
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', bottom: 16 }}>
          {nowPlaying.imageUrl && <img src={nowPlaying.imageUrl} alt="" width={48} height={48} style={{ borderRadius: 10 }} />}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{nowPlaying.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{nowPlaying.artists}</div>
          </div>
          {status?.premium && playerRef.current && (
            <button style={btn} onClick={onTogglePause}>{isPaused ? 'Reanudar' : 'Pausar'}</button>
          )}
        </div>
      )}
    </div>
  );
}
