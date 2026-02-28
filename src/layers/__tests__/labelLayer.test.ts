import { createLabelLayer } from '../labelLayer';
import type { VehiclePosition } from '@/types/vehicle';

vi.mock('@deck.gl/layers', () => ({
  TextLayer: class MockTextLayer {
    props: Record<string, unknown>;
    constructor(props: Record<string, unknown>) {
      this.props = props;
    }
  },
}));

const mockData: VehiclePosition[] = [
  { vehicleId: 'V-001', lng: 126.978, lat: 37.566, bearing: 90, status: 'running', speed: 40, waypointIndex: 3, totalWaypoints: 10 },
  { vehicleId: 'V-002', lng: 127.0, lat: 37.5, bearing: 0, status: 'idle', speed: 0, waypointIndex: 0, totalWaypoints: 8 },
];

describe('createLabelLayer', () => {
  it('returns a layer with id "vehicle-label-layer"', () => {
    const layer = createLabelLayer(mockData) as unknown as { props: Record<string, unknown> };
    expect(layer.props.id).toBe('vehicle-label-layer');
  });

  it('getText returns vehicleId', () => {
    const layer = createLabelLayer(mockData) as unknown as { props: Record<string, unknown> };
    const getText = layer.props.getText as (d: VehiclePosition) => string;
    expect(getText(mockData[0]!)).toBe('V-001');
    expect(getText(mockData[1]!)).toBe('V-002');
  });

  it('getPosition returns [lng, lat]', () => {
    const layer = createLabelLayer(mockData) as unknown as { props: Record<string, unknown> };
    const getPosition = layer.props.getPosition as (d: VehiclePosition) => number[];
    expect(getPosition(mockData[0]!)).toEqual([126.978, 37.566]);
  });

  it('getColor returns full alpha when no selection', () => {
    const layer = createLabelLayer(mockData) as unknown as { props: Record<string, unknown> };
    const getColor = layer.props.getColor as (d: VehiclePosition) => number[];
    expect(getColor(mockData[0]!)).toEqual([232, 236, 241, 230]);
  });

  it('dims non-selected labels (alpha 120)', () => {
    const layer = createLabelLayer(mockData, { selectedId: 'V-001' }) as unknown as { props: Record<string, unknown> };
    const getColor = layer.props.getColor as (d: VehiclePosition) => number[];
    expect(getColor(mockData[0]!)[3]).toBe(230);
    expect(getColor(mockData[1]!)[3]).toBe(120);
  });

  it('is not pickable', () => {
    const layer = createLabelLayer(mockData) as unknown as { props: Record<string, unknown> };
    expect(layer.props.pickable).toBe(false);
  });

  it('updateTriggers include selectedId', () => {
    const layer = createLabelLayer(mockData, { selectedId: 'V-001' }) as unknown as { props: Record<string, unknown> };
    const triggers = layer.props.updateTriggers as Record<string, unknown[]>;
    expect(triggers.getColor).toEqual(['V-001']);
  });
});
