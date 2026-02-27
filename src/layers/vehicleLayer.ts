import { SimpleMeshLayer } from '@deck.gl/mesh-layers';

import { createTruckMesh } from '@/utils/truckMesh';
import type { VehiclePosition, VehicleStatus } from '@/types/vehicle';

// Generate mesh once at module level (never per-frame)
const TRUCK_MESH = createTruckMesh();

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
  return new SimpleMeshLayer<VehiclePosition>({
    id: 'vehicle-layer',
    data,
    mesh: TRUCK_MESH,
    getPosition: (d) => [d.lng, d.lat, 0],
    getOrientation: (d) => [0, -d.bearing, 0],
    getColor: (d) => {
      const base = STATUS_COLORS[d.status] ?? STATUS_COLORS.running;
      if (options.selectedId && options.selectedId !== d.vehicleId) {
        return [...base, 200] as [number, number, number, number];
      }
      return [...base, 255] as [number, number, number, number];
    },
    sizeScale: 100,
    pickable: true,
    updateTriggers: {
      getColor: [options.selectedId, options.filters],
      getOrientation: [data],
    },
  });
};
