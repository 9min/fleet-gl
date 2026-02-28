import { createGeofenceLayer } from '../geofenceLayer';
import type { GeofenceZone } from '@/types/geofence';

vi.mock('@deck.gl/layers', () => ({
  PolygonLayer: class MockPolygonLayer {
    props: Record<string, unknown>;
    constructor(props: Record<string, unknown>) {
      this.props = props;
    }
  },
}));

const mockZones: GeofenceZone[] = [
  {
    id: 'zone-1',
    name: 'Hub Zone',
    type: 'hub',
    polygon: [[126.9, 37.5], [127.0, 37.5], [127.0, 37.6], [126.9, 37.6]],
    center: [126.95, 37.55],
  },
  {
    id: 'zone-2',
    name: 'Restricted Zone',
    type: 'restricted',
    polygon: [[127.1, 37.4], [127.2, 37.4], [127.2, 37.5], [127.1, 37.5]],
    center: [127.15, 37.45],
  },
  {
    id: 'zone-3',
    name: 'Delivery Area',
    type: 'delivery-area',
    polygon: [[127.3, 37.3], [127.4, 37.3], [127.4, 37.4], [127.3, 37.4]],
    center: [127.35, 37.35],
  },
];

describe('createGeofenceLayer', () => {
  it('returns a layer with id "geofence-layer"', () => {
    const layer = createGeofenceLayer(mockZones) as unknown as { props: Record<string, unknown> };
    expect(layer.props.id).toBe('geofence-layer');
  });

  it('is pickable', () => {
    const layer = createGeofenceLayer(mockZones) as unknown as { props: Record<string, unknown> };
    expect(layer.props.pickable).toBe(true);
  });

  it('is filled and stroked', () => {
    const layer = createGeofenceLayer(mockZones) as unknown as { props: Record<string, unknown> };
    expect(layer.props.filled).toBe(true);
    expect(layer.props.stroked).toBe(true);
  });

  it('getFillColor returns correct color per zone type', () => {
    const layer = createGeofenceLayer(mockZones) as unknown as { props: Record<string, unknown> };
    const getFillColor = layer.props.getFillColor as (d: GeofenceZone) => number[];
    expect(getFillColor(mockZones[0]!)).toEqual([0, 212, 255, 30]);       // hub
    expect(getFillColor(mockZones[1]!)).toEqual([255, 71, 87, 25]);       // restricted
    expect(getFillColor(mockZones[2]!)).toEqual([0, 255, 136, 20]);       // delivery-area
  });

  it('getLineColor returns correct border color per zone type', () => {
    const layer = createGeofenceLayer(mockZones) as unknown as { props: Record<string, unknown> };
    const getLineColor = layer.props.getLineColor as (d: GeofenceZone) => number[];
    expect(getLineColor(mockZones[0]!)).toEqual([0, 212, 255, 120]);      // hub
    expect(getLineColor(mockZones[1]!)).toEqual([255, 71, 87, 100]);      // restricted
    expect(getLineColor(mockZones[2]!)).toEqual([0, 255, 136, 80]);       // delivery-area
  });

  it('getFillColor falls back to hub color for unknown type', () => {
    const unknownZone = { ...mockZones[0]!, type: 'unknown' as GeofenceZone['type'] };
    const layer = createGeofenceLayer([unknownZone]) as unknown as { props: Record<string, unknown> };
    const getFillColor = layer.props.getFillColor as (d: GeofenceZone) => number[];
    expect(getFillColor(unknownZone)).toEqual([0, 212, 255, 30]);
  });

  it('getPolygon returns zone polygon', () => {
    const layer = createGeofenceLayer(mockZones) as unknown as { props: Record<string, unknown> };
    const getPolygon = layer.props.getPolygon as (d: GeofenceZone) => [number, number][];
    expect(getPolygon(mockZones[0]!)).toEqual(mockZones[0]!.polygon);
  });
});
