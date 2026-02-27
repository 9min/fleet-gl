import { useEffect, useRef, useCallback, useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import type { VehicleRoute } from '@/types/route';
import type { VehiclePosition, VehicleStatus } from '@/types/vehicle';
import type { WorkerOutMessage } from '@/workers/types';

const STATUS_MAP: VehicleStatus[] = ['running', 'idle', 'completed', 'delayed'];

export const useInterpolation = (routes: VehicleRoute[]) => {
  const workerRef = useRef<Worker | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const simTimeRef = useRef<number>(0);
  const [positions, setPositions] = useState<VehiclePosition[]>([]);
  const [ready, setReady] = useState(false);
  const vehicleIdsRef = useRef<string[]>([]);
  const totalWaypointsRef = useRef<number[]>([]);

  // Initialize worker when routes are loaded
  useEffect(() => {
    if (routes.length === 0) return;

    const worker = new Worker(
      new URL('../workers/interpolation.worker.ts', import.meta.url),
      { type: 'module' },
    );
    workerRef.current = worker;

    const ids = routes.map((r) => r.vehicleId);
    const totals = routes.map((r) => r.waypoints.length);
    vehicleIdsRef.current = ids;
    totalWaypointsRef.current = totals;

    worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
      const msg = e.data;

      switch (msg.type) {
        case 'READY':
          setReady(true);
          break;

        case 'POSITIONS': {
          const float64 = new Float64Array(msg.buffer);
          const count = msg.vehicleCount;
          const newPositions: VehiclePosition[] = new Array(count);

          for (let i = 0; i < count; i++) {
            const offset = i * 5;
            newPositions[i] = {
              vehicleId: ids[i]!,
              lng: float64[offset]!,
              lat: float64[offset + 1]!,
              bearing: float64[offset + 2]!,
              status: STATUS_MAP[float64[offset + 3]!] ?? 'running',
              speed: 0,
              waypointIndex: float64[offset + 4]!,
              totalWaypoints: totals[i]!,
            };
          }

          setPositions(newPositions);
          break;
        }

        case 'STATS': {
          const store = useSimulationStore.getState();
          store.updateStats(msg.stats);
          store.updateCurrentTime(msg.currentTime);
          break;
        }
      }
    };

    // Send route data to worker
    const workerRoutes = routes.map((r) => ({
      vehicleId: r.vehicleId,
      path: r.path,
      waypointTimestamps: r.waypoints.map((w) => w.arrivalTime),
      totalWaypoints: r.waypoints.length,
    }));

    worker.postMessage({ type: 'INIT', routes: workerRoutes });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [routes]);

  // Animation loop
  useEffect(() => {
    if (!ready) return;

    const animate = (timestamp: number) => {
      const store = useSimulationStore.getState();

      if (store.isPlaying && workerRef.current) {
        const delta = lastTimeRef.current > 0
          ? (timestamp - lastTimeRef.current) / 1000
          : 0;
        simTimeRef.current += delta * store.playbackSpeed;

        // Clamp to total duration
        if (simTimeRef.current >= store.totalDuration) {
          simTimeRef.current = store.totalDuration;
          store.pause();
        }

        workerRef.current.postMessage({
          type: 'TICK',
          currentTime: simTimeRef.current,
          speed: store.playbackSpeed,
        });
      }

      lastTimeRef.current = timestamp;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready]);

  // Seek handler
  const seek = useCallback((time: number) => {
    simTimeRef.current = time;
    useSimulationStore.getState().seek(time);
    workerRef.current?.postMessage({ type: 'SEEK', targetTime: time });
  }, []);

  return { positions, ready, seek };
};
