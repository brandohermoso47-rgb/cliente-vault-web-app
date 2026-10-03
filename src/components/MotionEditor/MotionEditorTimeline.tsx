import type { FigureEffectType, FigureEvent } from '../../types/motionRecognition';
import { EFFECT_PLUGINS } from '../../lib/motionRecognition/effects';
import { fmtTime } from './ui';

interface Props {
  events: FigureEvent[];
  accepted: Set<string>;
  mutedTypes: Set<FigureEffectType>;
  durationMs: number;
  currentMs: number;
  selectedId: string | null;
  onSeek: (ms: number) => void;
  onSelect: (id: string) => void;
}

// Una fila por tipo de efecto; cada bloque es un evento. Lo propuesto se ve tenue, lo aceptado sólido.
export default function MotionEditorTimeline({ events, accepted, mutedTypes, durationMs, currentMs, selectedId, onSeek, onSelect }: Props) {
  const total = Math.max(durationMs, 1);
  const pct = (ms: number) => `${Math.min(100, Math.max(0, (ms / total) * 100))}%`;
  const rows = EFFECT_PLUGINS.filter((p) => events.some((e) => e.type === p.type));

  if (!rows.length) return <div style={{ fontSize: '12.5px', color: 'var(--ink-3)' }}>Todavía no hay figuras. Corre la detección para obtener propuestas.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: '150px', fontFamily: '"Geist Mono", monospace', fontSize: '10.5px', color: 'var(--ink-3)' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => <span key={f}>{fmtTime(total * f)}</span>)}
      </div>
      {rows.map((p) => {
        const rowEvents = events.filter((e) => e.type === p.type);
        const isMuted = mutedTypes.has(p.type);
        return (
          <div key={p.type} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: isMuted ? 0.35 : 1 }}>
            <div style={{ width: '140px', flex: 'none', fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.label} <span style={{ color: 'var(--ink-3)' }}>({rowEvents.length})</span>
            </div>
            <div
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                onSeek(((e.clientX - r.left) / r.width) * total);
              }}
              style={{ position: 'relative', flex: 1, height: '22px', borderRadius: '6px', background: 'var(--glass-2)', border: '1px solid var(--hair-soft)', cursor: 'pointer' }}
            >
              {rowEvents.map((e) => {
                const isAccepted = accepted.has(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    title={`${p.label}${e.side ? ` (${e.side === 'L' ? 'izq.' : 'der.'})` : ''} · ${fmtTime(e.startMs)}–${fmtTime(e.endMs)}${isAccepted ? ' · aceptada' : ' · propuesta'}`}
                    onClick={(ev) => { ev.stopPropagation(); onSelect(e.id); onSeek(e.startMs); }}
                    style={{
                      position: 'absolute', top: '3px', bottom: '3px', left: pct(e.startMs),
                      width: `max(3px, ${((e.endMs - e.startMs) / total) * 100}%)`,
                      padding: 0, border: selectedId === e.id ? '2px solid var(--ink)' : 'none', borderRadius: '3px', cursor: 'pointer',
                      background: e.color ?? p.defaultColor, opacity: isAccepted ? 0.95 : 0.4,
                    }}
                  />
                );
              })}
              <div style={{ position: 'absolute', top: '-2px', bottom: '-2px', left: pct(currentMs), width: '2px', background: 'var(--pink)', pointerEvents: 'none' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
