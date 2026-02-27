import { TripsLayer } from '@deck.gl/geo-layers';
import type { VehicleRoute } from '@/types/route';

const TRAIL_LENGTH = 600;
const TRAIL_WIDTH = 3;
const TRAIL_WIDTH_SELECTED = 6;

const TRAIL_COLOR: [number, number, number] = [0, 212, 255];

type TripData = {
  vehicleId: string;
  path: { coordinates: [number, number]; timestamp: number }[];
};

export const createTripsLayerData = (routes: VehicleRoute[]): TripData[] => {
  return routes.map((route) => ({
    vehicleId: route.vehicleId,
    path: route.path.map((p) => ({
      coordinates: [p.lng, p.lat] as [number, number],
      timestamp: p.timestamp,
    })),
  }));
};

export const createTripsLayer = (
  data: TripData[],
  currentTime: number,
  options: { selectedId?: string | null } = {},
) => {
  return new TripsLayer<TripData>({
    id: 'trips-layer',
    data,
    getPath: (d) => d.path.map((p) => p.coordinates),
    getTimestamps: (d) => d.path.map((p) => p.timestamp),
    getColor: (d) => {
      if (options.selectedId && options.selectedId !== d.vehicleId) {
        return [0, 212, 255, 40] as [number, number, number, number];
      }
      return [...TRAIL_COLOR, 200] as [number, number, number, number];
    },
    getWidth: (d) =>
      options.selectedId === d.vehicleId ? TRAIL_WIDTH_SELECTED : TRAIL_WIDTH,
    currentTime,
    trailLength: TRAIL_LENGTH,
    fadeTrail: true,
    widthMinPixels: 1,
    widthMaxPixels: 8,
    updateTriggers: {
      getColor: [options.selectedId],
      getWidth: [options.selectedId],
    },
  });
};
