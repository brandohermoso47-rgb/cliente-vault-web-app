import { useEffect, useMemo, useRef, useState } from 'react';
import type { FigureEffectType, FigureEvent } from '../../types/motionRecognition';
import { getEffectPlugin } from '../../lib/motionRecognition/effects';
import OverlayCanvas from './OverlayCanvas';
import { safeVideoUrl } from '../../lib/safeVideoUrl';
import { btn, fmtTime } from './ui';

const SPEEDS = [0.25, 0.5, 0.75, 1];

// Reproductor liviano del alumno: solo video + JSON de eventos. Nunca corre MediaPipe.
export default function StudentPlayer({ videoUrl, events }: { videoUrl: string; events: FigureEvent[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.75);
  const [timeMs, setTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  // Se guardan los tipos OCULTOS: si llegan datos nuevos, sus tipos se ven por defecto.
  const [hidden, setHidden] = useState<Set<FigureEffectType>>(new Set());

  const types = useMemo(() => Array.from(new Set(events.map((e) => e.type))), [events]);
  const visible = useMemo(() => events.filter((e) => !hidden.has(e.type)), [events, hidden]);

  useEffect(() => { if (videoRef.current) videoRef.current.playbackRate = speed; }, [speed]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => setPlaying(false));
    else v.pause();
  };
  const flip = (t: FigureEffectType) => setHidden((h) => {
    const n = new Set(h);
    if (n.has(t)) n.delete(t); else n.add(t);
    return n;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ position: 'relative', width: '100%', height: 'min(70vh, 640px)', background: '#000', borderRadius: '14px', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          src={safeVideoUrl(videoUrl) ?? undefined}
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onLoadedMetadata={(e) => { setDurationMs(e.currentTarget.duration * 1000); e.currentTarget.playbackRate = speed; }}
          onTimeUpdate={(e) => setTimeMs(e.currentTarget.currentTime * 1000)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />
        <OverlayCanvas videoRef={videoRef} events={visible} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button type="button" onClick={toggle} style={btn('primary')} aria-label={playing ? 'Pausar' : 'Reproducir'}>{playing ? '❚❚' : '▶'}</button>
        <input
          type="range"
          min={0}
          max={Math.max(1, durationMs)}
          value={timeMs}
          onChange={(e) => { if (videoRef.current) videoRef.current.currentTime = Number(e.target.value) / 1000; }}
          style={{ flex: 1, accentColor: 'var(--pink)' }}
          aria-label="Posición del video"
        />
        <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '12px', color: 'var(--ink-2)' }}>{fmtTime(timeMs)} / {fmtTime(durationMs)}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {SPEEDS.map((s) => <button key={s} type="button" onClick={() => setSpeed(s)} style={btn('ghost', s === speed)}>{s}×</button>)}
        <span style={{ width: '12px' }} />
        {types.map((t) => (
          <button key={t} type="button" onClick={() => flip(t)} style={btn('ghost', !hidden.has(t))} aria-pressed={!hidden.has(t)}>
            {getEffectPlugin(t)?.label ?? t}
          </button>
        ))}
      </div>
    </div>
  );
}
