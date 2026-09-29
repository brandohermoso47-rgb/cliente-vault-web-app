import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { useAnimationFrame } from 'motion/react';

export interface UseTrailReplayOptions {
  durationMs: number;
  onFrame: (elapsedMs: number) => void;
  holdMs?: number;
  enabled?: boolean;
  elementRef?: RefObject<Element | null>;
  resetKeys?: readonly unknown[];
}

/** Reproduce un trazo en loop, dibujando directamente vía refs (sin setState por frame). */
export function useTrailReplay(options: UseTrailReplayOptions) {
  const { durationMs, onFrame, holdMs = 450, enabled = true, elementRef, resetKeys = [] } = options;

  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;
  const durationMsRef = useRef(durationMs);
  durationMsRef.current = durationMs;
  const holdMsRef = useRef(holdMs);
  holdMsRef.current = holdMs;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const loopStartRef = useRef<number | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loopStartRef.current = null;
  }, resetKeys);

  const visibleRef = useRef(true);
  useEffect(() => {
    const el = elementRef?.current;
    if (!el) {
      visibleRef.current = true;
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef?.current]);

  useAnimationFrame(
    useCallback((timeSinceStart) => {
      const duration = durationMsRef.current;
      if (!enabledRef.current || !visibleRef.current || duration <= 0) return;

      if (loopStartRef.current === null) loopStartRef.current = timeSinceStart;
      const cycle = duration + holdMsRef.current;
      const lap = (timeSinceStart - loopStartRef.current) % cycle;
      const elapsed = Math.min(lap, duration);
      onFrameRef.current(elapsed);
    }, [])
  );
}
