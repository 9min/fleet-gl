import { createVehicleLayer } from '@/layers/vehicleLayer';
import { createTripsLayer, createTripsLayerData } from '@/layers/tripsLayer';
import { createLabelLayer } from '@/layers/labelLayer';
import { createRoutePath, createWaypointMarkers, createWaypointLabels } from '@/layers/routeDetailLayer';
import { createHeatmapLayer, createDeliveryDensityLayer } from '@/layers/heatmapLayer';
import { createGeofenceLayer } from '@/layers/geofenceLayer';
import { useUIStore } from '@/stores/uiStore';
import { useSimulationStore } from '@/stores/simulationStore';
import type { VehiclePosition } from '@/types/vehicle';
import type { VehicleRoute } from '@/types/route';
import type { GeofenceZone } from '@/types/geofence';
import type { WaypointProgress } from '@/types/routeDetail';
import type { Layer } from '@deck.gl/core';

// --- Cached trips data (only recomputed when routes change) ---
let cachedTripsData: ReturnType<typeof createTripsLayerData> = [];
let cachedTripsRoutes: VehicleRoute[] = [];

// --- Cached heatmap layers (refreshed every 2s of sim time) ---
let cachedHeatmapLayers: Layer[] = [];
let lastHeatmapTime = -Infinity;
const HEATMAP_REFRESH_INTERVAL = 2; // seconds of sim time

// --- Cached geofence layer (refreshed when geofences change) ---
let cachedGeofenceLayers: Layer[] = [];
let cachedGeofenceData: GeofenceZone[] = [];

export const initTripsData = (routes: VehicleRoute[]) => {
  if (routes !== cachedTripsRoutes) {
    cachedTripsRoutes = routes;
    cachedTripsData = createTripsLayerData(routes);
  }
};

export const initGeofenceData = (geofences: GeofenceZone[]) => {
  if (geofences !== cachedGeofenceData) {
    cachedGeofenceData = geofences;
    cachedGeofenceLayers = geofences.length > 0 ? [createGeofenceLayer(geofences)] : [];
  }
};

export const buildLayers = (
  positions: VehiclePosition[],
  routes: VehicleRoute[],
): Layer[] => {
  const { selectedVehicleId, filters, layerVisibility } = useUIStore.getState();
  const { currentTime } = useSimulationStore.getState();
  const statusFilters = filters.status;

  const filtered = positions.filter((v) => statusFilters.includes(v.status));
  const result: Layer[] = [];

  // Geofence layers (bottom)
  if (layerVisibility.geofences) {
    result.push(...cachedGeofenceLayers);
  }

  // Heatmap layers (cached, refresh every 2s sim time)
  if (layerVisibility.heatmap || layerVisibility.density) {
    if (currentTime - lastHeatmapTime >= HEATMAP_REFRESH_INTERVAL) {
      lastHeatmapTime = currentTime;
      const newHeatmap: Layer[] = [];
      if (layerVisibility.heatmap && positions.length > 0) {
        newHeatmap.push(createHeatmapLayer(positions));
      }
      if (layerVisibility.density && positions.length > 0) {
        const completedPos: [number, number][] = positions
          .filter((v) => v.status === 'completed')
          .map((v) => [v.lng, v.lat]);
        if (completedPos.length > 0) {
          newHeatmap.push(createDeliveryDensityLayer(completedPos));
        }
      }
      cachedHeatmapLayers = newHeatmap;
    }
    result.push(...cachedHeatmapLayers);
  }

  // Trips layer
  if (layerVisibility.trails) {
    result.push(
      createTripsLayer(cachedTripsData, currentTime, {
        selectedId: selectedVehicleId,
      }),
    );
  }

  // Route detail layers (when vehicle selected)
  if (selectedVehicleId) {
    const route = routes.find((r) => r.vehicleId === selectedVehicleId);
    const vehicle = positions.find((v) => v.vehicleId === selectedVehicleId);
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
        filters: statusFilters,
      }),
    );
    result.push(
      createLabelLayer(filtered, {
        selectedId: selectedVehicleId,
      }),
    );
  }

  return result;
};
