import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
  type Category,
} from '@mediapipe/tasks-vision';

// Pinned to the installed @mediapipe/tasks-vision version so the WASM runtime
// and the JS API surface never drift apart.
const VISION_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm';
const HAND_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const POSE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export type TrackerStatus =
  | 'idle'
  | 'requesting-camera'
  | 'loading-models'
  | 'ready'
  | 'error';

export interface TrackerError {
  kind: 'camera-denied' | 'camera-unsupported' | 'model-load-failed';
  message: string;
}

export interface NormalizedPoint {
  x: number;
  y: number;
  z?: number;
}

export interface HandFrame {
  handedness: 'Left' | 'Right';
  landmarks: NormalizedPoint[];
}

export interface HandPoseFrame {
  timestamp: number;
  hands: HandFrame[];
  pose: NormalizedPoint[] | null;
}

export interface UseHandPoseTrackerOptions {
  /** Se llama en cada frame detectado, fuera del ciclo de render de React. */
  onFrame?: (frame: HandPoseFrame) => void;
  /** Ejecuta la detección de pose solo 1 de cada N frames (las manos siempre corren cada frame). */
  poseEveryNFrames?: number;
}

export interface UseHandPoseTrackerResult {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: TrackerStatus;
  error: TrackerError | null;
}

/**
 * Como el <video> se muestra espejado por CSS (scale-x-[-1]) pero MediaPipe
 * analiza el frame crudo (sin espejar), toda coordenada x y la etiqueta de
 * "mano izquierda/derecha" deben invertirse para coincidir con lo que la
 * persona ve en pantalla.
 */
function mirrorPoint(p: NormalizedPoint): NormalizedPoint {
  return { x: 1 - p.x, y: p.y, z: p.z };
}

function mirrorHandedness(categories: Category[] | undefined): 'Left' | 'Right' {
  const raw = categories?.[0]?.categoryName;
  return raw === 'Left' ? 'Right' : 'Left';
}

export function useHandPoseTracker(
  options: UseHandPoseTrackerOptions = {}
): UseHandPoseTrackerResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<TrackerStatus>('idle');
  const [error, setError] = useState<TrackerError | null>(null);

  const onFrameRef = useRef(options.onFrame);
  onFrameRef.current = options.onFrame;
  const poseEveryNFrames = Math.max(1, options.poseEveryNFrames ?? 1);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let handLandmarker: HandLandmarker | null = null;
    let poseLandmarker: PoseLandmarker | null = null;
    let rafId = 0;
    let lastVideoTime = -1;
    let frameCount = 0;
    let lastPoseResult: NormalizedPoint[] | null = null;

    async function createLandmarkers(delegate: 'GPU' | 'CPU') {
      const vision = await FilesetResolver.forVisionTasks(VISION_WASM_URL);
      const [hands, pose] = await Promise.all([
        HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate },
          runningMode: 'VIDEO',
          numHands: 2,
        }),
        PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate },
          runningMode: 'VIDEO',
          numPoses: 1,
        }),
      ]);
      return { hands, pose };
    }

    function detectLoop() {
      const video = videoRef.current;
      if (!video || cancelled) return;

      if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
        lastVideoTime = video.currentTime;
        frameCount += 1;
        const timestamp = performance.now();

        const handResult = handLandmarker!.detectForVideo(video, timestamp);
        const hands: HandFrame[] = handResult.landmarks.map((landmarks, i) => ({
          handedness: mirrorHandedness(handResult.handednesses[i]),
          landmarks: landmarks.map(mirrorPoint),
        }));

        if (frameCount % poseEveryNFrames === 0) {
          const poseResult = poseLandmarker!.detectForVideo(video, timestamp);
          lastPoseResult = poseResult.landmarks[0]
            ? poseResult.landmarks[0].map(mirrorPoint)
            : null;
        }

        onFrameRef.current?.({ timestamp, hands, pose: lastPoseResult });
      }

      rafId = requestAnimationFrame(detectLoop);
    }

    async function start() {
      setStatus('requesting-camera');
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        setError({ kind: 'camera-unsupported', message: 'Este navegador no soporta acceso a la cámara.' });
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
      } catch {
        if (cancelled) return;
        setStatus('error');
        setError({ kind: 'camera-denied', message: 'Permiso de cámara denegado o no disponible.' });
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }

      setStatus('loading-models');
      try {
        try {
          ({ hands: handLandmarker, pose: poseLandmarker } = await createLandmarkers('GPU'));
        } catch {
          // El delegate de GPU/WebGL puede no estar disponible en todos los
          // navegadores/entornos — reintentamos en CPU antes de rendirnos.
          ({ hands: handLandmarker, pose: poseLandmarker } = await createLandmarkers('CPU'));
        }
      } catch {
        if (cancelled) return;
        setStatus('error');
        setError({ kind: 'model-load-failed', message: 'No se pudieron cargar los modelos de reconocimiento.' });
        return;
      }

      if (cancelled) return;
      setStatus('ready');
      rafId = requestAnimationFrame(detectLoop);
    }

    start();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
      const video = videoRef.current;
      if (video) video.srcObject = null;
      handLandmarker?.close();
      poseLandmarker?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poseEveryNFrames]);

  return { videoRef, status, error };
}
