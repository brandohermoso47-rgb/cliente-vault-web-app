import { useEffect, useRef, type RefObject } from 'react';
import type { FigureEvent } from '../../types/motionRecognition';
import { contentRect } from '../../lib/motionRecognition/geometry';
import { EFFECT_PLUGINS } from '../../lib/motionRecognition/effects';

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  events: FigureEvent[];
}

// Dibuja los eventos de figura sobre el video, cuadro a cuadro (requestAnimationFrame), en el área real del
// video dentro de su contenedor (object-fit: contain deja barras en videos verticales).
export default function OverlayCanvas({ videoRef, events }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const order = new Map(EFFECT_PLUGINS.map((p, i) => [p.type, i]));
    let raf = 0;
    let lastKey = '';
    let lastEvents: FigureEvent[] | null = null;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const video = videoRef.current;
      if (!video) return;
      const dpr = window.devicePixelRatio || 1;
      const boxW = canvas.clientWidth;
      const boxH = canvas.clientHeight;
      const tMs = video.currentTime * 1000;
      const key = `${tMs}|${boxW}|${boxH}|${dpr}|${video.videoWidth}`;
      if (key === lastKey && !video.seeking && video.paused && eventsRef.current === lastEvents) return;
      lastKey = key;
      lastEvents = eventsRef.current;

      if (canvas.width !== Math.round(boxW * dpr) || canvas.height !== Math.round(boxH * dpr)) {
        canvas.width = Math.round(boxW * dpr);
        canvas.height = Math.round(boxH * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, boxW, boxH);
      const rect = contentRect(boxW, boxH, video.videoWidth, video.videoHeight);
      const map = (p: { x: number; y: number }) => ({ x: rect.x + p.x * rect.width, y: rect.y + p.y * rect.height });
      const dc = { ctx, map, width: rect.width, height: rect.height };

      const active = eventsRef.current
        .filter((e) => tMs >= e.startMs && tMs < e.endMs)
        .sort((a, b) => (order.get(a.type) ?? 99) - (order.get(b.type) ?? 99));
      for (const e of active) {
        const plugin = EFFECT_PLUGINS[order.get(e.type) ?? -1];
        plugin?.draw(dc, e, tMs);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
