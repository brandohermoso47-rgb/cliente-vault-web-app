/**
 * Pose detection engine using MediaPipe.
 * Runs detection once on video upload/edit.
 * Outputs pre-calculated figure events (not raw landmarks).
 */

import {
  SmoothedLandmarks,
  PoseLandmarks,
  Landmark,
  DetectionSession,
  FigureEvent,
  DetectionContext,
} from '../../types/motionRecognition';
import { smoothLandmark, KalmanFilter1D } from './geometry';
import { getAllEffectPlugins } from './effects';

// ==================== MediaPipe Setup ====================

// MediaPipe Pose landmark indices (from official MediaPipe Pose)
const LANDMARK_INDICES = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

/**
 * Extract relevant landmarks from MediaPipe Pose output.
 */
function extractLandmarks(landmarks: any[]): PoseLandmarks {
  return {
    nose: landmarks[LANDMARK_INDICES.NOSE] || { x: 0, y: 0 },
    rightShoulder: landmarks[LANDMARK_INDICES.RIGHT_SHOULDER] || { x: 0, y: 0 },
    leftShoulder: landmarks[LANDMARK_INDICES.LEFT_SHOULDER] || { x: 0, y: 0 },
    rightElbow: landmarks[LANDMARK_INDICES.RIGHT_ELBOW] || { x: 0, y: 0 },
    leftElbow: landmarks[LANDMARK_INDICES.LEFT_ELBOW] || { x: 0, y: 0 },
    rightWrist: landmarks[LANDMARK_INDICES.RIGHT_WRIST] || { x: 0, y: 0 },
    leftWrist: landmarks[LANDMARK_INDICES.LEFT_WRIST] || { x: 0, y: 0 },
    rightHip: landmarks[LANDMARK_INDICES.RIGHT_HIP] || { x: 0, y: 0 },
    leftHip: landmarks[LANDMARK_INDICES.LEFT_HIP] || { x: 0, y: 0 },
    rightKnee: landmarks[LANDMARK_INDICES.RIGHT_KNEE] || { x: 0, y: 0 },
    leftKnee: landmarks[LANDMARK_INDICES.LEFT_KNEE] || { x: 0, y: 0 },
    rightAnkle: landmarks[LANDMARK_INDICES.RIGHT_ANKLE] || { x: 0, y: 0 },
    leftAnkle: landmarks[LANDMARK_INDICES.LEFT_ANKLE] || { x: 0, y: 0 },
    neck: {
      x: (landmarks[LANDMARK_INDICES.LEFT_SHOULDER].x + landmarks[LANDMARK_INDICES.RIGHT_SHOULDER].x) / 2,
      y: (landmarks[LANDMARK_INDICES.LEFT_SHOULDER].y + landmarks[LANDMARK_INDICES.RIGHT_SHOULDER].y) / 2,
    },
    spine: {
      x:
        (landmarks[LANDMARK_INDICES.LEFT_SHOULDER].x +
          landmarks[LANDMARK_INDICES.RIGHT_SHOULDER].x +
          landmarks[LANDMARK_INDICES.LEFT_HIP].x +
          landmarks[LANDMARK_INDICES.RIGHT_HIP].x) /
        4,
      y:
        (landmarks[LANDMARK_INDICES.LEFT_SHOULDER].y +
          landmarks[LANDMARK_INDICES.RIGHT_SHOULDER].y +
          landmarks[LANDMARK_INDICES.LEFT_HIP].y +
          landmarks[LANDMARK_INDICES.RIGHT_HIP].y) /
        4,
    },
  };
}

// ==================== Smoothing & Filtering ====================

/**
 * Smooth landmarks over time to reduce jitter.
 * Uses Kalman filters per coordinate.
 */
export class LandmarkSmoother {
  private filters: Map<string, KalmanFilter1D> = new Map();
  private lastLandmarks: PoseLandmarks | null = null;
  private smoothingWindow: number = 3; // frames

  constructor(smoothingWindow: number = 3) {
    this.smoothingWindow = smoothingWindow;
  }

  smooth(landmarks: PoseLandmarks, frameIndex: number): SmoothedLandmarks {
    const smoothed = { ...landmarks } as any;

    // Apply Kalman filtering to key joints
    const joints = ['rightShoulder', 'leftShoulder', 'rightElbow', 'leftElbow', 'rightWrist', 'leftWrist'];

    for (const joint of joints) {
      const landmark = landmarks[joint];
      if (!landmark) continue;

      const xKey = `${joint}.x`;
      const yKey = `${joint}.y`;

      if (!this.filters.has(xKey)) {
        this.filters.set(xKey, new KalmanFilter1D(landmark.x, 1, 0.5));
        this.filters.set(yKey, new KalmanFilter1D(landmark.y, 1, 0.5));
      }

      smoothed[joint] = {
        ...landmark,
        x: this.filters.get(xKey)!.update(landmark.x),
        y: this.filters.get(yKey)!.update(landmark.y),
      };
    }

    const confidence = Object.values(smoothed)
      .filter((l: any) => l && l.visibility)
      .reduce((a: number, l: any) => a + l.visibility, 0) /
      Math.max(1, Object.values(smoothed).filter((l: any) => l && l.visibility).length);

    return {
      ...smoothed,
      frameIndex,
      timestamp: frameIndex * (1000 / 30), // assume 30fps default
      confidence: Math.min(1, confidence),
    };
  }
}

