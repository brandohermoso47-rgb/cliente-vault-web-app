/**
 * Motion Recognition Editor
 *
 * Instructor workflow:
 * 1. Upload/record video
 * 2. Run pose detection (generates figure events)
 * 3. Edit events: accept, delete, adjust timing
 * 4. Save and publish
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Grid3x3,
  Zap,
  Volume2,
  RotateCcw,
} from 'lucide-react';
import {
  FigureEvent,
  MotionRecognitionData,
  FigureEffectType,
  DetectionSession,
} from '../../types/motionRecognition';
import { detectMotionEvents, getAllEffectPlugins } from '../../lib/motionRecognition';
import MotionEditorTimeline from './MotionEditorTimeline';
import MotionEditorLayersPanel from './MotionEditorLayersPanel';
import MotionPlayerOverlay from './MotionPlayerOverlay';

interface MotionEditorProps {
  videoUrl: string;
  videoDurationMs: number;
  classId: string;
  instructorId: string;
  onSave: (data: MotionRecognitionData) => void;
  onCancel: () => void;
  initialData?: MotionRecognitionData;
}

interface EditorState {
  currentTimeMs: number;
  isPlaying: boolean;
  isDetecting: boolean;
  detectionProgress: number;
  detectionError?: string;
  events: FigureEvent[];
  selectedEventId?: string;
  visibleEffectTypes: Set<FigureEffectType>;
}

export default function MotionEditor({
  videoUrl,
  videoDurationMs,
  classId,
  instructorId,
  onSave,
  onCancel,
  initialData,
}: MotionEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, setState] = useState<EditorState>({
    currentTimeMs: 0,
    isPlaying: false,
    isDetecting: false,
    detectionProgress: 0,
    events: initialData?.events || [],
    visibleEffectTypes: new Set([
      'torso_grid',
      'arm_line',
      'elbow_triangle',
      'grid_points',
    ]),
  });

  // ==================== Lifecycle ====================

  useEffect(() => {
    // Auto-run detection if no initial data
    if (!initialData && videoUrl) {
      runDetection();
    }
  }, [videoUrl, initialData]);

  useEffect(() => {
    // Sync video playback with state
    const video = videoRef.current;
    if (!video) return;

    if (state.isPlaying) {
      video.play();
    } else {
      video.pause();
    }
  }, [state.isPlaying]);

  // ==================== Detection ====================

  async function runDetection() {
    setState((s) => ({ ...s, isDetecting: true, detectionProgress: 0, detectionError: undefined }));

    try {
      const detected = await detectMotionEvents(videoUrl, videoDurationMs, (progress) => {
        setState((s) => ({ ...s, detectionProgress: progress }));
      });

      setState((s) => ({
        ...s,
        events: detected,
        isDetecting: false,
      }));
    } catch (error) {
      setState((s) => ({
        ...s,
        isDetecting: false,
        detectionError: error instanceof Error ? error.message : 'Detection failed',
      }));
    }
  }

  // ==================== Event Editing ====================

  function deleteEvent(eventId: string) {
    setState((s) => ({
      ...s,
      events: s.events.filter((e) => e.id !== eventId),
      selectedEventId: s.selectedEventId === eventId ? undefined : s.selectedEventId,
    }));
  }

  function acceptEvent(eventId: string) {
    setState((s) => ({
      ...s,
      events: s.events.map((e) =>
        e.id === eventId ? { ...e, detectedAutomatically: false } : e
      ),
    }));
  }

  function updateEvent(eventId: string, updates: Partial<FigureEvent>) {
    setState((s) => ({
      ...s,
      events: s.events.map((e) => (e.id === eventId ? { ...e, ...updates, editedManually: true } : e)),
    }));
  }

  function toggleEffectType(type: FigureEffectType) {
    setState((s) => {
      const newVisible = new Set(s.visibleEffectTypes);
      if (newVisible.has(type)) {
        newVisible.delete(type);
      } else {
        newVisible.add(type);
      }
      return { ...s, visibleEffectTypes: newVisible };
    });
  }

  // ==================== Playback ====================

  function togglePlayPause() {
    setState((s) => ({ ...s, isPlaying: !s.isPlaying }));
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (video) {
      setState((s) => ({ ...s, currentTimeMs: video.currentTime * 1000 }));
    }
  }

  function handleTimelineClick(timeMs: number) {
    const video = videoRef.current;
    if (video) {
      video.currentTime = timeMs / 1000;
      setState((s) => ({ ...s, currentTimeMs: timeMs }));
    }
  }

  // ==================== Save ====================

  function handleSave() {
    const data: MotionRecognitionData = {
      id: initialData?.id || `motion-${Date.now()}`,
      classId,
      videoUrl,
      videoDurationMs,
      events: state.events,
      masterSettings: {
        gridSpacing: 30,
        arcResolution: 15,
        trailLength: 20,
      },
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: instructorId,
    };

    onSave(data);
  }

  // ==================== Render ====================

  const visibleEvents = state.events.filter((e) => state.visibleEffectTypes.has(e.type));

  return (
    <div className="flex flex-col h-screen bg-dark-1">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-hair">
        <h1 className="text-xl font-bold text-ink-1">Motion Recognition Editor</h1>
        <div className="flex gap-2">
          <button
            onClick={() => runDetection()}
            disabled={state.isDetecting}
            className="px-4 py-2 rounded-lg bg-blue text-white disabled:opacity-50"
          >
            {state.isDetecting ? `Detecting... ${Math.round(state.detectionProgress * 100)}%` : 'Re-detect'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-green text-white hover:bg-green-bright"
          >
            Save & Publish
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-ink-3 text-ink-1 hover:bg-ink-2"
          >
            Cancel
          </button>
        </div>
      </div>

      {state.detectionError && (
        <div className="bg-red-900 border-b border-red-500 text-red-100 p-3">
          {state.detectionError}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Video player with overlay (left) */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              width={1280}
              height={720}
            />

            {/* Playback overlay */}
            <MotionPlayerOverlay
              events={visibleEvents}
              currentTimeMs={state.currentTimeMs}
              videoWidth={1280}
              videoHeight={720}
              canvasRef={canvasRef}
            />
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-lg bg-glass hover:bg-glass-bright"
            >
              {state.isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={videoDurationMs}
                value={state.currentTimeMs}
                onChange={(e) => handleTimelineClick(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <span className="text-sm text-ink-2">
              {formatTime(state.currentTimeMs)} / {formatTime(videoDurationMs)}
            </span>
          </div>
        </div>

        {/* Layers panel (right) */}
        <div className="w-72 flex flex-col gap-2 bg-glass rounded-lg p-4 overflow-y-auto">
          <h2 className="font-semibold text-ink-1 mb-2">Effects ({state.events.length})</h2>

          <MotionEditorLayersPanel
            events={state.events}
            selectedEventId={state.selectedEventId}
            visibleEffectTypes={state.visibleEffectTypes}
            onSelectEvent={(id) => setState((s) => ({ ...s, selectedEventId: id }))}
            onDeleteEvent={deleteEvent}
            onAcceptEvent={acceptEvent}
            onToggleEffectType={toggleEffectType}
            onUpdateEvent={updateEvent}
          />

          {state.events.length === 0 && (
            <div className="text-center py-8 text-ink-3">
              <p>No effects detected yet.</p>
              <button
                onClick={() => runDetection()}
                className="mt-3 px-3 py-2 bg-blue text-white rounded hover:bg-blue-bright text-sm"
              >
                Run Detection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline (bottom) */}
      <div className="border-t border-hair p-4 bg-glass">
        <MotionEditorTimeline
          events={state.events}
          currentTimeMs={state.currentTimeMs}
          videoDurationMs={videoDurationMs}
          selectedEventId={state.selectedEventId}
          onTimelineClick={handleTimelineClick}
          onSelectEvent={(id) => setState((s) => ({ ...s, selectedEventId: id }))}
        />
      </div>
    </div>
  );
}

// ==================== Utilities ====================

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
