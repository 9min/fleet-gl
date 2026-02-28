import { createTripsLayerData, createTripsLayer } from '../tripsLayer';
import type { VehicleRoute } from '@/types/route';

// Mock TripsLayer
vi.mock('@deck.gl/geo-layers', () => ({
  TripsLayer: class MockTripsLayer {
    props: Record<string, unknown>;
    constructor(props: Record<string, unknown>) {
      this.props = props;
    }
  },
}));

const mockRoutes: VehicleRoute[] = [
  {
    vehicleId: 'V-001',
    vehicleName: 'Truck 1',
    waypoints: [],
    path: [
      { lng: 126.9, lat: 37.5, timestamp: 0 },
      { lng: 127.0, lat: 37.6, timestamp: 100 },
    ],
    totalDistance: 1000,
    estimatedDuration: 3600,
  },
  {
    vehicleId: 'V-002',
    vehicleName: 'Truck 2',
    waypoints: [],
    path: [
      { lng: 127.1, lat: 37.4, timestamp: 0 },
      { lng: 127.2, lat: 37.3, timestamp: 200 },
    ],
    totalDistance: 2000,
    estimatedDuration: 7200,
  },
];

describe('createTripsLayerData', () => {
  it('transforms routes to trip data format', () => {
    const data = createTripsLayerData(mockRoutes);
    expect(data).toHaveLength(2);
    expect(data[0]!.vehicleId).toBe('V-001');
    expect(data[0]!.path[0]!.coordinates).toEqual([126.9, 37.5]);
    expect(data[0]!.path[0]!.timestamp).toBe(0);
  });

  it('preserves all path points', () => {
    const data = createTripsLayerData(mockRoutes);
    expect(data[0]!.path).toHaveLength(2);
    expect(data[1]!.path).toHaveLength(2);
  });
});

describe('createTripsLayer', () => {
  const tripData = createTripsLayerData(mockRoutes);

  it('returns a layer with id "trips-layer"', () => {
    const layer = createTripsLayer(tripData, 50) as unknown as { props: Record<string, unknown> };
    expect(layer.props.id).toBe('trips-layer');
  });

  it('passes currentTime', () => {
    const layer = createTripsLayer(tripData, 50) as unknown as { props: Record<string, unknown> };
    expect(layer.props.currentTime).toBe(50);
  });

  it('getColor returns full alpha when no selection', () => {
    const layer = createTripsLayer(tripData, 50) as unknown as { props: Record<string, unknown> };
    const getColor = layer.props.getColor as (d: { vehicleId: string }) => number[];
    const color = getColor({ vehicleId: 'V-001' });
    expect(color[3]).toBe(230);
  });

  it('dims non-selected vehicle trails (alpha 80)', () => {
    const layer = createTripsLayer(tripData, 50, { selectedId: 'V-001' }) as unknown as { props: Record<string, unknown> };
    const getColor = layer.props.getColor as (d: { vehicleId: string }) => number[];
    expect(getColor({ vehicleId: 'V-002' })[3]).toBe(80);
    expect(getColor({ vehicleId: 'V-001' })[3]).toBe(230);
  });

  it('getWidth returns wider trail for selected vehicle', () => {
    const layer = createTripsLayer(tripData, 50, { selectedId: 'V-001' }) as unknown as { props: Record<string, unknown> };
    const getWidth = layer.props.getWidth as (d: { vehicleId: string }) => number;
    expect(getWidth({ vehicleId: 'V-001' })).toBe(6);
    expect(getWidth({ vehicleId: 'V-002' })).toBe(3);
  });

  it('updateTriggers include selectedId', () => {
    const layer = createTripsLayer(tripData, 50, { selectedId: 'V-001' }) as unknown as { props: Record<string, unknown> };
    const triggers = layer.props.updateTriggers as Record<string, unknown[]>;
    expect(triggers.getColor).toEqual(['V-001']);
    expect(triggers.getWidth).toEqual(['V-001']);
  });
});
