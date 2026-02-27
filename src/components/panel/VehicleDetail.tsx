import { useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import type { VehiclePosition } from '@/types/vehicle';

type VehicleDetailProps = {
  positions: VehiclePosition[];
};

const STATUS_LABELS: Record<string, string> = {
  running: 'Running',
  idle: 'Idle',
  completed: 'Completed',
  delayed: 'Delayed',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  running: '#00D4FF',
  idle: '#FFB800',
  completed: '#00FF88',
  delayed: '#FF4757',
};

const VehicleDetail = ({ positions }: VehicleDetailProps) => {
  const selectedVehicleId = useUIStore((s) => s.selectedVehicleId);
  const selectVehicle = useUIStore((s) => s.selectVehicle);

  const handleClose = useCallback(() => {
    selectVehicle(null);
  }, [selectVehicle]);

  if (!selectedVehicleId) return null;

  const vehicle = positions.find((v) => v.vehicleId === selectedVehicleId);
  if (!vehicle) return null;

  return (
    <div className="glass-panel p-4 flex flex-col gap-3 mt-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{vehicle.vehicleId}</h2>
        <button
          onClick={handleClose}
          className="text-text-secondary hover:text-text-primary transition-colors text-lg leading-none"
          aria-label="Close"
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
          <span className="text-text-secondary">Status:</span>
          <span className="text-text-primary">{STATUS_LABELS[vehicle.status]}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">Waypoint</span>
          <span className="font-mono text-text-primary">
            {vehicle.waypointIndex} / {vehicle.totalWaypoints}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">Position</span>
          <span className="font-mono text-text-primary text-xs">
            {vehicle.lng.toFixed(4)}, {vehicle.lat.toFixed(4)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">Bearing</span>
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
    </div>
  );
};

export default VehicleDetail;