// ==================== Event Merging ====================

/**
 * Merge consecutive events of the same type and side.
 * Consolidates short detections into longer, more stable effects.
 */
export function mergeConsecutiveEvents(events: FigureEvent[]): FigureEvent[] {
  if (events.length === 0) return [];

  // Sort by type, side, and start time
  const sorted = events.sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    if ((a.side || '') !== (b.side || '')) return (a.side || '').localeCompare(b.side || '');
    return a.startMs - b.startMs;
  });

  const merged: FigureEvent[] = [];
  let current = { ...sorted[0] };
  const mergeGapMs = 200; // gap threshold to merge events

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    const sameType = current.type === next.type && current.side === next.side;
    const gap = next.startMs - current.endMs;

    if (sameType && gap < mergeGapMs) {
      // Merge: extend current event
      current.endMs = next.endMs;
      // Average parameters
      if (next.params) {
        for (const [key, value] of Object.entries(next.params)) {
          if (typeof value === 'number' && current.params[key] !== undefined) {
            current.params[key] = (current.params[key] + value) / 2;
          }
        }
      }
    } else {
      // Can't merge, push current and start new
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);
  return merged;
}

// ==================== Detection Engine ====================

export async function detectMotionEvents(
  videoUrl: string,
  videoDurationMs: number,
  onProgress?: (progress: number) => void
): Promise<FigureEvent[]> {
  // Load MediaPipe Pose
  const poseLandmarker = await loadMediaPipePose();

  const video = document.createElement('video');
  video.src = videoUrl;
  video.crossOrigin = 'anonymous';

  await new Promise((resolve) => {
    video.onloadedmetadata = resolve;
  });

  const fps = 30; // sample at 30fps
  const sampleInterval = 1000 / fps;
  const totalFrames = Math.ceil((videoDurationMs / 1000) * fps);

  const smoother = new LandmarkSmoother(3);
  const allDetectedEvents: FigureEvent[] = [];
  const poseFrames: SmoothedLandmarks[] = [];
  const plugins = getAllEffectPlugins();

  video.currentTime = 0;

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const timeMs = frameIndex * sampleInterval;
    if (timeMs > videoDurationMs) break;

    // Seek and wait for frame
    video.currentTime = timeMs / 1000;
    await new Promise((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve(null);
      };
      video.addEventListener('seeked', onSeeked);
    });

    // Run MediaPipe detection
    const results = await poseLandmarker.detectForVideo(video, Date.now());

    if (results.landmarks && results.landmarks.length > 0) {
      const rawLandmarks = extractLandmarks(results.landmarks[0]);
      const smoothedLandmarks = smoother.smooth(rawLandmarks, frameIndex);
      poseFrames.push(smoothedLandmarks);

      // Run each effect plugin
      const context: DetectionContext = {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        fps,
        frameIndex,
        totalFrames,
      };

      for (const plugin of plugins) {
        const detected = plugin.detect(smoothedLandmarks, poseFrames, context);

        if (detected) {
          const event: FigureEvent = {
            id: `${plugin.type}-${frameIndex}-${Math.random().toString(36).substr(2, 9)}`,
            type: detected.type as any,
            startMs: detected.startMs ?? timeMs,
            endMs: detected.endMs ?? timeMs + 500,
            side: detected.side,
            params: detected.params || {},
            color: detected.color,
            opacity: detected.opacity,
            strokeWidth: detected.strokeWidth,
            detectedAutomatically: true,
            editedManually: false,
            createdAt: new Date().toISOString(),
            createdBy: 'system',
          };

          allDetectedEvents.push(event);
        }
      }
    }

    // Report progress
    if (onProgress) {
      onProgress(frameIndex / totalFrames);
    }
  }

  // Merge consecutive events
  const mergedEvents = mergeConsecutiveEvents(allDetectedEvents);

  video.pause();
  video.src = '';

  return mergedEvents;
}

// ==================== MediaPipe Loading ====================

let mediapipePose: any = null;

async function loadMediaPipePose() {
  if (mediapipePose) return mediapipePose;

  // Load MediaPipe from CDN
  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm_bin/vision_wasm_bin.wasm');
  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js');

  // @ts-ignore
  const vision = (window as any).vision;

  mediapipePose = await vision.PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-assets/pose_landmarker_full.task',
    },
    runningMode: 'IMAGE',
  });

  return mediapipePose;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}
