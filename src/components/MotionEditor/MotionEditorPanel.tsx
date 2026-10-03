import { useEffect, useRef, useState } from 'react';
import type { FigureEvent } from '../../types/motionRecognition';
import type { IClass } from '../../types/instructor';
import { EFFECT_PLUGINS } from '../../lib/motionRecognition/effects';
import { loadFigureEvents, saveFigureEvents } from '../../lib/motionRecognition/api';
import { createClass, subscribeInstructorClasses, updateClass } from '../../lib/instructor';
import { deleteClassVideo, getVideoDuration, uploadClassVideo } from '../../lib/videoStorage';
import MotionEditor from './MotionEditor';
import { btn, card, label, muted } from './ui';

type Status = { kind: 'idle' } | { kind: 'busy'; text: string; progress?: number } | { kind: 'error'; text: string } | { kind: 'ok'; text: string };

// Flujo del instructor: elegir clase → subir video → detectar (una vez) → revisar → guardar.
// Carga sus propias clases (users/{uid}/classes): no depende del estado del App generado.
export default function MotionEditorPanel({ uid }: { uid: string }) {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [classId, setClassId] = useState('');
  const cls = classes.find((c) => c.id === classId) ?? null;
  const [localUrl, setLocalUrl] = useState<string | null>(null); // archivo recién elegido: evita CORS al detectar
  const [events, setEvents] = useState<FigureEvent[]>([]);
  const [fromSaved, setFromSaved] = useState(true);
  // Video de la clase para el que se calcularon las figuras del editor (undefined = aún no se sabe).
  const [eventsVideoUrl, setEventsVideoUrl] = useState<string | null | undefined>(undefined);
  const classesRef = useRef<IClass[]>([]);
  classesRef.current = classes;
  const [editorKey, setEditorKey] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [experimental, setExperimental] = useState(false);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const videoUrl = localUrl ?? cls?.videoUrl ?? null;
  // Mientras se guarda tampoco se puede cambiar de clase ni subir/detectar: la respuesta pertenece a esta clase.
  const busy = status.kind === 'busy' || saving;

  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => subscribeInstructorClasses(uid, setClasses), [uid]);

  useEffect(() => {
    abortRef.current?.abort();
    setLocalUrl(null);
    setEvents([]);
    setFromSaved(true);
    setEventsVideoUrl(undefined);
    setEditorKey((k) => k + 1);
    if (!classId) { setStatus({ kind: 'idle' }); return; }
    let live = true;
    setStatus({ kind: 'busy', text: 'Cargando figuras guardadas…' });
    loadFigureEvents(classId).then(
      (saved) => {
        if (!live) return;
        setEvents(saved.events);
        setEventsVideoUrl(saved.events.length ? saved.videoUrl : classesRef.current.find((c) => c.id === classId)?.videoUrl ?? null);
        setEditorKey((k) => k + 1);
        setStatus({ kind: 'idle' });
      },
      (err) => { if (live) setStatus({ kind: 'error', text: `No se pudieron cargar las figuras guardadas: ${err.message}` }); },
    );
    return () => { live = false; };
  }, [classId]);

  // source: de dónde leer los cuadros (puede ser el archivo local); forVideoUrl: el video de la clase.
  async function detect(source: string, forVideoUrl: string | null) {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus({ kind: 'busy', text: 'Detectando movimientos…', progress: 0 });
    try {
      const plugins = EFFECT_PLUGINS.filter((p) => p.enabledByDefault || experimental);
      // MediaPipe solo se descarga cuando un instructor detecta; el resto de la app (y los alumnos) no lo cargan.
      const { detectFigureEvents } = await import('../../lib/motionRecognition/detection');
      const res = await detectFigureEvents(source, {
        plugins,
        signal: ctrl.signal,
        onProgress: (f) => setStatus({ kind: 'busy', text: 'Detectando movimientos…', progress: f }),
      });
      setEvents(res.events);
      setEventsVideoUrl(forVideoUrl);
      setFromSaved(false);
      setEditorKey((k) => k + 1);
      const coverage = res.framesTotal ? Math.round((res.framesWithBody / res.framesTotal) * 100) : 0;
      setStatus(res.framesWithBody
        ? { kind: 'ok', text: `Listo: ${res.events.length} figuras propuestas. Se detectó el cuerpo en el ${coverage}% del video.` }
        : { kind: 'error', text: 'No se detectó ningún cuerpo en el video. Prueba con buena luz y el cuerpo completo en cuadro.' });
    } catch (err: any) {
      if (err?.name === 'AbortError') setStatus({ kind: 'idle' });
      else setStatus({ kind: 'error', text: err?.message ?? 'La detección falló.' });
    }
  }

  async function onFile(file: File) {
    if (!cls) return;
    const url = URL.createObjectURL(file);
    try {
      setStatus({ kind: 'busy', text: 'Subiendo video…', progress: 0 });
      const durationMs = await getVideoDuration(file);
      const previous = cls.videoUrl;
      const remote = await uploadClassVideo(uid, cls.id, file, (p) => setStatus({ kind: 'busy', text: 'Subiendo video…', progress: p / 100 }));
      // Las figuras publicadas se calcularon sobre el video anterior: se retiran antes de cambiarlo,
      // guardando una copia para restaurarlas si el cambio de video no llega a completarse.
      let published: FigureEvent[] = [];
      if (previous || events.length) {
        try {
          published = (await loadFigureEvents(cls.id)).events;
          if (published.length) await saveFigureEvents(cls.id, [], previous ?? null);
        } catch (err) {
          deleteClassVideo(remote).catch(() => {});
          throw err;
        }
      }
      try {
        await updateClass(uid, cls.id, { videoUrl: remote, videoDurationMs: durationMs });
      } catch (err: any) {
        deleteClassVideo(remote).catch(() => {});
        if (published.length) {
          const restored = await saveFigureEvents(cls.id, published, previous ?? null).then(() => true, () => false);
          if (!restored) throw new Error(`${err?.message ?? 'No se pudo cambiar el video.'} Además no se pudieron restaurar las figuras publicadas; vuelve a detectar y guarda.`);
        }
        throw err;
      }
      setEvents([]);
      setFromSaved(true);
      setEventsVideoUrl(remote);
      setEditorKey((k) => k + 1);
      if (previous) deleteClassVideo(previous).catch((e) => console.warn('No se pudo borrar el video anterior:', e));
      setLocalUrl(url);
      await detect(url, remote);
    } catch (err: any) {
      URL.revokeObjectURL(url);
      setStatus({ kind: 'error', text: err?.message ?? 'No se pudo subir el video.' });
    }
  }

  async function save(toSave: FigureEvent[]) {
    if (!cls) return;
    setSaving(true);
    try {
      const saved = (await saveFigureEvents(cls.id, toSave, eventsVideoUrl ?? null)).events;
      setEvents(saved);
      setFromSaved(true);
      setEditorKey((k) => k + 1);
      setStatus({ kind: 'ok', text: `Guardado: ${saved.length} figuras publicadas para tus alumnos.` });
    } catch (err: any) {
      setStatus({ kind: 'error', text: `No se pudo guardar: ${err?.message ?? 'error desconocido'}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={card}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Editor de movimiento</div>
        <div style={muted}>
          Sube la grabación de una clase. La detección de pose corre una sola vez en tu navegador y propone figuras
          (rejilla del torso, brazo extendido, ángulos de 90°, puntos de rejilla). Acepta o elimina cada una y guarda:
          tus alumnos verán el video con las figuras sin procesar nada en su teléfono.
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '240px' }}>
            <span style={label}>Clase</span>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              disabled={busy}
              style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--hair)', background: 'var(--glass-2)', color: 'var(--ink)' }}
            >
              <option value="">Elige una clase…</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.title}{c.videoUrl ? ' · con video' : ''}</option>)}
            </select>
          </label>

          {cls && (
            <>
              <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} style={{ ...btn('ghost'), opacity: busy ? 0.5 : 1 }}>
                {cls.videoUrl ? 'Reemplazar video' : 'Subir video'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                disabled={busy}
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onFile(f); }}
              />
            </>
          )}

          {cls && videoUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (fromSaved && events.length && !window.confirm('Volver a detectar reemplaza las figuras del editor. Lo publicado no cambia hasta que guardes. ¿Continuar?')) return;
                detect(videoUrl, cls.videoUrl ?? null);
              }} style={{ ...btn('ghost'), opacity: busy ? 0.5 : 1 }}>
              {fromSaved && events.length ? 'Volver a detectar' : 'Detectar movimientos'}
            </button>
          )}

          {cls && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ink-2)' }}>
              <input type="checkbox" checked={experimental} onChange={(e) => setExperimental(e.target.checked)} disabled={busy} />
              Incluir efectos experimentales (arco, estela, ecos)
            </label>
          )}
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const title = newTitle.trim();
            if (!title) return;
            try {
              const id = await createClass(uid, { title, schedule: { day: '—', time: '', timezone: 'CET' }, capacity: 1, status: 'scheduled' });
              setNewTitle('');
              setClassId(id);
            } catch (err: any) {
              setStatus({ kind: 'error', text: `No se pudo crear la clase: ${err?.message ?? 'error desconocido'}` });
            }
          }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}
        >
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={classes.length ? 'Título de otra clase…' : 'Aún no tienes clases: escribe el título de la primera…'}
            aria-label="Título de la nueva clase"
            maxLength={120}
            disabled={busy}
            style={{ flex: '1 1 240px', padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--hair)', background: 'var(--glass-2)', color: 'var(--ink)' }}
          />
          <button type="submit" disabled={busy || !newTitle.trim()} style={{ ...btn('ghost'), opacity: busy || !newTitle.trim() ? 0.5 : 1 }}>Nueva clase</button>
        </form>

        {status.kind !== 'idle' && (
          <div role="status" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: status.kind === 'error' ? '#FF6B6B' : 'var(--ink-2)' }}>
            <span style={{ flex: 1 }}>{status.text}{status.kind === 'busy' && status.progress !== undefined ? ` ${Math.round(status.progress * 100)}%` : ''}</span>
            {status.kind === 'busy' && status.text.startsWith('Detectando') && (
              <button type="button" onClick={() => abortRef.current?.abort()} style={btn('ghost')}>Cancelar</button>
            )}
          </div>
        )}
        {status.kind === 'busy' && status.progress !== undefined && (
          <div style={{ height: '4px', borderRadius: '2px', background: 'var(--glass-2)', overflow: 'hidden' }}>
            <div style={{ width: `${Math.round(status.progress * 100)}%`, height: '100%', background: 'var(--pink)', transition: 'width .2s' }} />
          </div>
        )}
      </div>

      {cls && eventsVideoUrl !== undefined && (cls.videoUrl ?? null) !== eventsVideoUrl && (
        <div role="alert" style={{ ...card, ...muted, color: '#FF6B6B' }}>
          El video de esta clase cambió (quizá en otra pestaña). Estas figuras eran del video anterior: vuelve a detectar antes de guardar.
        </div>
      )}

      {cls && videoUrl && (
        <div style={card}>
          <MotionEditor key={editorKey} videoUrl={videoUrl} events={events} initiallyAccepted={fromSaved} saving={saving} onSave={save} />
        </div>
      )}
      {cls && !videoUrl && <div style={{ ...card, ...muted }}>Esta clase todavía no tiene video. Súbelo para empezar.</div>}
    </div>
  );
}
