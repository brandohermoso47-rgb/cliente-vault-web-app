import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { ArrowLeft, Camera, Pause, Play } from 'lucide-react';
import type { Language } from '../../../lib/translations';
import type { MovementCombo, MovementFigure } from './types';
import { comboStore } from './storage/comboStore';
import { figuraStore } from './storage/figuraStore';
import { drawGhostReveal, mirrorPoints } from './trailEngine';
import { useHandPoseTracker } from './useHandPoseTracker';
import TrailCanvas from './TrailCanvas';

export interface ComboPracticeProps {
  language: Language;
  comboId: string;
  onExit: () => void;
  onAddBonusPoints?: (amount: number) => void;
  onLogPractice?: (
    minutes: number,
    activityType: 'drill' | 'battle' | 'combo' | 'playlist' | 'sensorial',
    description: string,
    extra?: { bpm?: number }
  ) => void;
}

/** Capa de video en vivo, montada solo cuando el usuario activa "practicar con cámara" (mount/unmount = on/off). */
function CameraGhostLayer({ isEs }: { isEs: boolean }) {
  const { videoRef, status } = useHandPoseTracker({});
  return (
    <>
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full scale-x-[-1] object-cover" />
      {status !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs uppercase tracking-widest text-white/60">
          {isEs ? 'Cargando cámara...' : 'Loading camera...'}
        </div>
      )}
    </>
  );
}

