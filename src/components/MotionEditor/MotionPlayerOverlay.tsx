/**
 * Canvas overlay for rendering motion recognition effects.
 * Draws figure events on top of video during playback.
 */

import React, { useEffect } from 'react';
import { FigureEvent } from '../../types/motionRecognition';
import { getEffectPlugin } from '../../lib/motionRecognition';

interface MotionPlayerOverlayProps {
  events: FigureEvent[];
  currentTimeMs: number;
  videoWidth: number;
  videoHeight: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export default function MotionPlayerOverlay({
  events,
  currentTimeMs,
  videoWidth,
  videoHeight,
  canvasRef,
}: MotionPlayerOverlayProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match video (high DPI support)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = videoWidth * dpr;
    canvas.height = videoHeight * dpr;
    canvas.style.width = `${videoWidth}px`;
    canvas.style.height = `${videoHeight}px`;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Scale context for high DPI
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    // Sort events: render in order (background to foreground)
    // Priority: grid → lines → triangles → arcs → trails → echoes
    const priority: Record<string, number> = {
      torso_grid: 1,
      grid_points: 1,
      arm_line: 2,
      elbow_triangle: 3,
      rotation_arc: 4,
      wrist_trail: 5,
      pose_echo: 0, // render first, behind everything
    };

    const sortedEvents = [...events].sort(
      (a, b) => (priority[a.type] ?? 100) - (priority[b.type] ?? 100)
    );

    // Draw active events
    for (const event of sortedEvents) {
      // Skip events outside current time window
      if (currentTimeMs < event.startMs || currentTimeMs > event.endMs) {
        continue;
      }

      // Get the plugin for this effect type
      const plugin = getEffectPlugin(event.type as any);
      if (!plugin) {
        console.warn(`No plugin found for effect type: ${event.type}`);
        continue;
      }

      // Render the effect with error handling
      try {
        plugin.draw(ctx, event, currentTimeMs, videoWidth, videoHeight);
      } catch (error) {
        console.warn(`Failed to draw ${event.type}:`, error);
      }
    }

    // Optional: Draw FPS counter in development
    if (process.env.NODE_ENV === 'development') {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.font = '12px monospace';
      ctx.fillText(`t=${currentTimeMs.toFixed(0)}ms`, 10, 20);
    }
  }, [events, currentTimeMs, videoWidth, videoHeight, canvasRef]);

  return null; // Canvas is directly rendered in parent
}
