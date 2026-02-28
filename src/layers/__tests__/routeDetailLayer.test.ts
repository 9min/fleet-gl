import { createRoutePath, createWaypointMarkers, createWaypointLabels } from '../routeDetailLayer';
import type { WaypointProgress } from '@/types/routeDetail';

vi.mock('@deck.gl/layers', () => ({
  PathLayer: class MockPathLayer {
    props: Record<string, unknown>;
    constructor(props: Record<string, unknown>) {
      this.props = props;
    }
  },
  ScatterplotLayer: class MockScatterplotLayer {
    props: Record<string, unknown>;
    constructor(props: Record<string, unknown>) {
      this.props = props;
    }
  },
  TextLayer: class MockTextLayer {
    props: Record<string, unknown>;
    constructor(props: Record<string, unknown>) {
      this.props = props;
    }
  },
}));

const mockWaypoints: WaypointProgress[] = [
  { name: 'Depot A', plannedArrival: 0, actualArrival: 10, status: 'completed', deviationSeconds: 10, lng: 126.9, lat: 37.5 },
  { name: 'Stop B', plannedArrival: 1000, actualArrival: null, status: 'current', deviationSeconds: 0, lng: 127.0, lat: 37.6 },
  { name: 'Stop C', plannedArrival: 2000, actualArrival: null, status: 'upcoming', deviationSeconds: 0, lng: 127.1, lat: 37.7 },
];

describe('createRoutePath', () => {
  it('returns null for path with fewer than 2 points', () => {
    expect(createRoutePath([[126.9, 37.5]])).toBeNull();
    expect(createRoutePath([])).toBeNull();
  });

  it('returns a PathLayer for valid path', () => {
    const layer = createRoutePath([[126.9, 37.5], [127.0, 37.6]]) as unknown as { props: Record<string, unknown> };
    expect(layer).not.toBeNull();
    expect(layer.props.id).toBe('route-detail-path');
  });

  it('sets dashed line style', () => {
    const layer = createRoutePath([[126.9, 37.5], [127.0, 37.6]]) as unknown as { props: Record<string, unknown> };
    expect(layer.props.getDashArray).toEqual([8, 4]);
  });
});

describe('createWaypointMarkers', () => {
  it('returns null for empty waypoints', () => {
    expect(createWaypointMarkers([])).toBeNull();
  });

  it('returns a ScatterplotLayer with correct id', () => {
    const layer = createWaypointMarkers(mockWaypoints) as unknown as { props: Record<string, unknown> };
    expect(layer.props.id).toBe('waypoint-markers');
  });

  it('getRadius returns larger radius for current waypoint', () => {
    const layer = createWaypointMarkers(mockWaypoints) as unknown as { props: Record<string, unknown> };
    const getRadius = layer.props.getRadius as (d: WaypointProgress) => number;
    expect(getRadius(mockWaypoints[1]!)).toBe(120); // current
    expect(getRadius(mockWaypoints[0]!)).toBe(80);  // completed
  });

  it('getFillColor returns status-appropriate colors', () => {
    const layer = createWaypointMarkers(mockWaypoints) as unknown as { props: Record<string, unknown> };
    const getFillColor = layer.props.getFillColor as (d: WaypointProgress) => number[];
    expect(getFillColor(mockWaypoints[0]!)).toEqual([0, 255, 136, 220]);   // completed
    expect(getFillColor(mockWaypoints[1]!)).toEqual([0, 212, 255, 255]);   // current
    expect(getFillColor(mockWaypoints[2]!)).toEqual([136, 146, 160, 150]); // upcoming
  });

  it('is pickable', () => {
    const layer = createWaypointMarkers(mockWaypoints) as unknown as { props: Record<string, unknown> };
    expect(layer.props.pickable).toBe(true);
  });
});

describe('createWaypointLabels', () => {
  it('returns null for empty waypoints', () => {
    expect(createWaypointLabels([])).toBeNull();
  });

  it('returns a TextLayer with correct id', () => {
    const layer = createWaypointLabels(mockWaypoints) as unknown as { props: Record<string, unknown> };
    expect(layer.props.id).toBe('waypoint-labels');
  });

  it('getText returns waypoint name', () => {
    const layer = createWaypointLabels(mockWaypoints) as unknown as { props: Record<string, unknown> };
    const getText = layer.props.getText as (d: WaypointProgress) => string;
    expect(getText(mockWaypoints[0]!)).toBe('Depot A');
  });

  it('getColor returns cyan for current, green for completed, gray for upcoming', () => {
    const layer = createWaypointLabels(mockWaypoints) as unknown as { props: Record<string, unknown> };
    const getColor = layer.props.getColor as (d: WaypointProgress) => number[];
    expect(getColor(mockWaypoints[0]!)).toEqual([0, 255, 136, 200]);    // completed
    expect(getColor(mockWaypoints[1]!)).toEqual([0, 212, 255, 255]);    // current
    expect(getColor(mockWaypoints[2]!)).toEqual([136, 146, 160, 150]);  // upcoming
  });
});
