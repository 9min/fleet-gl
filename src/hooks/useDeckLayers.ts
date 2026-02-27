import { useMemo } from 'react';
import { createVehicleLayer } from '@/layers/vehicleLayer';
import { createTripsLayer, createTripsLayerData } from '@/layers/tripsLayer';
import { createLabelLayer } from '@/layers/labelLayer';
import { useUIStore } from '@/stores/uiStore';
import { useSimulationStore } from '@/stores/simulationStore';
import type { VehiclePosition } from '@/types/vehicle';
import type { VehicleRoute } from '@/types/route';

export const useDeckLayers = (
  vehiclePositions: VehiclePosition[],
  routes: VehicleRoute[],
) => {
  const selectedVehicleId = useUIStore((s) => s.selectedVehicleId);
  const filters = useUIStore((s) => s.filters.status);
  const currentTime = useSimulationStore((s) => s.currentTime);

  const tripsData = useMemo(
    () => createTripsLayerData(routes),
    [routes],
  );

  const layers = useMemo(() => {
    const filtered = vehiclePositions.filter((v) =>
      filters.includes(v.status),
    );

    return [
      createTripsLayer(tripsData, currentTime, {
        selectedId: selectedVehicleId,
      }),
      createVehicleLayer(filtered, {
        selectedId: selectedVehicleId,
        filters,
      }),
      createLabelLayer(filtered, {
        selectedId: selectedVehicleId,
      }),
    ];
  }, [vehiclePositions, tripsData, currentTime, selectedVehicleId, filters]);

  return layers;
};
