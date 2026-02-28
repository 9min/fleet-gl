import { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { getPositions } from '@/hooks/useInterpolation';

const SAMPLE_INTERVAL_MS = 1000; // Check every 1 second real time
const SIM_SAMPLE_INTERVAL = 60; // Sample every 60 simulation seconds

export const useAnalytics = () => {
  const lastSampleTimeRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const { isPlaying, currentTime, stats } = useSimulationStore.getState();
      if (!isPlaying) return;

      if (currentTime - lastSampleTimeRef.current < SIM_SAMPLE_INTERVAL) return;
      lastSampleTimeRef.current = currentTime;

      const positions = getPositions();
      if (positions.length === 0) return;

      const { addTimeSeriesPoint, setVehicleMetrics } = useAnalyticsStore.getState();

      // Add time series data point
      addTimeSeriesPoint({
        time: currentTime,
        running: stats.running,
        idle: stats.idle,
        completed: stats.completed,
        delayed: stats.delayed,
        progressPercent: stats.progressPercent,
      });

      // Update vehicle metrics (top 10 by completion)
      const metrics = positions
        .map((v) => ({
          vehicleId: v.vehicleId,
          completedWaypoints: v.waypointIndex,
          totalWaypoints: v.totalWaypoints,
          completionRate: v.totalWaypoints > 0 ? v.waypointIndex / v.totalWaypoints : 0,
        }))
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 10);

      setVehicleMetrics(metrics);
    }, SAMPLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
};
