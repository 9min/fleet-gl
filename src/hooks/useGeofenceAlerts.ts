import { useEffect, useRef } from 'react';
import i18n from '@/i18n';
import { useSimulationStore } from '@/stores/simulationStore';
import { useAlertStore } from '@/stores/alertStore';
import { pointInPolygon } from '@/utils/pointInPolygon';
import { getPositions } from '@/hooks/useInterpolation';
import type { GeofenceZone } from '@/types/geofence';

const ALERT_TYPE_MAP = {
  hub: 'info' as const,
  restricted: 'error' as const,
  'delivery-area': 'success' as const,
};

const CHECK_INTERVAL = 1000; // 1 second

export const useGeofenceAlerts = (
  geofences: GeofenceZone[],
) => {
  // Track which vehicles are inside which zones
  const insideMapRef = useRef<Map<string, Set<string>>>(new Map());

  useEffect(() => {
    if (geofences.length === 0) return;

    const interval = setInterval(() => {
      const isPlaying = useSimulationStore.getState().isPlaying;
      if (!isPlaying) return;

      const positions = getPositions();
      if (positions.length === 0) return;

      const addAlert = useAlertStore.getState().addAlert;
      const insideMap = insideMapRef.current;

      // Check only a subset each tick for performance (25 vehicles at a time)
      const checkCount = Math.min(positions.length, 25);
      const startIdx = Math.floor(Math.random() * Math.max(1, positions.length - checkCount));

      for (let vi = startIdx; vi < startIdx + checkCount && vi < positions.length; vi++) {
        const v = positions[vi]!;
        const point: [number, number] = [v.lng, v.lat];

        if (!insideMap.has(v.vehicleId)) {
          insideMap.set(v.vehicleId, new Set());
        }
        const vehicleZones = insideMap.get(v.vehicleId)!;

        for (const zone of geofences) {
          const isInside = pointInPolygon(point, zone.polygon);
          const wasInside = vehicleZones.has(zone.id);

          if (isInside && !wasInside) {
            vehicleZones.add(zone.id);
            addAlert({
              message: i18n.t('geofence.entered', { vehicleId: v.vehicleId, zoneName: zone.name }),
              type: ALERT_TYPE_MAP[zone.type] ?? 'info',
              zoneType: zone.type,
            });
          } else if (!isInside && wasInside) {
            vehicleZones.delete(zone.id);
            addAlert({
              message: i18n.t('geofence.left', { vehicleId: v.vehicleId, zoneName: zone.name }),
              type: 'warning',
              zoneType: zone.type,
            });
          }
        }
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [geofences]);
};
