import { createVehicleLayer } from '../vehicleLayer';
import type { VehiclePosition } from '@/types/vehicle';

// Mock deck.gl SimpleMeshLayer to capture props
vi.mock('@deck.gl/mesh-layers', () => ({
  SimpleMeshLayer: class MockSimpleMeshLayer {
    props: Record<string, unknown>;
    constructor(props: Record<string, unknown>) {
      this.props = props;
    }
  },
}));

vi.mock('@/utils/truckMesh', () => ({
  createTruckMesh: () => ({
    positions: { value: new Float32Array(0), size: 3 },
    normals: { value: new Float32Array(0), size: 3 },
    indices: { value: new Uint16Array(0), size: 1 },
  }),
}));

const mockData: VehiclePosition[] = [
  { vehicleId: 'V-001', lng: 126.978, lat: 37.566, bearing: 90, status: 'running', speed: 40, waypointIndex: 3, totalWaypoints: 10 },
  { vehicleId: 'V-002', lng: 127.0, lat: 37.5, bearing: 180, status: 'idle', speed: 0, waypointIndex: 0, totalWaypoints: 8 },
  { vehicleId: 'V-003', lng: 127.1, lat: 37.4, bearing: 0, status: 'completed', speed: 0, waypointIndex: 8, totalWaypoints: 8 },
  { vehicleId: 'V-004', lng: 127.2, lat: 37.3, bearing: 270, status: 'delayed', speed: 10, waypointIndex: 2, totalWaypoints: 12 },
];

describe('createVehicleLayer', () => {
  it('returns a layer with id "vehicle-layer"', () => {
    const layer = createVehicleLayer(mockData) as unknown as { props: Record<string, unknown> };
    expect(layer.props.id).toBe('vehicle-layer');
  });

  it('sets pickable to true', () => {
    const layer = createVehicleLayer(mockData) as unknown as { props: Record<string, unknown> };
    expect(layer.props.pickable).toBe(true);
  });

  it('getPosition returns [lng, lat, 0]', () => {
    const layer = createVehicleLayer(mockData) as unknown as { props: Record<string, unknown> };
    const getPosition = layer.props.getPosition as (d: VehiclePosition) => number[];
    expect(getPosition(mockData[0]!)).toEqual([126.978, 37.566, 0]);
  });

  it('getOrientation returns [0, -bearing, 0]', () => {
    const layer = createVehicleLayer(mockData) as unknown as { props: Record<string, unknown> };
    const getOrientation = layer.props.getOrientation as (d: VehiclePosition) => number[];
    expect(getOrientation(mockData[0]!)).toEqual([0, -90, 0]);
  });

  it('getColor returns status-based colors with alpha 255 when no selection', () => {
    const layer = createVehicleLayer(mockData) as unknown as { props: Record<string, unknown> };
    const getColor = layer.props.getColor as (d: VehiclePosition) => number[];

    expect(getColor(mockData[0]!)).toEqual([0, 212, 255, 255]);     // running
    expect(getColor(mockData[1]!)).toEqual([255, 184, 0, 255]);     // idle
    expect(getColor(mockData[2]!)).toEqual([0, 255, 136, 255]);     // completed
    expect(getColor(mockData[3]!)).toEqual([255, 71, 87, 255]);     // delayed
  });

  it('dims non-selected vehicles (alpha 200)', () => {
    const layer = createVehicleLayer(mockData, { selectedId: 'V-001' }) as unknown as { props: Record<string, unknown> };
    const getColor = layer.props.getColor as (d: VehiclePosition) => number[];

    // Selected vehicle: full alpha
    expect(getColor(mockData[0]!)[3]).toBe(255);
    // Non-selected: dimmed
    expect(getColor(mockData[1]!)[3]).toBe(200);
  });

  it('updateTriggers include selectedId and filters', () => {
    const layer = createVehicleLayer(mockData, { selectedId: 'V-001', filters: ['running'] }) as unknown as { props: Record<string, unknown> };
    const triggers = layer.props.updateTriggers as Record<string, unknown[]>;
    expect(triggers.getColor).toEqual(['V-001', ['running']]);
  });
});
