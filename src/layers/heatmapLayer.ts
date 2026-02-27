import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import type { VehiclePosition } from '@/types/vehicle';

export const createHeatmapLayer = (
  data: VehiclePosition[],
) => {
  return new HeatmapLayer<VehiclePosition>({
    id: 'vehicle-heatmap',
    data,
    getPosition: (d) => [d.lng, d.lat],
    getWeight: 1,
    radiusPixels: 60,
    intensity: 1.2,
    threshold: 0.05,
    colorRange: [
      [0, 212, 255, 0],
      [0, 212, 255, 80],
      [0, 255, 136, 120],
      [255, 184, 0, 160],
      [255, 71, 87, 200],
    ],
    aggregation: 'SUM',
  });
};

export const createDeliveryDensityLayer = (
  completedPositions: [number, number][],
) => {
  return new HeatmapLayer({
    id: 'delivery-density',
    data: completedPositions,
    getPosition: (d) => d,
    getWeight: 1,
    radiusPixels: 40,
    intensity: 0.8,
    threshold: 0.03,
    colorRange: [
      [0, 255, 136, 0],
      [0, 255, 136, 60],
      [0, 212, 255, 100],
      [255, 184, 0, 140],
      [255, 71, 87, 180],
    ],
    aggregation: 'SUM',
  });
};
