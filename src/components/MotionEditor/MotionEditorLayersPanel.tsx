import { useState } from 'react';
import type { FigureEffectType, FigureEvent } from '../../types/motionRecognition';
import { EFFECT_PLUGINS } from '../../lib/motionRecognition/effects';
import { btn, fmtPrecise, label } from './ui';

interface Props {
  events: FigureEvent[];
  accepted: Set<string>;
  mutedTypes: Set<FigureEffectType>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAccept: (ids: string[]) => void;
  onDelete: (id: string) => void;
  onToggleMute: (type: FigureEffectType) => void;
}

// Panel de capas: un grupo por tipo (silenciar, aceptar todo) y, al abrirlo, sus eventos uno por uno.
export default function MotionEditorLayersPanel({ events, accepted, mutedTypes, selectedId, onSelect, onAccept, onDelete, onToggleMute }: Props) {
  const [open, setOpen] = useState<FigureEffectType | null>(null);
  const groups = EFFECT_PLUGINS.map((p) => ({ plugin: p, items: events.filter((e) => e.type === p.type) })).filter((g) => g.items.length);
  const pending = events.filter((e) => !accepted.has(e.id) && !mutedTypes.has(e.type)).map((e) => e.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={label}>Capas</span>
        <button type="button" disabled={!pending.length} onClick={() => onAccept(pending)} style={{ ...btn('ghost'), opacity: pending.length ? 1 : 0.5 }}>
          Aceptar todas ({pending.length})
        </button>
      </div>
      {groups.map(({ plugin, items }) => {
        const isMuted = mutedTypes.has(plugin.type);
        const nAccepted = items.filter((e) => accepted.has(e.id)).length;
        const isOpen = open === plugin.type;
        return (
          <div key={plugin.type} style={{ borderRadius: '12px', border: '1px solid var(--hair-soft)', background: 'var(--glass-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px' }}>
              <span style={{ width: '4px', alignSelf: 'stretch', borderRadius: '2px', background: isMuted ? 'var(--hair)' : plugin.defaultColor }} />
              <button type="button" onClick={() => setOpen(isOpen ? null : plugin.type)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--ink)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{isOpen ? '▾' : '▸'} {plugin.label}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-3)' }}>{nAccepted}/{items.length} aceptadas · {plugin.description}</div>
              </button>
              <button type="button" onClick={() => onToggleMute(plugin.type)} style={btn('ghost')} aria-pressed={isMuted}>
                {isMuted ? 'Silenciado' : 'Silenciar'}
              </button>
            </div>
            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '260px', overflowY: 'auto', borderTop: '1px solid var(--hair-soft)' }}>
                {items.map((e) => {
                  const isAccepted = accepted.has(e.id);
                  return (
                    <div
                      key={e.id}
                      onClick={() => onSelect(e.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', cursor: 'pointer', background: selectedId === e.id ? 'var(--glass)' : undefined }}
                    >
                      <span style={{ flex: 1, fontFamily: '"Geist Mono", monospace', fontSize: '11.5px', color: 'var(--ink-2)' }}>
                        {fmtPrecise(e.startMs)}–{fmtPrecise(e.endMs)}{e.side ? ` · ${e.side === 'L' ? 'izq.' : 'der.'}` : ''}
                      </span>
                      {isAccepted
                        ? <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-2)' }}>✓ Aceptada</span>
                        : <button type="button" onClick={(ev) => { ev.stopPropagation(); onAccept([e.id]); }} style={btn('ghost')}>Aceptar</button>}
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); onDelete(e.id); }} style={btn('danger')} aria-label="Eliminar figura">Eliminar</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
