import { createHeatmapLayer, createDeliveryDensityLayer } from '../heatmapLayer';
import type { VehiclePosition } from '@/types/vehicle';

vi.mock('@deck.gl/aggregation-layers', () => ({
  HeatmapLayer: class MockHeatmapLayer {
    props: Record<string, unknown>;
    constructor(props: Record<string, unknown>) {
      this.props = props;
    }
  },
}));

const mockPositions: VehiclePosition[] = [
  { vehicleId: 'V-001', lng: 126.978, lat: 37.566, bearing: 90, status: 'running', speed: 40, waypointIndex: 3, totalWaypoints: 10 },
  { vehicleId: 'V-002', lng: 127.0, lat: 37.5, bearing: 0, status: 'idle', speed: 0, waypointIndex: 0, totalWaypoints: 8 },
];

describe('createHeatmapLayer', () => {
  it('returns a layer with id "vehicle-heatmap"', () => {
    const layer = createHeatmapLayer(mockPositions) as unknown as { props: Record<string, unknown> };
    expect(layer.props.id).toBe('vehicle-heatmap');
  });

  it('getPosition returns [lng, lat]', () => {
    const layer = createHeatmapLayer(mockPositions) as unknown as { props: Record<string, unknown> };
    const getPosition = layer.props.getPosition as (d: VehiclePosition) => number[];
    expect(getPosition(mockPositions[0]!)).toEqual([126.978, 37.566]);
  });

  it('has correct radiusPixels', () => {
    const layer = createHeatmapLayer(mockPositions) as unknown as { props: Record<string, unknown> };
    expect(layer.props.radiusPixels).toBe(60);
  });

  it('has SUM aggregation', () => {
    const layer = createHeatmapLayer(mockPositions) as unknown as { props: Record<string, unknown> };
    expect(layer.props.aggregation).toBe('SUM');
  });

  it('has 5-color colorRange', () => {
    const layer = createHeatmapLayer(mockPositions) as unknown as { props: Record<string, unknown> };
    const colorRange = layer.props.colorRange as number[][];
    expect(colorRange).toHaveLength(5);
  });
});

describe('createDeliveryDensityLayer', () => {
  const completedPositions: [number, number][] = [
    [126.978, 37.566],
    [127.0, 37.5],
  ];

  it('returns a layer with id "delivery-density"', () => {
    const layer = createDeliveryDensityLayer(completedPositions) as unknown as { props: Record<string, unknown> };
    expect(layer.props.id).toBe('delivery-density');
  });

  it('has correct radiusPixels (40)', () => {
    const layer = createDeliveryDensityLayer(completedPositions) as unknown as { props: Record<string, unknown> };
    expect(layer.props.radiusPixels).toBe(40);
  });

  it('getPosition returns the coordinate tuple directly', () => {
    const layer = createDeliveryDensityLayer(completedPositions) as unknown as { props: Record<string, unknown> };
    const getPosition = layer.props.getPosition as (d: [number, number]) => [number, number];
    expect(getPosition(completedPositions[0]!)).toEqual([126.978, 37.566]);
  });
});
