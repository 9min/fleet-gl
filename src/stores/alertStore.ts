import { create } from 'zustand';
import type { GeofenceType } from '@/types/geofence';

export type AlertItem = {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  zoneType?: GeofenceType;
  timestamp: number;
  dismissing?: boolean;
};

type AlertState = {
  alerts: AlertItem[];
  addAlert: (alert: Omit<AlertItem, 'id' | 'timestamp'>) => void;
  dismissAlert: (id: string) => void;
  markDismissing: (id: string) => void;
};

let alertCounter = 0;

export const useAlertStore = create<AlertState>()((set) => ({
  alerts: [],

  addAlert: (alert) => {
    const id = `alert-${++alertCounter}`;
    set((s) => ({
      alerts: [
        ...s.alerts.slice(-4), // Keep max 5 (4 existing + 1 new)
        { ...alert, id, timestamp: Date.now() },
      ],
    }));
  },

  dismissAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.filter((a) => a.id !== id),
    })),

  markDismissing: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id ? { ...a, dismissing: true } : a,
      ),
    })),
}));