export default function ComboPractice({ language, comboId, onExit, onAddBonusPoints, onLogPractice }: ComboPracticeProps) {
  const isEs = language === 'es';
  const [combo, setCombo] = useState<MovementCombo | null>(null);
  const [sequence, setSequence] = useState<MovementFigure[]>([]);
  const [missingCount, setMissingCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [figureIndex, setFigureIndex] = useState(0);
  const [beatFlash, setBeatFlash] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [loggedThisRun, setLoggedThisRun] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthRef = useRef<Tone.Synth | null>(null);
  const beatIntervalRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  const figureStartRef = useRef(0);
  const comboRef = useRef<MovementCombo | null>(null);
  const sequenceRef = useRef<MovementFigure[]>([]);
  const figureIndexRef = useRef(0);
  figureIndexRef.current = figureIndex;

  useEffect(() => {
    const c = comboStore.get(comboId) ?? null;
    setCombo(c);
    comboRef.current = c;
    if (c) {
      const resolved = c.figureIds.map((id) => figuraStore.get(id)).filter((f): f is MovementFigure => !!f);
      setSequence(resolved);
      sequenceRef.current = resolved;
      setMissingCount(c.figureIds.length - resolved.length);
    }
    return () => {
      stopPlayback();
      synthRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comboId]);

  function stopPlayback() {
    if (beatIntervalRef.current) window.clearInterval(beatIntervalRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPlaying(false);
  }

  function drawGhostLoop() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const figure = sequenceRef.current[figureIndexRef.current];
    const combo = comboRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (figure && combo) {
        const targetDurationMs = (combo.beatsPerFigure * 60000) / combo.bpm;
        const elapsed = performance.now() - figureStartRef.current;
        const revealElapsed = figure.durationMs > 0 ? (elapsed / targetDurationMs) * figure.durationMs : 0;
        drawGhostReveal(ctx, figure.points, canvas.width, canvas.height, revealElapsed, {
          color: figure.color,
          strokeWidth: figure.strokeWidth,
        });
        if (figure.mirrored) {
          drawGhostReveal(ctx, mirrorPoints(figure.points, figure.mirrorAxisX), canvas.width, canvas.height, revealElapsed, {
            color: '#D9A9FF',
            strokeWidth: figure.strokeWidth,
          });
        }
      }
    }
    rafRef.current = requestAnimationFrame(drawGhostLoop);
  }

  async function startPlayback() {
    if (!combo || sequence.length === 0) return;
    await Tone.start();
    if (!synthRef.current) synthRef.current = new Tone.Synth().toDestination();

    setFigureIndex(0);
    figureIndexRef.current = 0;
    figureStartRef.current = performance.now();
    setPlaying(true);

    if (!loggedThisRun) {
      setLoggedThisRun(true);
      onAddBonusPoints?.(50);
      onLogPractice?.(
        1,
        'combo',
        isEs
          ? `Práctica de trazos de movimiento: combo "${combo.name}" a ${combo.bpm} BPM`
          : `Movement trail practice: "${combo.name}" combo at ${combo.bpm} BPM`,
        { bpm: combo.bpm }
      );
    }

    const beatMs = 60000 / combo.bpm;
    let beat = 0;
    beatIntervalRef.current = window.setInterval(() => {
      const accent = beat % combo.beatsPerFigure === 0;
      synthRef.current?.triggerAttackRelease(accent ? 'C5' : 'G4', '16n');
      setBeatFlash(true);
      window.setTimeout(() => setBeatFlash(false), 100);

      beat += 1;
      if (beat % combo.beatsPerFigure === 0) {
        const next = figureIndexRef.current + 1;
        if (next >= sequenceRef.current.length) {
          if (combo.loop && sequenceRef.current.length > 0) {
            figureIndexRef.current = 0;
            setFigureIndex(0);
            figureStartRef.current = performance.now();
          } else {
            stopPlayback();
          }
        } else {
          figureIndexRef.current = next;
          setFigureIndex(next);
          figureStartRef.current = performance.now();
        }
      }
    }, beatMs);

    rafRef.current = requestAnimationFrame(drawGhostLoop);
  }

  const currentFigure = sequence[figureIndex];

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <button type="button" onClick={onExit} className="flex items-center gap-2 self-start text-sm text-[#8A8A8A] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {isEs ? 'Volver a combos' : 'Back to combos'}
      </button>

      {!combo && <p className="text-center text-sm text-rose-300">{isEs ? 'No se encontró este combo.' : 'Combo not found.'}</p>}

      {combo && (
        <>
          <h2 className="text-lg text-white/90">{combo.name}</h2>
          {missingCount > 0 && (
            <p className="text-xs text-amber-300">
              {isEs
                ? `${missingCount} figura(s) de este combo fueron eliminadas y se omiten en la práctica.`
                : `${missingCount} figure(s) in this combo were deleted and are skipped during practice.`}
            </p>
          )}

          <div
            className={`relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl transition-colors ${
              beatFlash ? 'border-[#D9A9FF]' : 'border-[#262626]'
            } bg-[#0d0b18]`}
          >
            {cameraOn && <CameraGhostLayer isEs={isEs} />}
            <TrailCanvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

            <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 font-mono text-xs uppercase tracking-widest text-[#D9A9FF]">
              {currentFigure ? currentFigure.name : '—'} · {figureIndex + 1}/{sequence.length || 1}
            </div>
          </div>

          <label className="flex items-center gap-2 self-start text-sm text-[#8A8A8A]">
            <input type="checkbox" checked={cameraOn} onChange={(e) => setCameraOn(e.target.checked)} className="h-4 w-4 accent-[#D9A9FF]" />
            <Camera className="h-4 w-4" /> {isEs ? 'Practicar con cámara' : 'Practice with camera'}
          </label>

          <button
            type="button"
            onClick={playing ? stopPlayback : startPlayback}
            disabled={sequence.length === 0}
            className={`flex max-w-md items-center justify-center gap-2 rounded-2xl px-6 py-3 font-mono text-xs uppercase tracking-wider transition disabled:opacity-40 ${
              playing ? 'bg-rose-500/90 text-white hover:bg-rose-500' : 'bg-emerald-500/90 text-black hover:bg-emerald-400'
            }`}
          >
            {playing ? (
              <>
                <Pause className="h-4 w-4" /> {isEs ? 'Detener práctica' : 'Stop practice'}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> {isEs ? 'Iniciar práctica' : 'Start practice'}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
