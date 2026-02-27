import { PathLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import type { WaypointProgress } from '@/types/routeDetail';

const WP_COLORS: Record<string, [number, number, number, number]> = {
  completed: [0, 255, 136, 220],
  current: [0, 212, 255, 255],
  upcoming: [136, 146, 160, 150],
};

export const createRoutePath = (
  path: [number, number][],
) => {
  if (path.length < 2) return null;

  return new PathLayer({
    id: 'route-detail-path',
    data: [{ path }],
    getPath: (d) => d.path,
    getColor: [0, 212, 255, 80],
    getWidth: 3,
    widthMinPixels: 1,
    widthMaxPixels: 4,
    getDashArray: [8, 4],
    dashJustified: true,
    extensions: [],
  });
};

export const createWaypointMarkers = (
  waypoints: WaypointProgress[],
) => {
  if (waypoints.length === 0) return null;

  return new ScatterplotLayer<WaypointProgress>({
    id: 'waypoint-markers',
    data: waypoints,
    getPosition: (d) => [d.lng, d.lat],
    getRadius: (d) => d.status === 'current' ? 120 : 80,
    radiusMinPixels: 4,
    radiusMaxPixels: 12,
    getFillColor: (d) => WP_COLORS[d.status] ?? WP_COLORS.upcoming as [number, number, number, number],
    getLineColor: (d) => (d.status === 'current' ? [0, 212, 255, 255] : [255, 255, 255, 60]) as [number, number, number, number],
    getLineWidth: (d) => d.status === 'current' ? 2 : 1,
    stroked: true,
    pickable: true,
    updateTriggers: {
      getFillColor: [waypoints.map((w) => w.status).join(',')],
      getRadius: [waypoints.map((w) => w.status).join(',')],
    },
  });
};

export const createWaypointLabels = (
  waypoints: WaypointProgress[],
) => {
  if (waypoints.length === 0) return null;

  return new TextLayer<WaypointProgress>({
    id: 'waypoint-labels',
    data: waypoints,
    getPosition: (d) => [d.lng, d.lat],
    getText: (d) => d.name,
    getSize: 10,
    getColor: (d) => {
      if (d.status === 'current') return [0, 212, 255, 255];
      if (d.status === 'completed') return [0, 255, 136, 200];
      return [136, 146, 160, 150];
    },
    getPixelOffset: [0, -16],
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 600,
    sizeMinPixels: 0,
    sizeMaxPixels: 11,
    billboard: true,
    pickable: false,
    updateTriggers: {
      getColor: [waypoints.map((w) => w.status).join(',')],
    },
  });
};
