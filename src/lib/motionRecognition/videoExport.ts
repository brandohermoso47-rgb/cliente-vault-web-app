/**
 * Video Export with Motion Effects
 * Burns motion recognition overlays directly into video file
 * Exports in 9:16 aspect ratio for TikTok/Instagram Reels
 */

import { FigureEvent, MotionRecognitionData } from '../../types/motionRecognition';
import { EFFECT_PLUGINS } from './effects';

interface ExportOptions {
  aspectRatio?: '16:9' | '9:16' | '1:1';
  quality?: 'low' | 'medium' | 'high';
  fps?: number;
  bitrate?: string;
  includeAudio?: boolean;
  watermark?: string;
  onProgress?: (progress: number) => void;
}

const DEFAULT_OPTIONS: ExportOptions = {
  aspectRatio: '16:9',
  quality: 'high',
  fps: 30,
  bitrate: '5M',
  includeAudio: true,
};

/**
 * Canvas rendering context for effects
 */
interface FrameRenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  videoW: number;
  videoH: number;
  sourceCrop: { x: number; y: number; width: number; height: number };
  currentTimeMs: number;
}

/**
 * Initialize canvas for video rendering
 */
function initializeCanvas(
  width: number,
  height: number,
  sourceCrop: FrameRenderContext['sourceCrop']
): FrameRenderContext {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  return {
    canvas,
    ctx,
    videoW: width,
    videoH: height,
    sourceCrop,
    currentTimeMs: 0,
  };
}

function captureVideoStream(video: HTMLVideoElement): MediaStream | null {
  const capture = (video as HTMLVideoElement & {
    captureStream?: () => MediaStream;
    mozCaptureStream?: () => MediaStream;
  }).captureStream ?? (video as HTMLVideoElement & {
    mozCaptureStream?: () => MediaStream;
  }).mozCaptureStream;
  return capture?.call(video) ?? null;
}

/**
 * Render single frame with effects
 */
function drawFrame(
  video: HTMLVideoElement,
  context: FrameRenderContext,
  events: FigureEvent[],
  visibleTypes: Set<string>
): void {
  const { ctx, videoW, videoH, currentTimeMs, sourceCrop } = context;

  // Draw video frame
  ctx.drawImage(video, sourceCrop.x, sourceCrop.y, sourceCrop.width, sourceCrop.height, 0, 0, videoW, videoH);

  // Render active effects
  const activeEvents = events.filter(
    (e) =>
      visibleTypes.has(e.type) &&
      e.startMs <= currentTimeMs &&
      currentTimeMs < e.endMs
  );

  for (const event of activeEvents) {
    const plugin = EFFECT_PLUGINS[event.type];
    if (plugin) {
      plugin.draw(ctx, event, currentTimeMs, videoW, videoH);
    }
  }

}

/**
 * Calculate dimensions for aspect ratio
 */
function calculateDimensions(
  videoW: number,
  videoH: number,
  aspectRatio: '16:9' | '9:16' | '1:1'
): { width: number; height: number; x: number; y: number } {
  const ratios: Record<string, number> = {
    '16:9': 16 / 9,
    '9:16': 9 / 16,
    '1:1': 1,
  };

  const targetRatio = ratios[aspectRatio];
  const sourceRatio = videoW / videoH;

  let width = videoW;
  let height = videoH;
  let x = 0;
  let y = 0;

  if (sourceRatio > targetRatio) {
    // Source is wider, crop sides
    width = videoH * targetRatio;
    x = (videoW - width) / 2;
  } else {
    // Source is taller, crop top/bottom
    height = videoW / targetRatio;
    y = (videoH - height) / 2;
  }

  return { width, height, x, y };
}

/**
 * Main export function using MediaRecorder API
 * Note: For production, consider using ffmpeg.wasm or server-side rendering
 */
