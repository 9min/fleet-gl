import { PolygonLayer } from '@deck.gl/layers';
import type { GeofenceZone, GeofenceType } from '@/types/geofence';

const ZONE_COLORS: Record<GeofenceType, [number, number, number, number]> = {
  hub: [0, 212, 255, 30],
  restricted: [255, 71, 87, 25],
  'delivery-area': [0, 255, 136, 20],
};

const ZONE_BORDER_COLORS: Record<GeofenceType, [number, number, number, number]> = {
  hub: [0, 212, 255, 120],
  restricted: [255, 71, 87, 100],
  'delivery-area': [0, 255, 136, 80],
};

export const createGeofenceLayer = (
  zones: GeofenceZone[],
) => {
  return new PolygonLayer<GeofenceZone>({
    id: 'geofence-layer',
    data: zones,
    getPolygon: (d) => d.polygon,
    getFillColor: (d) => ZONE_COLORS[d.type] ?? ZONE_COLORS.hub,
    getLineColor: (d) => ZONE_BORDER_COLORS[d.type] ?? ZONE_BORDER_COLORS.hub,
    getLineWidth: 2,
    lineWidthMinPixels: 1,
    filled: true,
    stroked: true,
    pickable: true,
    extruded: false,
  });
};
