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
  rotation_arc: '#FF6B9D',
  wrist_trail: '#C41E3A',
  pose_echo: '#FFD700',
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
    <div className="space-y-2">
      {/* Ruler with time markers */}
      <div className="relative border-b border-hair pb-2">
        <div className="text-xs text-ink-3 flex justify-between px-2 mb-1">
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
      {Array.from(eventsByType.entries()).map(([type, typeEvents]) => (
        <div key={type} className="flex items-center gap-2 text-sm">
          <div className="w-20 text-xs text-ink-2 truncate">{type.replace(/_/g, ' ')}</div>
          <div
            className="relative bg-ink-4 rounded h-12 flex-1 cursor-pointer border border-hair hover:border-ink-2"
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
                  className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-yellow' : 'hover:opacity-80'
                  }`}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: event.color || EFFECT_COLORS[event.type] || '#888',
                    opacity: isSelected ? 1 : 0.7,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEvent(event.id);
                  }}
                  title={`${event.type} (${event.side || 'center'}): ${formatTime(event.startMs)} - ${formatTime(event.endMs)}`}
                />
              );
            })}

            {/* Current time indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500"
              style={{
                left: `${(currentTimeMs / videoDurationMs) * 100}%`,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <div className="text-center py-4 text-ink-3 text-sm">No events detected</div>
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
