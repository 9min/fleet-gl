import type { VehiclePosition } from '@/types/vehicle';

type VehicleTooltipProps = {
  x: number;
  y: number;
  vehicle: VehiclePosition;
};

const STATUS_LABELS: Record<string, string> = {
  running: 'Running',
  idle: 'Idle',
  completed: 'Completed',
  delayed: 'Delayed',
};

const STATUS_COLORS: Record<string, string> = {
  running: '#00D4FF',
  idle: '#FFB800',
  completed: '#00FF88',
  delayed: '#FF4757',
};

const VehicleTooltip = ({ x, y, vehicle }: VehicleTooltipProps) => {
  const progress = vehicle.totalWaypoints > 0
    ? Math.round((vehicle.waypointIndex / vehicle.totalWaypoints) * 100)
    : 0;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{ left: x + 12, top: y - 12 }}
    >
      <div className="glass-panel px-3 py-2 min-w-[160px]">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[vehicle.status] }}
          />
          <span className="font-mono text-xs font-bold text-text-primary">
            {vehicle.vehicleId}
          </span>
        </div>
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-text-secondary">Status</span>
            <span style={{ color: STATUS_COLORS[vehicle.status] }}>
              {STATUS_LABELS[vehicle.status]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Progress</span>
            <span className="text-text-primary font-mono">
              {vehicle.waypointIndex}/{vehicle.totalWaypoints} ({progress}%)
            </span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: STATUS_COLORS[vehicle.status],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleTooltip;
