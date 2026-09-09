import { forwardRef } from 'react';

export interface TrailCanvasProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Canvas 2D "tonto": no dibuja nada por sí mismo. Los distintos consumidores
 * (LiveTrailView en vivo, FiguraEditor/FiguraThumbnail estático, ComboPractice
 * fantasma) toman su contexto 2D vía ref y usan las funciones de dibujo de
 * `lib/tracking/trailEngine.ts` — así se evita re-renderizar React en cada frame.
 */
const TrailCanvas = forwardRef<HTMLCanvasElement, TrailCanvasProps>(
  ({ className, width = 640, height = 480 }, ref) => (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={className ?? 'pointer-events-none absolute inset-0 h-full w-full'}
    />
  )
);
TrailCanvas.displayName = 'TrailCanvas';

export default TrailCanvas;
