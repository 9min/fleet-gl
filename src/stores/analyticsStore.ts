import { create } from 'zustand';
import type { TimeSeriesPoint, VehicleMetric } from '@/types/analytics';

type AnalyticsState = {
  timeSeries: TimeSeriesPoint[];
  vehicleMetrics: VehicleMetric[];
  eventLog: EventLogEntry[];

  addTimeSeriesPoint: (point: TimeSeriesPoint) => void;
  setVehicleMetrics: (metrics: VehicleMetric[]) => void;
  addEvent: (event: Omit<EventLogEntry, 'id'>) => void;
  clearTimeSeries: () => void;
};

export type EventLogEntry = {
  id: string;
  type: 'vehicle_status' | 'new_order' | 'alert' | 'geofence';
  message: string;
  vehicleId?: string;
  timestamp: number;
  color: string;
};

let eventCounter = 0;

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  timeSeries: [],
  vehicleMetrics: [],
  eventLog: [],

  addTimeSeriesPoint: (point) =>
    set((s) => ({
      timeSeries: [...s.timeSeries.slice(-120), point], // Keep last 2 hours (at 60s intervals)
    })),

  setVehicleMetrics: (metrics) => set({ vehicleMetrics: metrics }),

  addEvent: (event) => {
    const id = `evt-${++eventCounter}`;
    set((s) => ({
      eventLog: [...s.eventLog.slice(-199), { ...event, id }],
    }));
  },

  clearTimeSeries: () => set({ timeSeries: [], eventLog: [] }),
}));
