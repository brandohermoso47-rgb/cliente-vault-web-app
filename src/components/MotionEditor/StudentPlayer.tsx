/**
 * Student Player for Waack On classes.
 * Lightweight video player with motion recognition overlays.
 *
 * This is what students see when watching a class with motion recognition.
 * No MediaPipe - just reads pre-calculated figure events and renders them.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { FigureEvent, MotionRecognitionData } from '../../types/motionRecognition';
import MotionPlayerOverlay from './MotionPlayerOverlay';

interface StudentPlayerProps {
  videoUrl: string;
  motionData?: MotionRecognitionData;
  title?: string;
  showControls?: boolean;
}

interface PlayerState {
  isPlaying: boolean;
  currentTimeMs: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  visibleEffectTypes: Set<string>;
  videoWidth: number;
  videoHeight: number;
}

export default function StudentPlayer({
  videoUrl,
  motionData,
  title = 'Class Video',
  showControls = true,
}: StudentPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTimeMs: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    videoWidth: 0,
    videoHeight: 0,
    visibleEffectTypes: new Set(
      motionData?.events.map((e) => e.type) || []
    ),
  });

  const [showSettings, setShowSettings] = useState(false);

  // ==================== Lifecycle ====================

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Sync playback with state
    if (state.isPlaying) {
      video.play();
    } else {
      video.pause();
    }

    video.volume = state.isMuted ? 0 : state.volume;
    video.playbackRate = state.playbackRate;
  }, [state.isPlaying, state.volume, state.isMuted, state.playbackRate]);

  // ==================== Event Handlers ====================

  function togglePlayPause() {
    setState((s) => ({ ...s, isPlaying: !s.isPlaying }));
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (video) {
      setState((s) => ({ ...s, currentTimeMs: video.currentTime * 1000 }));
    }
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (video) {
      setState((s) => ({
        ...s,
        duration: video.duration * 1000,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      }));
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const timeMs = Number(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.currentTime = timeMs / 1000;
      setState((s) => ({ ...s, currentTimeMs: timeMs }));
    }
  }

  function toggleEffectType(type: string) {
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

  function handleFullscreen() {
    const container = document.querySelector('[data-player]');
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  }

  // ==================== Render ====================

  const visibleEvents =
    motionData?.events.filter((e) => state.visibleEffectTypes.has(e.type)) || [];
  const effectTypes = Array.from(
    new Set(motionData?.events.map((e) => e.type) || [])
  );

  return (
    <div data-player className="flex flex-col bg-black rounded-lg overflow-hidden max-w-4xl mx-auto">
      {/* Video container */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-contain"
        />

        {/* Canvas overlay for effects */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        <MotionPlayerOverlay
          events={visibleEvents}
          currentTimeMs={state.currentTimeMs}
          videoWidth={state.videoWidth}
          videoHeight={state.videoHeight}
          canvasRef={canvasRef}
        />

        {/* Play button overlay (when paused) */}
        {!state.isPlaying && state.currentTimeMs === 0 && (
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/30 transition"
          >
            <Play size={80} className="text-white fill-white" />
          </button>
        )}
      </div>

      {showControls && (
        <>
          {/* Progress bar */}
          <div className="bg-ink-4 px-4 py-3 border-t border-ink-3">
            <input
              type="range"
              min="0"
              max={state.duration}
              value={state.currentTimeMs}
              onChange={handleSeek}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between items-center text-xs text-ink-2 mt-1">
              <span>{formatTime(state.currentTimeMs)}</span>
              <span>{formatTime(state.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-ink-4 px-4 py-3 border-t border-ink-3 flex items-center justify-between gap-4">
            {/* Left controls: play, volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="p-2 rounded-lg hover:bg-glass transition"
              >
                {state.isPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} className="fill-current" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setState((s) => ({ ...s, isMuted: !s.isMuted }))
                  }
                  className="p-1 rounded hover:bg-glass transition"
                >
                  {state.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={state.isMuted ? 0 : state.volume}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      volume: Number(e.target.value),
                      isMuted: false,
                    }))
                  }
                  className="w-20"
                />
              </div>
            </div>

            {/* Center: title */}
            <div className="flex-1 text-center">
              <h3 className="text-sm font-medium text-ink-1">{title}</h3>
            </div>

            {/* Right controls: settings, playback rate, fullscreen */}
            <div className="flex items-center gap-2">
              {/* Playback speed */}
              <div className="relative">
                <select
                  value={state.playbackRate}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      playbackRate: Number(e.target.value),
                    }))
                  }
                  className="px-2 py-1 rounded text-xs bg-ink-3 border border-ink-2 cursor-pointer"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>

              {/* Effects settings */}
              {effectTypes.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg hover:bg-glass transition"
                  >
                    <Sliders size={20} />
                  </button>

                  {showSettings && (
                    <div className="absolute right-0 top-full mt-2 bg-ink-3 border border-hair rounded-lg p-3 z-10 w-48">
                      <h4 className="text-xs font-semibold text-ink-1 mb-2">
                        Effects
                      </h4>
                      <div className="space-y-2">
                        {effectTypes.map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer text-xs text-ink-1 hover:text-ink-0"
                          >
                            <input
                              type="checkbox"
                              checked={state.visibleEffectTypes.has(type)}
                              onChange={() => toggleEffectType(type)}
                              className="rounded"
                            />
                            <span className="capitalize">
                              {type.replace(/_/g, ' ')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen */}
              <button
                onClick={handleFullscreen}
                className="p-2 rounded-lg hover:bg-glass transition"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          </div>
        </>
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
