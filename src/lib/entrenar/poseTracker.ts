// Rastreo corporal real (MediaPipe PoseLandmarker / BlazePose, 33 puntos), 100% en el
// navegador. A diferencia de motion.ts (que solo mide "cuánto cambió la imagen" entre
// cuadros), este módulo sí reconoce las articulaciones concretas del bailarín en vivo,
// para poder dar correcciones de postura reales mientras se practica freestyle.
import { useEffect, useRef, useState, type RefObject } from 'react';

const VISION_CDN_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17';
const POSE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export interface NormalizedPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type PoseTrackerStatus = 'idle' | 'loading-models' | 'ready' | 'error';

// Índices BlazePose (MediaPipe Pose) usados por el entrenador de postura.
export const POSE_LANDMARK_INDEX = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28
} as const;

interface MediaPipeVisionModule {
  FilesetResolver: { forVisionTasks(wasmUrl: string): Promise<unknown> };
  PoseLandmarker: {
    createFromOptions(vision: unknown, options: Record<string, unknown>): Promise<{
      detectForVideo(video: HTMLVideoElement, timestamp: number): { landmarks: NormalizedPoint[][] };
      close(): void;
    }>;
  };
}

let visionModulePromise: Promise<MediaPipeVisionModule> | null = null;
function loadVisionModule(): Promise<MediaPipeVisionModule> {
  if (!visionModulePromise) {
    // Import dinámico desde CDN (sin agregar una dependencia npm nueva):
    // Vite deja este import tal cual porque la URL no es estática/local.
    visionModulePromise = import(/* @vite-ignore */ VISION_CDN_URL) as Promise<MediaPipeVisionModule>;
  }
  return visionModulePromise;
}

/**
 * Rastrea la pose corporal en vivo sobre un <video> ya controlado por quien llama
 * (la cámara y sus permisos los maneja el propio componente). Solo corre mientras
 * `active` es true.
 */
export function usePoseTracker(
  videoRef: RefObject<HTMLVideoElement | null>,
  active: boolean,
  onFrame: (landmarks: NormalizedPoint[] | null) => void
) {
  const [status, setStatus] = useState<PoseTrackerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!active) {
      setStatus('idle');
      setError(null);
      return;
    }

    let cancelled = false;
    let poseLandmarker: Awaited<ReturnType<MediaPipeVisionModule['PoseLandmarker']['createFromOptions']>> | null = null;
    let rafId = 0;
    let lastVideoTime = -1;

    async function start() {
      setStatus('loading-models');
      setError(null);
      try {
        const { FilesetResolver, PoseLandmarker } = await loadVisionModule();
        const vision = await FilesetResolver.forVisionTasks(`${VISION_CDN_URL}/wasm`);
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: 1
        });
      } catch {
        try {
          const { FilesetResolver, PoseLandmarker } = await loadVisionModule();
          const vision = await FilesetResolver.forVisionTasks(`${VISION_CDN_URL}/wasm`);
          poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: 'CPU' },
            runningMode: 'VIDEO',
            numPoses: 1
          });
        } catch {
          if (cancelled) return;
          setStatus('error');
          setError('No se pudo cargar el motor de reconocimiento corporal.');
          return;
        }
      }

      if (cancelled) {
        poseLandmarker?.close();
        return;
      }
      setStatus('ready');
      detectLoop();
    }

    function detectLoop() {
      const video = videoRef.current;
      if (!video || cancelled || !poseLandmarker) return;

      if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
        lastVideoTime = video.currentTime;
        const result = poseLandmarker.detectForVideo(video, performance.now());
        onFrameRef.current(result.landmarks[0] ?? null);
      }
      rafId = requestAnimationFrame(detectLoop);
    }

    start();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      poseLandmarker?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, videoRef]);

  return { status, error };
}
