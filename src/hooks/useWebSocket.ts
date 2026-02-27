import { useEffect, useRef, useState } from 'react';
import { MockWebSocket } from '@/services/mockWebSocket';
import { useSimulationStore } from '@/stores/simulationStore';
import { useAlertStore } from '@/stores/alertStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';

const EVENT_COLOR_MAP: Record<string, string> = {
  VEHICLE_STATUS_CHANGE: '#00D4FF',
  NEW_ORDER: '#00FF88',
  ALERT: '#FF4757',
  GEOFENCE_EVENT: '#FFB800',
};

export const useWebSocket = () => {
  const wsRef = useRef<MockWebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new MockWebSocket();
    wsRef.current = ws;

    const unsubscribe = ws.on((event) => {
      // Add to alert store (only for ALERT type, throttled)
      if (event.type === 'ALERT') {
        useAlertStore.getState().addAlert({
          message: event.message,
          type: 'warning',
        });
      }

      // Add to analytics event log
      useAnalyticsStore.getState().addEvent({
        type: event.type === 'VEHICLE_STATUS_CHANGE' ? 'vehicle_status' :
              event.type === 'NEW_ORDER' ? 'new_order' :
              event.type === 'ALERT' ? 'alert' : 'geofence',
        message: event.message,
        vehicleId: event.vehicleId,
        timestamp: event.timestamp,
        color: EVENT_COLOR_MAP[event.type] ?? '#8892A0',
      });
    });

    ws.connect(
      () => useSimulationStore.getState().stats,
      () => useSimulationStore.getState().isPlaying,
    );
    setConnected(true);

    return () => {
      unsubscribe();
      ws.disconnect();
      setConnected(false);
    };
  }, []);

  return { connected };
};