export async function exportVideoWithEffects(
  videoFile: File,
  motionData: MotionRecognitionData,
  options: ExportOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise(async (resolve, reject) => {
    try {
      // Create video element from file
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;

      video.onloadedmetadata = async () => {
        const duration = video.duration * 1000;

        // Calculate output dimensions
        const dims = calculateDimensions(
          video.videoWidth,
          video.videoHeight,
          opts.aspectRatio!
        );

        // Initialize canvas
        const context = initializeCanvas(dims.width, dims.height, dims);

        // Create MediaRecorder
        const stream = context.canvas.captureStream(opts.fps!);
        if (opts.includeAudio) {
          const sourceStream = captureVideoStream(video);
          if (!sourceStream) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Audio capture is not supported by this browser'));
            return;
          }
          sourceStream.getAudioTracks().forEach((track) => stream.addTrack(track));
        }
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: parseInt(opts.bitrate!.replace('M', '')) * 1000000,
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          stream.getTracks().forEach((track) => track.stop());
          URL.revokeObjectURL(objectUrl);
          resolve(blob);
        };

        mediaRecorder.onerror = (event) => {
          stream.getTracks().forEach((track) => track.stop());
          URL.revokeObjectURL(objectUrl);
          reject(event.error);
        };

        // Start recording
        mediaRecorder.start();

        // Render frames
        const visibleTypes = new Set(motionData.events.map((e) => e.type));
        const frameInterval = 1000 / opts.fps!;
        let currentTime = 0;

        const renderNextFrame = async () => {
          if (currentTime > duration) {
            mediaRecorder.stop();
            return;
          }

          video.currentTime = currentTime / 1000;
          context.currentTimeMs = currentTime;

          // Wait for video frame to load
          await new Promise((resolve) => {
            const handler = () => {
              video.removeEventListener('seeked', handler);
              resolve(null);
            };
            video.addEventListener('seeked', handler);
          });
          drawFrame(video, context, motionData.events, visibleTypes);

          currentTime += frameInterval;

          if (opts.onProgress) {
            opts.onProgress((currentTime / duration) * 100);
          }

          // Schedule next frame
          requestAnimationFrame(renderNextFrame);
        };

        renderNextFrame();
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load video'));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Alternative: Generate preview GIF for quick sharing
 */
export async function exportPreviewGIF(
  videoFile: File,
  motionData: MotionRecognitionData,
  startMs: number = 0,
  durationMs: number = 3000
): Promise<Blob> {
  throw new Error('GIF preview export is not implemented');
}

/**
 * Create shareable short clip (15-30 seconds)
 * Optimized for social media
 */
export async function createShortClip(
  videoFile: File,
  motionData: MotionRecognitionData,
  startMs: number,
  durationMs: number = 15000
): Promise<Blob> {
  const video = document.createElement('video');
  const objectUrl = URL.createObjectURL(videoFile);
  video.src = objectUrl;

  return new Promise((resolve, reject) => {
    video.onloadedmetadata = async () => {
      try {
        const sourceCrop = calculateDimensions(video.videoWidth, video.videoHeight, '9:16');
        const context = initializeCanvas(1080, 1920, sourceCrop);

        const stream = context.canvas.captureStream(30);
        captureVideoStream(video)?.getAudioTracks().forEach((track) => stream.addTrack(track));
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm',
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          stream.getTracks().forEach((track) => track.stop());
          URL.revokeObjectURL(objectUrl);
          resolve(blob);
        };

        mediaRecorder.start();

        const visibleTypes = new Set(motionData.events.map((e) => e.type));
        let currentTime = startMs;
        const endTime = startMs + durationMs;

        const renderFrame = async () => {
          if (currentTime >= endTime) {
            mediaRecorder.stop();
            return;
          }

          video.currentTime = currentTime / 1000;
          context.currentTimeMs = currentTime;

          await new Promise((resolve) => {
            const handler = () => {
              video.removeEventListener('seeked', handler);
              resolve(null);
            };
            video.addEventListener('seeked', handler);
          });
          drawFrame(video, context, Array.from(motionData.events), visibleTypes);

          currentTime += 1000 / 30; // 30 fps
          requestAnimationFrame(renderFrame);
        };

        renderFrame();
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load video'));
    };
  });
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
