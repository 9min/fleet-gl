import { TextLayer } from '@deck.gl/layers';
import type { VehiclePosition } from '@/types/vehicle';

export const createLabelLayer = (
  data: VehiclePosition[],
  options: { selectedId?: string | null } = {},
) => {
  return new TextLayer<VehiclePosition>({
    id: 'vehicle-label-layer',
    data,
    getPosition: (d) => [d.lng, d.lat],
    getText: (d) => d.vehicleId,
    getSize: 11,
    getColor: (d) => {
      if (options.selectedId && options.selectedId !== d.vehicleId) {
        return [232, 236, 241, 120];
      }
      return [232, 236, 241, 230];
    },
    getAngle: 0,
    getTextAnchor: 'start' as const,
    getAlignmentBaseline: 'center' as const,
    getPixelOffset: [14, 0],
    fontFamily: 'monospace',
    fontWeight: 700,
    sizeMinPixels: 0,
    sizeMaxPixels: 12,
    billboard: true,
    pickable: false,
    updateTriggers: {
      getColor: [options.selectedId],
    },
  });
};
