import { useEffect, useRef, useState } from 'react';

type PerformanceStats = {
  fps: number;
  heapMB: number;
};

export const usePerformanceMonitor = (enabled: boolean) => {
  const [stats, setStats] = useState<PerformanceStats>({ fps: 0, heapMB: 0 });
  const framesRef = useRef<number[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const measure = (now: number) => {
      framesRef.current.push(now);

      // Keep only last 60 frame timestamps
      const cutoff = now - 1000;
      while (framesRef.current.length > 0 && framesRef.current[0]! < cutoff) {
        framesRef.current.shift();
      }

      rafRef.current = requestAnimationFrame(measure);
    };
    rafRef.current = requestAnimationFrame(measure);

    // Update stats at 1Hz
    const interval = setInterval(() => {
      const fps = framesRef.current.length;

      // performance.memory is Chrome-only
      const perf = performance as unknown as {
        memory?: { usedJSHeapSize: number };
      };
      const heapMB = perf.memory
        ? Math.round(perf.memory.usedJSHeapSize / 1048576)
        : 0;

      setStats({ fps, heapMB });
    }, 1000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(interval);
      framesRef.current = [];
    };
  }, [enabled]);

  return stats;
};
