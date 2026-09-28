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

    // Set canvas size to match video
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw active events
    for (const event of events) {
      // Skip events outside current time window
      if (currentTimeMs < event.startMs || currentTimeMs > event.endMs) {
        continue;
      }

      // Get the plugin for this effect type
      const plugin = getEffectPlugin(event.type as any);
      if (!plugin) continue;

      // Render the effect
      try {
        plugin.draw(ctx, event, currentTimeMs, videoWidth, videoHeight);
      } catch (error) {
        console.warn(`Failed to draw ${event.type}:`, error);
      }
    }
  }, [events, currentTimeMs, videoWidth, videoHeight, canvasRef]);

  return null; // Canvas is directly rendered in parent
}
