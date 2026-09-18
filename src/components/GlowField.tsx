import React, { useEffect, useRef } from 'react';

/**
 * Ambient liquid-glass background. Three blurred, drifting color blobs whose
 * hue is written to the --h custom property on <html> every frame — every
 * glass card and button in the app reads that same variable, so the whole UI
 * stays lit by the same shifting light as the backdrop.
 * Mounted once, fixed behind all content. Freezes on prefers-reduced-motion.
 */
export default function GlowField() {
  const b1 = useRef<HTMLDivElement>(null);
  const b2 = useRef<HTMLDivElement>(null);
  const b3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    let raf = 0;
    let hueTimer = 0;
    let t = 0;

    // Blob drift is cheap (3 elements, no backdrop-filter) so it can run at
    // full frame rate. The --h hue, on the other hand, is read by every
    // glass-sweep selector's backdrop-filter/box-shadow across the whole app
    // — updating it 60x/sec would force a style recalc on hundreds of
    // elements each frame. A slow interval keeps the ambient color shift
    // visible without the repaint cost.
    const frame = () => {
      t += reduce ? 0 : 0.0026;
      if (!reduce) {
        if (b1.current) b1.current.style.transform = `translate(${Math.sin(t * 1.1) * 8}vw, ${Math.cos(t * 0.9) * 6}vh)`;
        if (b2.current) b2.current.style.transform = `translate(${Math.cos(t * 0.8) * 9}vw, ${Math.sin(t * 1.2) * 7}vh)`;
        if (b3.current) b3.current.style.transform = `translate(-50%, -50%) translate(${Math.sin(t * 1.4) * 6}vw, ${Math.cos(t * 1.1) * 6}vh)`;
      }
      raf = requestAnimationFrame(frame);
    };

    const updateHue = () => {
      const hue = 288 + Math.sin(t) * 46; // sweeps violet -> magenta -> cool blue
      root.style.setProperty('--h', hue.toFixed(1));
    };

    if (b3.current) b3.current.style.transform = 'translate(-50%, -50%)';
    updateHue();
    raf = requestAnimationFrame(frame);
    if (!reduce) {
      hueTimer = window.setInterval(updateHue, 150);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(hueTimer);
    };
  }, []);

  return (
    <>
      <div className="glow-field" aria-hidden="true">
        <div
          ref={b1}
          className="glow-blob"
          style={{
            width: '58vmax',
            height: '58vmax',
            top: '-20%',
            left: '-16%',
            opacity: 0.5,
            background: 'radial-gradient(circle at 35% 35%, hsla(calc(var(--h) + 8), 90%, 62%, .9), transparent 65%)'
          }}
        />
        <div
          ref={b2}
          className="glow-blob"
          style={{
            width: '52vmax',
            height: '52vmax',
            bottom: '-22%',
            right: '-14%',
            opacity: 0.45,
            background: 'radial-gradient(circle at 60% 40%, hsla(calc(var(--h) - 60), 85%, 58%, .85), transparent 65%)'
          }}
        />
        <div
          ref={b3}
          className="glow-blob"
          style={{
            width: '46vmax',
            height: '46vmax',
            top: '38%',
            left: '48%',
            opacity: 0.35,
            background: 'radial-gradient(circle at 45% 55%, hsla(calc(var(--h) + 70), 80%, 60%, .7), transparent 65%)'
          }}
        />
      </div>
      <div className="glow-vignette" aria-hidden="true" />
      <div className="glow-noise" aria-hidden="true" />
    </>
  );
}
