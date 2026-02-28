import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';
import { getVehicleById } from '@/hooks/useInterpolation';
import RouteProgress from './RouteProgress';
import type { VehiclePosition } from '@/types/vehicle';
import type { VehicleRoute } from '@/types/route';
import type { WaypointProgress } from '@/types/routeDetail';

type VehicleDetailProps = {
  routes: VehicleRoute[];
};

const STATUS_KEYS: Record<string, string> = {
  running: 'status.running',
  idle: 'status.idle',
  completed: 'status.completed',
  delayed: 'status.delayed',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  running: '#00D4FF',
  idle: '#FFB800',
  completed: '#00FF88',
  delayed: '#FF4757',
};

const POLL_INTERVAL = 500; // ms — low-frequency polling for UI display

const VehicleDetail = ({ routes }: VehicleDetailProps) => {
  const { t } = useTranslation();
  const selectedVehicleId = useUIStore((s) => s.selectedVehicleId);
  const selectVehicle = useUIStore((s) => s.selectVehicle);
  const [vehicle, setVehicle] = useState<VehiclePosition | null>(null);

  const handleClose = useCallback(() => {
    selectVehicle(null);
  }, [selectVehicle]);

  // Poll for selected vehicle data at low frequency
  useEffect(() => {
    if (!selectedVehicleId) {
      setVehicle(null);
      return;
    }
    // Immediate read
    setVehicle(getVehicleById(selectedVehicleId));
    const id = setInterval(() => {
      setVehicle(getVehicleById(selectedVehicleId));
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [selectedVehicleId]);

  const waypointProgress = useMemo((): WaypointProgress[] => {
    if (!selectedVehicleId || !vehicle) return [];
    const route = routes.find((r) => r.vehicleId === selectedVehicleId);
    if (!route) return [];

    return route.waypoints.map((wp, i) => {
      const isCompleted = vehicle.waypointIndex > i;
      const isCurrent = vehicle.waypointIndex === i && vehicle.status !== 'completed';
      // Deterministic deviation based on waypoint index (no Math.random())
      const deviation = isCompleted ? (vehicle.waypointIndex * 7 + i * 13) % 600 - 200 : 0;

      return {
        name: wp.name,
        plannedArrival: wp.arrivalTime,
        actualArrival: isCompleted ? wp.arrivalTime + deviation : null,
        status: isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming',
        deviationSeconds: isCompleted ? deviation : 0,
        lng: wp.lng,
        lat: wp.lat,
      };
    });
  }, [selectedVehicleId, vehicle?.waypointIndex, vehicle?.status, routes]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!vehicle) return null;

  return (
    <div className="glass-panel p-4 flex flex-col gap-3 mt-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{vehicle.vehicleId}</h2>
        <button
          onClick={handleClose}
          className="text-text-secondary hover:text-text-primary transition-colors text-lg leading-none"
          aria-label={t('common.close')}
        >
          &times;
        </button>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: STATUS_DOT_COLORS[vehicle.status] }}
          />
          <span className="text-text-secondary">{t('vehicle.status')}</span>
          <span className="text-text-primary">{t(STATUS_KEYS[vehicle.status] ?? 'status.running')}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">{t('vehicle.waypoint')}</span>
          <span className="font-mono text-text-primary">
            {vehicle.waypointIndex} / {vehicle.totalWaypoints}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">{t('vehicle.position')}</span>
          <span className="font-mono text-text-primary text-xs">
            {vehicle.lng.toFixed(4)}, {vehicle.lat.toFixed(4)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">{t('vehicle.bearing')}</span>
          <span className="font-mono text-text-primary">{Math.round(vehicle.bearing)}&deg;</span>
        </div>

        {/* Progress bar */}
        <div className="mt-1">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-cyan rounded-full transition-all duration-300"
              style={{
                width: `${vehicle.totalWaypoints > 0
                  ? (vehicle.waypointIndex / vehicle.totalWaypoints) * 100
                  : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Route progress timeline */}
      {waypointProgress.length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            {t('vehicle.routeProgress')}
          </h3>
          <RouteProgress waypoints={waypointProgress} />
        </div>
      )}
    </div>
  );
};

export default VehicleDetail;
