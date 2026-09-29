import { useRef } from 'react';
import type { MovementFigure } from './types';
import { drawTrail, mirrorPoints, revealPoints } from './trailEngine';
import { useTrailReplay } from './useTrailReplay';

export interface FiguraThumbnailProps {
  figure: MovementFigure;
  className?: string;
}

/** Miniatura animada (sin cámara) de una figura guardada: repite su trazo en loop, reutilizada en la galería y el constructor de combos. */
export default function FiguraThumbnail({ figure, className }: FiguraThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useTrailReplay({
    durationMs: figure.durationMs,
    resetKeys: [figure.id, figure.updatedAt],
    elementRef: canvasRef,
    onFrame: (elapsedMs) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const visible = revealPoints(figure.points, elapsedMs);
      drawTrail(ctx, visible, canvas.width, canvas.height, {
        color: figure.color,
        strokeWidth: Math.max(2, figure.strokeWidth - 1),
      });
      if (figure.mirrored) {
        drawTrail(ctx, mirrorPoints(visible, figure.mirrorAxisX), canvas.width, canvas.height, {
          color: '#d9a9ff',
          strokeWidth: Math.max(2, figure.strokeWidth - 1),
          globalAlpha: 0.85,
        });
      }
    },
  });

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={120}
      className={className ?? 'h-full w-full rounded-xl bg-[#0d0b18]'}
    />
  );
}
