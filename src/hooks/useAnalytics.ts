import { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import type { VehiclePosition } from '@/types/vehicle';

const SAMPLE_INTERVAL = 60; // Sample every 60 simulation seconds

export const useAnalytics = (positions: VehiclePosition[]) => {
  const lastSampleTimeRef = useRef(0);
  const currentTime = useSimulationStore((s) => s.currentTime);
  const stats = useSimulationStore((s) => s.stats);
  const isPlaying = useSimulationStore((s) => s.isPlaying);

  useEffect(() => {
    if (!isPlaying || positions.length === 0) return;

    if (currentTime - lastSampleTimeRef.current < SAMPLE_INTERVAL) return;
    lastSampleTimeRef.current = currentTime;

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
  }, [currentTime, stats, isPlaying, positions]);
};
