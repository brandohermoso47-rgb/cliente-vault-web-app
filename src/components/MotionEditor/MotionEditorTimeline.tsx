/**
 * Timeline view for motion recognition events.
 * Shows events as blocks on a time axis.
 */

import React from 'react';
import { FigureEvent } from '../../types/motionRecognition';

interface MotionEditorTimelineProps {
  events: FigureEvent[];
  currentTimeMs: number;
  videoDurationMs: number;
  selectedEventId?: string;
  onTimelineClick: (timeMs: number) => void;
  onSelectEvent: (eventId: string) => void;
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

const EFFECT_ICONS: Record<string, string> = {
  torso_grid: '📦',
  arm_line: '📍',
  elbow_triangle: '△',
  grid_points: '●',
  rotation_arc: '◯',
  wrist_trail: '✨',
  pose_echo: '👻',
};

export default function MotionEditorTimeline({
  events,
  currentTimeMs,
  videoDurationMs,
  selectedEventId,
  onTimelineClick,
  onSelectEvent,
}: MotionEditorTimelineProps) {
  const timelineWidth = 1000;
  const pixelPerMs = timelineWidth / videoDurationMs;

  // Group events by type
  const eventsByType = new Map<string, FigureEvent[]>();
  for (const event of events) {
    if (!eventsByType.has(event.type)) {
      eventsByType.set(event.type, []);
    }
    eventsByType.get(event.type)!.push(event);
  }

  return (
    <div className="space-y-3">
      {/* Ruler with time markers */}
      <div className="relative border-b border-purple-500/20 pb-2">
        <div className="text-xs text-slate-400 flex justify-between px-2 mb-1 font-mono font-semibold">
          <span>0:00</span>
          <span>{formatTime(videoDurationMs / 4)}</span>
          <span>{formatTime(videoDurationMs / 2)}</span>
          <span>{formatTime((videoDurationMs * 3) / 4)}</span>
          <span>{formatTime(videoDurationMs)}</span>
        </div>
        <svg width={timelineWidth} height={40} className="w-full border-l border-hair">
          {/* Major tick marks */}
          {Array.from({ length: 5 }).map((_, i) => {
            const x = (timelineWidth / 4) * i;
            return (
              <line
                key={i}
                x1={x}
                y1={30}
                x2={x}
                y2={40}
                stroke="currentColor"
                className="text-ink-3"
              />
            );
          })}

          {/* Minor tick marks */}
          {Array.from({ length: 40 }).map((_, i) => {
            const x = (timelineWidth / 40) * i;
            return (
              <line
                key={`minor-${i}`}
                x1={x}
                y1={35}
                x2={x}
                y2={40}
                stroke="currentColor"
                className="text-ink-4"
              />
            );
          })}

          {/* Current time indicator */}
          <line
            x1={currentTimeMs * pixelPerMs}
            y1={0}
            x2={currentTimeMs * pixelPerMs}
            y2={40}
            stroke="#FF0000"
            strokeWidth={2}
          />
        </svg>
      </div>

      {/* Event rows */}
      <div className="space-y-2">
        {Array.from(eventsByType.entries()).map(([type, typeEvents]) => (
          <div key={type} className="flex items-center gap-2 text-sm">
            <div className="w-32 text-xs text-slate-400 truncate font-semibold flex items-center gap-1.5">
              <span className="text-lg">{EFFECT_ICONS[type] || '●'}</span>
              {type.replace(/_/g, ' ')}
              <span className="text-purple-400">({typeEvents.length})</span>
            </div>
            <div
              className="relative bg-slate-800/50 rounded-lg h-10 flex-1 cursor-pointer border border-slate-700/50 hover:border-purple-500/50 transition"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const timeMs = (x / rect.width) * videoDurationMs;
                onTimelineClick(timeMs);
              }}
            >
              {/* Event blocks */}
              {typeEvents.map((event) => {
                const left = (event.startMs / videoDurationMs) * 100;
                const width = ((event.endMs - event.startMs) / videoDurationMs) * 100;
                const isSelected = selectedEventId === event.id;

                return (
                  <div
                    key={event.id}
                    className={`absolute top-0.5 bottom-0.5 rounded-md cursor-pointer transition-all group ${
                      isSelected
                        ? 'ring-2 ring-purple-400 shadow-lg shadow-purple-500/50 z-10'
                        : 'hover:shadow-md'
                    }`}
                    style={{
                      left: `${left}%`,
                      width: `${Math.max(2, width)}%`,
                      backgroundColor: event.color || EFFECT_COLORS[event.type] || '#888',
                      opacity: isSelected ? 1 : 0.6,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(event.id);
                    }}
                    title={`${event.type}${event.side ? ` (${event.side})` : ''}: ${formatTime(event.startMs)} - ${formatTime(event.endMs)}`}
                  >
                    {/* Duration label on hover */}
                    {width > 8 && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition pointer-events-none">
                        {formatDuration(event.endMs - event.startMs)}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Current time indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 via-red-400 to-red-500 shadow-lg"
                style={{
                  left: `${(currentTimeMs / videoDurationMs) * 100}%`,
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-6 text-slate-400 text-sm">
          📊 No effects detected yet. Run detection to get started.
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
