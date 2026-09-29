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
  rotation_arc: '#FF6B9D',
  wrist_trail: '#C41E3A',
  pose_echo: '#FFD700',
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
        className="flex items-center gap-2 cursor-pointer"
        onClick={onSelect}
      >
        {/* Color indicator */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: event.color || EFFECT_COLORS[event.type] || '#888' }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-ink-1 capitalize">
            {event.type.replace(/_/g, ' ')} {event.side && `(${event.side})`}
          </p>
          <p className="text-xs text-ink-3">
            {formatTime(event.startMs)} → {formatTime(event.endMs)} ({formatDuration(event.endMs - event.startMs)})
          </p>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          {event.detectedAutomatically && !event.editedManually && (
            <span className="text-xs bg-blue text-white px-2 py-1 rounded">Auto</span>
          )}
          {event.editedManually && (
            <span className="text-xs bg-purple text-white px-2 py-1 rounded">Edited</span>
          )}
        </div>
      </div>

      {/* Action buttons (always visible for selected item) */}
      {isSelected && (
        <div className="flex gap-1 mt-2 pt-2 border-t border-ink-3">
          {event.detectedAutomatically && (
            <button
              onClick={onAccept}
              className="flex-1 px-2 py-1.5 rounded text-xs bg-green text-white hover:bg-green-bright flex items-center justify-center gap-1 transition"
              title="Mark as accepted"
            >
              <Check size={12} />
              Accept
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex-1 px-2 py-1.5 rounded text-xs bg-red text-white hover:bg-red-bright flex items-center justify-center gap-1 transition"
            title="Delete this effect"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )}

      {/* Timing adjustments (for selected item) */}
      {isSelected && (
        <div className="mt-2 pt-2 border-t border-ink-3 space-y-2">
          <div>
            <label className="text-xs text-ink-2 block mb-1">Start (ms)</label>
            <input
              type="number"
              value={event.startMs}
              onChange={(e) => onUpdate({ startMs: Number(e.target.value) })}
              className="w-full px-2 py-1 rounded text-xs bg-ink-3 text-ink-1 border border-hair"
            />
          </div>
          <div>
            <label className="text-xs text-ink-2 block mb-1">End (ms)</label>
            <input
              type="number"
              value={event.endMs}
              onChange={(e) => onUpdate({ endMs: Number(e.target.value) })}
              className="w-full px-2 py-1 rounded text-xs bg-ink-3 text-ink-1 border border-hair"
            />
          </div>
          <div>
            <label className="text-xs text-ink-2 block mb-1">Color</label>
            <input
              type="color"
              value={event.color || EFFECT_COLORS[event.type] || '#888'}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-full px-2 py-1 rounded text-xs bg-ink-3 border border-hair h-8"
            />
          </div>
          <div>
            <label className="text-xs text-ink-2 block mb-1">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={event.opacity ?? 0.8}
              onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
              className="w-full"
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
