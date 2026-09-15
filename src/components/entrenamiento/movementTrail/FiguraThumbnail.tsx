import { useEffect, useRef } from 'react';
import type { MovementFigure } from './types';
import { drawTrail, mirrorPoints } from './trailEngine';

export interface FiguraThumbnailProps {
  figure: MovementFigure;
  className?: string;
}

/** Miniatura estática (sin cámara) de una figura guardada, reutilizada en la galería y el constructor de combos. */
export default function FiguraThumbnail({ figure, className }: FiguraThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTrail(ctx, figure.points, canvas.width, canvas.height, {
      color: figure.color,
      strokeWidth: Math.max(2, figure.strokeWidth - 1),
    });
    if (figure.mirrored) {
      drawTrail(ctx, mirrorPoints(figure.points, figure.mirrorAxisX), canvas.width, canvas.height, {
        color: '#d9a9ff',
        strokeWidth: Math.max(2, figure.strokeWidth - 1),
        globalAlpha: 0.85,
      });
    }
  }, [figure]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={120}
      className={className ?? 'h-full w-full rounded-xl bg-[#0d0b18]'}
    />
  );
}
