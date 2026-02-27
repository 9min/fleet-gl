import { useMemo } from 'react';
import { createVehicleLayer } from '@/layers/vehicleLayer';
import { createTripsLayer, createTripsLayerData } from '@/layers/tripsLayer';
import { createLabelLayer } from '@/layers/labelLayer';
import { createRoutePath, createWaypointMarkers, createWaypointLabels } from '@/layers/routeDetailLayer';
import { useUIStore } from '@/stores/uiStore';
import { useSimulationStore } from '@/stores/simulationStore';
import type { VehiclePosition } from '@/types/vehicle';
import type { VehicleRoute } from '@/types/route';
import type { WaypointProgress } from '@/types/routeDetail';
import type { Layer } from '@deck.gl/core';

export const useDeckLayers = (
  vehiclePositions: VehiclePosition[],
  routes: VehicleRoute[],
  geofenceLayers: Layer[] = [],
  heatmapLayers: Layer[] = [],
) => {
  const selectedVehicleId = useUIStore((s) => s.selectedVehicleId);
  const filters = useUIStore((s) => s.filters.status);
  const layerVisibility = useUIStore((s) => s.layerVisibility);
  const currentTime = useSimulationStore((s) => s.currentTime);

  const tripsData = useMemo(
    () => createTripsLayerData(routes),
    [routes],
  );

  const layers = useMemo(() => {
    const filtered = vehiclePositions.filter((v) =>
      filters.includes(v.status),
    );

    const result: Layer[] = [];

    // Geofence layers (bottom)
    if (layerVisibility.geofences) {
      result.push(...geofenceLayers);
    }

    // Heatmap layers
    if (layerVisibility.heatmap || layerVisibility.density) {
      result.push(...heatmapLayers);
    }

    // Trips layer
    if (layerVisibility.trails) {
      result.push(
        createTripsLayer(tripsData, currentTime, {
          selectedId: selectedVehicleId,
        }),
      );
    }

    // Route detail layers (when vehicle selected)
    if (selectedVehicleId) {
      const route = routes.find((r) => r.vehicleId === selectedVehicleId);
      const vehicle = vehiclePositions.find((v) => v.vehicleId === selectedVehicleId);
      if (route && vehicle) {
        const routePath: [number, number][] = route.path.map((p) => [p.lng, p.lat]);
        const pathLayer = createRoutePath(routePath);
        if (pathLayer) result.push(pathLayer);

        const waypoints: WaypointProgress[] = route.waypoints.map((wp, i) => ({
          name: wp.name,
          plannedArrival: wp.arrivalTime,
          actualArrival: vehicle.waypointIndex > i ? wp.arrivalTime : null,
          status: vehicle.waypointIndex > i ? 'completed' : vehicle.waypointIndex === i && vehicle.status !== 'completed' ? 'current' : 'upcoming',
          deviationSeconds: 0,
          lng: wp.lng,
          lat: wp.lat,
        }));

        const markers = createWaypointMarkers(waypoints);
        if (markers) result.push(markers);
        const labels = createWaypointLabels(waypoints);
        if (labels) result.push(labels);
      }
    }

    // Vehicle layer
    if (layerVisibility.vehicles) {
      result.push(
        createVehicleLayer(filtered, {
          selectedId: selectedVehicleId,
          filters,
        }),
      );
      result.push(
        createLabelLayer(filtered, {
          selectedId: selectedVehicleId,
        }),
      );
    }

    return result;
  }, [vehiclePositions, tripsData, currentTime, selectedVehicleId, filters, layerVisibility, routes, geofenceLayers, heatmapLayers]);

  return layers;
};
