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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header with improved styling */}
      <div className="flex items-center justify-between p-5 border-b border-purple-500/20 bg-black/40 backdrop-blur">
        <div>
          <h1 className="text-2xl font-black text-white">🎬 Motion Recognition Editor</h1>
          <p className="text-xs text-slate-400 mt-1">
            {state.events.length} effect{state.events.length !== 1 ? 's' : ''} detected
            {state.isDetecting && ` • Detecting... ${Math.round(state.detectionProgress * 100)}%`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => runDetection()}
            disabled={state.isDetecting}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
          >
            {state.isDetecting ? `Detecting...` : '🔄 Re-detect'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition shadow-lg shadow-emerald-500/30"
          >
            ✓ Save & Publish
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>

      {state.detectionError && (
        <div className="bg-red-900/80 border-b border-red-500 text-red-100 p-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span><strong>Detection Error:</strong> {state.detectionError}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Video player with overlay (left) */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-purple-500/30">
            <div className="relative aspect-video">
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

              {/* Current time indicator */}
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 text-white text-xs font-mono">
                {formatTime(state.currentTimeMs)}
              </div>
            </div>

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
          <div className="bg-slate-800/50 backdrop-blur rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={togglePlayPause}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
                title={state.isPlaying ? 'Pause' : 'Play'}
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
                  className="w-full cursor-pointer"
                />
              </div>
              <span className="text-sm font-mono text-slate-300 whitespace-nowrap">
                {formatTime(state.currentTimeMs)} / {formatTime(videoDurationMs)}
              </span>
            </div>

            {/* Speed controls */}
            <div className="flex gap-2">
              {[0.5, 0.75, 1, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    const video = videoRef.current;
                    if (video) video.playbackRate = speed;
                  }}
                  className="text-xs px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                >
                  {speed}×
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Layers panel (right) */}
        <div className="w-80 flex flex-col gap-3 bg-slate-800/50 backdrop-blur rounded-xl p-4 overflow-y-auto border border-slate-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-white text-lg">Effects Panel</h2>
            <span className="px-2 py-1 rounded-full bg-purple-600/30 text-purple-300 text-xs font-mono font-bold">
              {state.events.length} total
            </span>
          </div>

          {/* Effect type visibility toggles */}
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-700/50">
            {[
              { type: 'torso_grid' as const, label: 'Grid', emoji: '📦' },
              { type: 'arm_line' as const, label: 'Arm Line', emoji: '📍' },
              { type: 'elbow_triangle' as const, label: 'Elbow 90°', emoji: '△' },
              { type: 'grid_points' as const, label: 'Points', emoji: '●' },
              { type: 'rotation_arc' as const, label: 'Arc', emoji: '◯' },
              { type: 'wrist_trail' as const, label: 'Trail', emoji: '✨' },
              { type: 'pose_echo' as const, label: 'Echo', emoji: '👻' },
            ].map(({ type, label, emoji }) => (
              <button
                key={type}
                onClick={() => toggleEffectType(type)}
                className={`text-xs px-2 py-1.5 rounded-lg font-semibold transition ${
                  state.visibleEffectTypes.has(type)
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
                title={`Toggle ${label}`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>

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
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm mb-3">No effects detected yet</p>
              <button
                onClick={() => runDetection()}
                className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 text-sm font-semibold transition"
              >
                🔍 Run Detection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline (bottom) */}
      <div className="border-t border-purple-500/20 p-4 bg-slate-900/50 backdrop-blur">
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
