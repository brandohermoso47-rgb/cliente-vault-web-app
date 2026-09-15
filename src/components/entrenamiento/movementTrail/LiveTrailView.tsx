import { useCallback, useRef, useState } from 'react';
import { Camera, Circle, Sparkles, Square } from 'lucide-react';
import type { Language } from '../../../lib/translations';
import { useHandPoseTracker, type HandPoseFrame } from './useHandPoseTracker';
import { drawTrail, mirrorPoints, pickBodyPoints, pickPenPoint, pruneOldPoints, simplifyPoints } from './trailEngine';
import TrailCanvas from './TrailCanvas';
import FiguraEditor from './FiguraEditor';
import type { MovementFigure, MovementPoint } from './types';
import { figuraStore } from './storage/figuraStore';

const LIVE_FADE_MS = 1500;
const MAX_RECORD_MS = 30000;
const MAX_SAVED_POINTS = 500;

type RecordState = 'idle' | 'recording' | 'reviewing';

export interface LiveTrailViewProps {
  language: Language;
  onSaved?: (figure: MovementFigure) => void;
}

export default function LiveTrailView({ language, onSaved }: LiveTrailViewProps) {
  const isEs = language === 'es';
  const statusLabel: Record<string, string> = {
    idle: isEs ? 'Inactivo' : 'Idle',
    'requesting-camera': isEs ? 'Pidiendo cámara...' : 'Requesting camera...',
    'loading-models': isEs ? 'Cargando modelos...' : 'Loading models...',
    ready: isEs ? 'Rastreo activo' : 'Tracking active',
    error: isEs ? 'Error' : 'Error',
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const penTrailRef = useRef<MovementPoint[]>([]);
  const bodyTrailRef = useRef<MovementPoint[]>([]);
  const capturedRef = useRef<MovementPoint[]>([]);
  const recordStartRef = useRef(0);

  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [mirrorOn, setMirrorOn] = useState(false);
  const [mirrorAxis, setMirrorAxis] = useState(0.5);
  const [reviewFigure, setReviewFigure] = useState<MovementFigure | null>(null);

  const recordStateRef = useRef(recordState);
  recordStateRef.current = recordState;
  const mirrorOnRef = useRef(mirrorOn);
  mirrorOnRef.current = mirrorOn;
  const mirrorAxisRef = useRef(mirrorAxis);
  mirrorAxisRef.current = mirrorAxis;

  const finishRecording = useCallback(() => {
    setRecordState('reviewing');
    const simplified = simplifyPoints(capturedRef.current, MAX_SAVED_POINTS);
    const duration = simplified.length ? simplified[simplified.length - 1].t : 0;
    setReviewFigure({
      id: crypto.randomUUID(),
      name: `${isEs ? 'Figura' : 'Figure'} ${new Date().toLocaleTimeString(isEs ? 'es-ES' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      points: simplified,
      durationMs: duration,
      mirrored: mirrorOnRef.current,
      mirrorAxisX: mirrorAxisRef.current,
      color: '#C23E9E',
      strokeWidth: 4,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEs]);

  const onFrame = useCallback(
    (frame: HandPoseFrame) => {
      const now = frame.timestamp;
      const pen = pickPenPoint(frame, now);
      const body = pickBodyPoints(frame, now);

      const nextPenTrail = pen ? [...penTrailRef.current, pen] : penTrailRef.current;
      penTrailRef.current = pruneOldPoints(nextPenTrail, now, LIVE_FADE_MS);
      bodyTrailRef.current = pruneOldPoints([...bodyTrailRef.current, ...body], now, LIVE_FADE_MS);

      if (recordStateRef.current === 'recording') {
        const relT = now - recordStartRef.current;
        if (pen) capturedRef.current.push({ ...pen, t: relT });
        for (const b of body) capturedRef.current.push({ ...b, t: relT });
        if (relT >= MAX_RECORD_MS) {
          finishRecording();
        } else {
          setElapsedMs(relT);
        }
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawTrail(ctx, bodyTrailRef.current, canvas.width, canvas.height, {
        color: '#a855f7',
        strokeWidth: 2,
        nowT: now,
        fadeMs: LIVE_FADE_MS,
        globalAlpha: 0.5,
      });
      drawTrail(ctx, penTrailRef.current, canvas.width, canvas.height, {
        color: '#D9A9FF',
        strokeWidth: 4,
        nowT: now,
        fadeMs: LIVE_FADE_MS,
      });
      if (mirrorOnRef.current) {
        drawTrail(ctx, mirrorPoints(penTrailRef.current, mirrorAxisRef.current), canvas.width, canvas.height, {
          color: '#C23E9E',
          strokeWidth: 4,
          nowT: now,
          fadeMs: LIVE_FADE_MS,
        });
      }
    },
    [finishRecording]
  );

  const { videoRef, status, error } = useHandPoseTracker({ onFrame, poseEveryNFrames: 2 });

  const startRecording = () => {
    capturedRef.current = [];
    recordStartRef.current = performance.now();
    setElapsedMs(0);
    setRecordState('recording');
  };

  const discardReview = () => {
    setReviewFigure(null);
    setRecordState('idle');
  };

  const saveReview = (figure: MovementFigure) => {
    figuraStore.save(figure);
    setReviewFigure(null);
    setRecordState('idle');
    onSaved?.(figure);
  };

  if (recordState === 'reviewing' && reviewFigure) {
    return (
      <FiguraEditor
        figure={reviewFigure}
        language={language}
        title={isEs ? 'Revisar y guardar figura' : 'Review and save figure'}
        onSave={saveReview}
        onCancel={discardReview}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl border border-[#262626] bg-black shadow-2xl">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full scale-x-[-1] object-cover" />
        <TrailCanvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1">
          <Circle
            className={`h-2 w-2 ${
              status === 'ready' ? 'fill-emerald-400 text-emerald-400' : 'animate-pulse fill-amber-400 text-amber-400'
            }`}
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/80">{statusLabel[status]}</span>
        </div>

        {recordState === 'recording' && (
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-rose-300">
            <Circle className="h-2 w-2 animate-ping fill-rose-500 text-rose-500" />
            <span className="font-mono text-xs">{(elapsedMs / 1000).toFixed(1)}s</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-sm text-rose-300">
            {error.message}
          </div>
        )}
      </div>

      <div className="flex max-w-md items-center justify-between rounded-2xl border border-[#262626] bg-[#121212] px-4 py-3">
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={mirrorOn}
            onChange={(e) => setMirrorOn(e.target.checked)}
            className="h-4 w-4 accent-purple-500"
          />
          <Sparkles className="h-4 w-4 text-purple-400" />
          {isEs ? 'Simetría en vivo' : 'Live symmetry'}
        </label>
        {mirrorOn && (
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.01}
            value={mirrorAxis}
            onChange={(e) => setMirrorAxis(Number(e.target.value))}
            className="w-32 accent-purple-500"
          />
        )}
      </div>

      <button
        type="button"
        onClick={recordState === 'recording' ? finishRecording : startRecording}
        disabled={status !== 'ready'}
        className={`flex max-w-md items-center justify-center gap-2 rounded-2xl px-6 py-3 font-mono text-xs uppercase tracking-wider transition disabled:opacity-40 ${
          recordState === 'recording' ? 'bg-rose-500/90 text-white hover:bg-rose-500' : 'bg-[#C23E9E] text-white hover:bg-[#C23E9E]/80'
        }`}
      >
        {recordState === 'recording' ? (
          <>
            <Square className="h-4 w-4" /> {isEs ? 'Detener' : 'Stop'}
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" /> {isEs ? 'Grabar movimiento' : 'Record movement'}
          </>
        )}
      </button>
    </div>
  );
}
