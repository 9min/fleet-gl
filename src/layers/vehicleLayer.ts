import { ScatterplotLayer } from '@deck.gl/layers';
import type { VehiclePosition, VehicleStatus } from '@/types/vehicle';

const VEHICLE_RADIUS = 80;
const VEHICLE_RADIUS_MIN_PIXELS = 4;
const VEHICLE_RADIUS_MAX_PIXELS = 20;

const STATUS_COLORS: Record<VehicleStatus, [number, number, number]> = {
  running: [0, 212, 255],
  idle: [255, 184, 0],
  completed: [0, 255, 136],
  delayed: [255, 71, 87],
};

export const createVehicleLayer = (
  data: VehiclePosition[],
  options: {
    selectedId?: string | null;
    filters?: VehicleStatus[];
  } = {},
) => {
  return new ScatterplotLayer<VehiclePosition>({
    id: 'vehicle-layer',
    data,
    getPosition: (d) => [d.lng, d.lat],
    getRadius: (d) =>
      options.selectedId === d.vehicleId ? VEHICLE_RADIUS * 1.5 : VEHICLE_RADIUS,
    radiusMinPixels: VEHICLE_RADIUS_MIN_PIXELS,
    radiusMaxPixels: VEHICLE_RADIUS_MAX_PIXELS,
    getFillColor: (d) => {
      const base = STATUS_COLORS[d.status] ?? STATUS_COLORS.running;
      if (options.selectedId && options.selectedId !== d.vehicleId) {
        return [...base, 80] as [number, number, number, number];
      }
      return [...base, 255] as [number, number, number, number];
    },
    pickable: true,
    updateTriggers: {
      getRadius: [options.selectedId],
      getFillColor: [options.selectedId, options.filters],
    },
  });
};
