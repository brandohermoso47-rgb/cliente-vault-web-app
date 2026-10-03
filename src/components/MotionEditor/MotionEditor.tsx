import { useMemo, useRef, useState } from 'react';
import type { FigureEffectType, FigureEvent } from '../../types/motionRecognition';
import MotionEditorLayersPanel from './MotionEditorLayersPanel';
import MotionEditorTimeline from './MotionEditorTimeline';
import OverlayCanvas from './OverlayCanvas';
import StudentPlayer from './StudentPlayer';
import { btn, fmtTime } from './ui';

interface Props {
  videoUrl: string;
  events: FigureEvent[];
  initiallyAccepted: boolean; // true = vienen guardadas; false = propuestas recién detectadas
  saving: boolean;
  onSave: (events: FigureEvent[]) => void;
}

// Editor: video + figuras a la izquierda, capas a la derecha, línea de tiempo abajo.
// Fase 1: aceptar / eliminar cada figura y silenciar tipos completos. Solo lo aceptado y no silenciado se guarda.
export default function MotionEditor({ videoUrl, events: initial, initiallyAccepted, saving, onSave }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [events, setEvents] = useState(initial);
  const [accepted, setAccepted] = useState<Set<string>>(() => new Set(initiallyAccepted ? initial.map((e) => e.id) : []));
  const [mutedTypes, setMutedTypes] = useState<Set<FigureEffectType>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentMs, setCurrentMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [studentView, setStudentView] = useState(false);
  // Una detección nueva reemplaza lo publicado aunque venga vacía: hay que poder guardarla.
  const [dirty, setDirty] = useState(!initiallyAccepted);

  const visible = useMemo(() => events.filter((e) => !mutedTypes.has(e.type)), [events, mutedTypes]);
  const toSave = useMemo(() => visible.filter((e) => accepted.has(e.id)), [visible, accepted]);

  const seek = (ms: number) => {
    if (videoRef.current) videoRef.current.currentTime = ms / 1000;
    setCurrentMs(ms);
  };
  const accept = (ids: string[]) => {
    if (saving) return;
    setAccepted((a) => new Set([...a, ...ids]));
    setDirty(true);
  };
  const remove = (id: string) => {
    if (saving) return;
    setEvents((es) => es.filter((e) => e.id !== id));
    setAccepted((a) => { const n = new Set(a); n.delete(id); return n; });
    if (selectedId === id) setSelectedId(null);
    setDirty(true);
  };
  const toggleMute = (type: FigureEffectType) => {
    if (saving) return;
    setMutedTypes((m) => { const n = new Set(m); if (n.has(type)) n.delete(type); else n.add(type); return n; });
    setDirty(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        <button type="button" onClick={() => setStudentView(false)} style={btn('ghost', !studentView)}>Editor</button>
        <button type="button" onClick={() => setStudentView(true)} style={btn('ghost', studentView)}>Vista alumno</button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: 'var(--ink-2)' }}>
          {toSave.length} figura{toSave.length === 1 ? '' : 's'} para publicar{dirty ? ' · cambios sin guardar' : ''}
        </span>
        <button type="button" disabled={saving || !dirty} onClick={() => onSave(toSave)} style={{ ...btn('primary'), opacity: saving || !dirty ? 0.55 : 1 }}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {studentView ? (
        <StudentPlayer videoUrl={videoUrl} events={toSave} />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)', gap: '16px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ position: 'relative', width: '100%', height: 'min(70vh, 640px)', background: '#000', borderRadius: '14px', overflow: 'hidden' }}>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  playsInline
                  onLoadedMetadata={(e) => setDurationMs(e.currentTarget.duration * 1000)}
                  onTimeUpdate={(e) => setCurrentMs(e.currentTarget.currentTime * 1000)}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <OverlayCanvas videoRef={videoRef} events={visible} />
              </div>
              <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: '11.5px', color: 'var(--ink-3)' }}>
                Se muestran propuestas y aceptadas · {fmtTime(currentMs)} / {fmtTime(durationMs)}
              </span>
            </div>
            <MotionEditorLayersPanel
              events={events}
              accepted={accepted}
              mutedTypes={mutedTypes}
              selectedId={selectedId}
              onSelect={(id) => { setSelectedId(id); const e = events.find((x) => x.id === id); if (e) seek(e.startMs); }}
              onAccept={accept}
              onDelete={remove}
              onToggleMute={toggleMute}
              disabled={saving}
            />
          </div>
          <MotionEditorTimeline
            events={events}
            accepted={accepted}
            mutedTypes={mutedTypes}
            durationMs={durationMs}
            currentMs={currentMs}
            selectedId={selectedId}
            onSeek={seek}
            onSelect={setSelectedId}
          />
        </>
      )}
    </div>
  );
}
