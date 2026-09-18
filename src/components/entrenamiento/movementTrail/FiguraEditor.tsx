import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { Language } from '../../../lib/translations';
import type { MovementFigure } from './types';
import { FIGURE_COLORS } from './types';
import { drawTrail, mirrorPoints, simplifyPoints, trimPoints } from './trailEngine';
import TrailCanvas from './TrailCanvas';

export interface FiguraEditorProps {
  figure: MovementFigure;
  language: Language;
  title?: string;
  onSave: (figure: MovementFigure) => void;
  onCancel: () => void;
}

export default function FiguraEditor({ figure, language, title, onSave, onCancel }: FiguraEditorProps) {
  const isEs = language === 'es';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCount = figure.points.length;

  const [name, setName] = useState(figure.name);
  const [color, setColor] = useState(figure.color);
  const [strokeWidth, setStrokeWidth] = useState(figure.strokeWidth);
  const [mirrored, setMirrored] = useState(figure.mirrored);
  const [mirrorAxisX, setMirrorAxisX] = useState(figure.mirrorAxisX);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(1);
  const [maxPoints, setMaxPoints] = useState(Math.min(originalCount, 300));

  const previewPoints = useMemo(() => {
    const trimmed = trimPoints(figure.points, trimStart, trimEnd);
    return simplifyPoints(trimmed, maxPoints);
  }, [figure.points, trimStart, trimEnd, maxPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTrail(ctx, previewPoints, canvas.width, canvas.height, { color, strokeWidth });
    if (mirrored) {
      drawTrail(ctx, mirrorPoints(previewPoints, mirrorAxisX), canvas.width, canvas.height, {
        color: '#d9a9ff',
        strokeWidth,
        globalAlpha: 0.85,
      });
    }
  }, [previewPoints, color, strokeWidth, mirrored, mirrorAxisX]);

  const handleSave = () => {
    const duration = previewPoints.length ? previewPoints[previewPoints.length - 1].t : 0;
    const finalFigure: MovementFigure = {
      ...figure,
      name: name.trim() || figure.name,
      points: previewPoints,
      durationMs: duration,
      mirrored,
      mirrorAxisX,
      color,
      strokeWidth,
      updatedAt: Date.now(),
    };
    onSave(finalFigure);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <h3 className="text-xs uppercase tracking-widest text-[#8A8A8A]">
        {title ?? (isEs ? 'Editar figura' : 'Edit figure')}
      </h3>

      <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl border border-[#262626] bg-[#0d0b18] shadow-2xl">
        <TrailCanvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={isEs ? 'Nombre de la figura' : 'Figure name'}
        className="max-w-md rounded-xl border border-[#262626] bg-[#121212] px-4 py-2 text-white placeholder-white/30 outline-none focus:border-[#D9A9FF]"
      />

      <div className="grid max-w-2xl grid-cols-1 gap-4 rounded-2xl border border-[#262626] bg-[#121212] p-4 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wider text-[#8A8A8A]">
            {isEs ? 'Recorte inicio' : 'Trim start'}
          </label>
          <input
            type="range"
            min={0}
            max={trimEnd}
            step={0.01}
            value={trimStart}
            onChange={(e) => setTrimStart(Number(e.target.value))}
            className="w-full accent-[#D9A9FF]"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-[#8A8A8A]">
            {isEs ? 'Recorte fin' : 'Trim end'}
          </label>
          <input
            type="range"
            min={trimStart}
            max={1}
            step={0.01}
            value={trimEnd}
            onChange={(e) => setTrimEnd(Number(e.target.value))}
            className="w-full accent-[#D9A9FF]"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-[#8A8A8A]">
            {isEs ? 'Suavizado' : 'Smoothing'} ({previewPoints.length} {isEs ? 'puntos' : 'points'})
          </label>
          <input
            type="range"
            min={Math.min(10, originalCount)}
            max={Math.max(10, originalCount)}
            step={1}
            value={maxPoints}
            onChange={(e) => setMaxPoints(Number(e.target.value))}
            className="w-full accent-emerald-400"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-[#8A8A8A]">
            {isEs ? 'Grosor' : 'Thickness'}
          </label>
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-full accent-purple-400"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8A8A8A]">
            <input
              type="checkbox"
              checked={mirrored}
              onChange={(e) => setMirrored(e.target.checked)}
              className="h-4 w-4 accent-purple-500"
            />
            {isEs ? 'Simetría' : 'Symmetry'}
          </label>
          {mirrored && (
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.01}
              value={mirrorAxisX}
              onChange={(e) => setMirrorAxisX(Number(e.target.value))}
              className="mt-2 w-full accent-purple-500"
            />
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#8A8A8A]">{isEs ? 'Color' : 'Color'}</label>
          <div className="mt-2 flex gap-2">
            {FIGURE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  color === c ? 'border-white' : 'border-transparent opacity-70'
                }`}
                aria-label={c}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex max-w-md gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#262626] bg-[#121212] px-4 py-3 font-mono text-xs uppercase tracking-wider text-[#8A8A8A] hover:text-white"
        >
          <X className="h-4 w-4" /> {isEs ? 'Descartar' : 'Discard'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#C23E9E] px-4 py-3 font-mono text-xs uppercase tracking-wider text-white hover:bg-[#C23E9E]/80"
        >
          <Check className="h-4 w-4" /> {isEs ? 'Guardar' : 'Save'}
        </button>
      </div>
    </div>
  );
}
