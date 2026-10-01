/**
 * Layers panel for editing figure events.
 * Shows all detected events with controls to accept, delete, or modify.
 */

import React from 'react';
import { Trash2, Check, Eye, EyeOff } from 'lucide-react';
import { FigureEvent, FigureEffectType } from '../../types/motionRecognition';

interface MotionEditorLayersPanelProps {
  events: FigureEvent[];
  selectedEventId?: string;
  visibleEffectTypes: Set<FigureEffectType>;
  onSelectEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onAcceptEvent: (eventId: string) => void;
  onToggleEffectType: (type: FigureEffectType) => void;
  onUpdateEvent: (eventId: string, updates: Partial<FigureEvent>) => void;
}

const EFFECT_COLORS: Record<string, string> = {
  torso_grid: '#00D9FF',
  arm_line: '#FF00FF',
  elbow_triangle: '#FFAA00',
  grid_points: '#00FF00',
  rotation_arc: '#FFD400',
  wrist_trail: '#00FFFF',
  pose_echo: '#FFAA00',
};

const EFFECT_DESCRIPTIONS: Record<string, string> = {
  torso_grid: 'Grid anchored to shoulders & hips',
  arm_line: 'Extended arm visualization',
  elbow_triangle: '~90° elbow angle marker',
  grid_points: 'Grid intersection points',
  rotation_arc: 'Wrist rotation sweep',
  wrist_trail: 'Motion trail of wrist',
  pose_echo: 'Ghost pose silhouettes',
};

export default function MotionEditorLayersPanel({
  events,
  selectedEventId,
  visibleEffectTypes,
  onSelectEvent,
  onDeleteEvent,
  onAcceptEvent,
  onToggleEffectType,
  onUpdateEvent,
}: MotionEditorLayersPanelProps) {
  // Get unique effect types
  const effectTypes = Array.from(new Set(events.map((e) => e.type))) as FigureEffectType[];

  // Group events by type
  const eventsByType = new Map<FigureEffectType, FigureEvent[]>();
  for (const event of events) {
    if (!eventsByType.has(event.type)) {
      eventsByType.set(event.type, []);
    }
    eventsByType.get(event.type)!.push(event);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Effect type toggles */}
      <div className="border-b border-hair pb-3">
        <h3 className="text-xs font-semibold text-ink-2 mb-2 uppercase">Effect Types</h3>
        <div className="space-y-1">
          {effectTypes.map((type) => (
            <button
              key={type}
              onClick={() => onToggleEffectType(type)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs hover:bg-glass-bright transition"
            >
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: EFFECT_COLORS[type] || '#888' }}
              />
              <span className="flex-1 text-left capitalize">{type.replace(/_/g, ' ')}</span>
              {visibleEffectTypes.has(type) ? (
                <Eye size={14} className="text-ink-2" />
              ) : (
                <EyeOff size={14} className="text-ink-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-xs text-ink-3 text-center py-4">No effects</p>
        ) : (
          events.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              isSelected={selectedEventId === event.id}
              onSelect={() => onSelectEvent(event.id)}
              onDelete={() => onDeleteEvent(event.id)}
              onAccept={() => onAcceptEvent(event.id)}
              onUpdate={(updates) => onUpdateEvent(event.id, updates)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface EventRowProps {
  event: FigureEvent;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onAccept: () => void;
  onUpdate: (updates: Partial<FigureEvent>) => void;
}

function EventRow({
  event,
  isSelected,
  onSelect,
  onDelete,
  onAccept,
  onUpdate,
}: EventRowProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div
      className={`rounded-lg p-2 border transition ${
        isSelected ? 'border-yellow bg-glass-bright' : 'border-hair hover:border-ink-2 bg-ink-4'
      }`}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
        onClick={onSelect}
      >
        {/* Color indicator */}
        <div
          className="w-4 h-4 rounded-full flex-shrink-0 shadow-lg"
          style={{ backgroundColor: event.color || EFFECT_COLORS[event.type] || '#888' }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-white capitalize">
              {event.type.replace(/_/g, ' ')} {event.side && `(${event.side})`}
            </p>
            {event.editedManually && (
              <span className="text-xs bg-yellow-600/50 text-yellow-200 px-1.5 py-0.5 rounded">✎ Edited</span>
            )}
            {event.detectedAutomatically && !event.editedManually && (
              <span className="text-xs bg-blue-600/50 text-blue-200 px-1.5 py-0.5 rounded">✓ Auto</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {formatTime(event.startMs)} → {formatTime(event.endMs)} ({formatDuration(event.endMs - event.startMs)})
          </p>
          <p className="text-xs text-slate-500">
            {EFFECT_DESCRIPTIONS[event.type] || 'Motion effect'}
          </p>
        </div>
      </div>

      {/* Action buttons (always visible for selected item) */}
      {isSelected && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
          {event.detectedAutomatically && (
            <button
              onClick={onAccept}
              className="flex-1 px-3 py-2 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
              title="Mark as accepted (no longer auto-detected)"
            >
              <Check size={14} />
              Accept
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex-1 px-3 py-2 rounded-lg text-xs bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-1.5 transition shadow-lg shadow-red-600/20"
            title="Delete this effect"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      {/* Customization section (for selected item) */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-semibold">Start</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={Math.round(event.startMs)}
                  onChange={(e) => onUpdate({ startMs: Number(e.target.value) })}
                  className="flex-1 px-2 py-1.5 rounded text-xs bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400">ms</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-semibold">End</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={Math.round(event.endMs)}
                  onChange={(e) => onUpdate({ endMs: Number(e.target.value) })}
                  className="flex-1 px-2 py-1.5 rounded text-xs bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400">ms</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-semibold">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={event.color || EFFECT_COLORS[event.type] || '#888'}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-10 h-8 rounded cursor-pointer border border-slate-600"
              />
              <span className="text-xs text-slate-400 font-mono">
                {(event.color || EFFECT_COLORS[event.type] || '#888').toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-semibold">
              Opacity: {Math.round((event.opacity ?? 0.8) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={event.opacity ?? 0.8}
              onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
              className="w-full cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatDuration(ms: number): string {
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}
