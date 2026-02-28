import { useAnalyticsStore } from '../analyticsStore';
import type { TimeSeriesPoint, VehicleMetric } from '@/types/analytics';

const makePoint = (time: number): TimeSeriesPoint => ({
  time,
  running: 50,
  idle: 20,
  completed: 20,
  delayed: 10,
  progressPercent: 50,
});

describe('analyticsStore', () => {
  beforeEach(() => {
    useAnalyticsStore.setState({
      timeSeries: [],
      vehicleMetrics: [],
      eventLog: [],
    });
  });

  it('has empty initial state', () => {
    const state = useAnalyticsStore.getState();
    expect(state.timeSeries).toHaveLength(0);
    expect(state.vehicleMetrics).toHaveLength(0);
    expect(state.eventLog).toHaveLength(0);
  });

  it('addTimeSeriesPoint appends a point', () => {
    useAnalyticsStore.getState().addTimeSeriesPoint(makePoint(1000));
    expect(useAnalyticsStore.getState().timeSeries).toHaveLength(1);
    expect(useAnalyticsStore.getState().timeSeries[0]!.time).toBe(1000);
  });

  it('addTimeSeriesPoint caps at ~121 entries (keeps last 120 + new)', () => {
    for (let i = 0; i < 130; i++) {
      useAnalyticsStore.getState().addTimeSeriesPoint(makePoint(i));
    }
    const ts = useAnalyticsStore.getState().timeSeries;
    expect(ts.length).toBeLessThanOrEqual(121);
    // The oldest remaining point should be around index 9 (130 - 121)
    expect(ts[0]!.time).toBeGreaterThanOrEqual(9);
  });

  it('setVehicleMetrics replaces metrics', () => {
    const metrics: VehicleMetric[] = [
      { vehicleId: 'V-001', completedWaypoints: 5, totalWaypoints: 10, completionRate: 0.5 },
    ];
    useAnalyticsStore.getState().setVehicleMetrics(metrics);
    expect(useAnalyticsStore.getState().vehicleMetrics).toHaveLength(1);
    expect(useAnalyticsStore.getState().vehicleMetrics[0]!.vehicleId).toBe('V-001');
  });

  it('addEvent appends an event with generated id', () => {
    useAnalyticsStore.getState().addEvent({
      type: 'alert',
      message: 'Test event',
      vehicleId: 'V-001',
      timestamp: Date.now(),
      color: '#ff0000',
    });
    const events = useAnalyticsStore.getState().eventLog;
    expect(events).toHaveLength(1);
    expect(events[0]!.id).toMatch(/^evt-/);
    expect(events[0]!.message).toBe('Test event');
  });

  it('addEvent caps at 200 entries', () => {
    for (let i = 0; i < 210; i++) {
      useAnalyticsStore.getState().addEvent({
        type: 'vehicle_status',
        message: `Event ${i}`,
        timestamp: i,
        color: '#fff',
      });
    }
    const events = useAnalyticsStore.getState().eventLog;
    expect(events.length).toBeLessThanOrEqual(200);
  });

  it('each event has a unique id', () => {
    useAnalyticsStore.getState().addEvent({
      type: 'alert',
      message: 'A',
      timestamp: 1,
      color: '#fff',
    });
    useAnalyticsStore.getState().addEvent({
      type: 'alert',
      message: 'B',
      timestamp: 2,
      color: '#fff',
    });
    const [a, b] = useAnalyticsStore.getState().eventLog;
    expect(a!.id).not.toBe(b!.id);
  });

  it('clearTimeSeries resets timeSeries and eventLog', () => {
    useAnalyticsStore.getState().addTimeSeriesPoint(makePoint(1));
    useAnalyticsStore.getState().addEvent({
      type: 'alert',
      message: 'x',
      timestamp: 1,
      color: '#fff',
    });
    useAnalyticsStore.getState().clearTimeSeries();
    const state = useAnalyticsStore.getState();
    expect(state.timeSeries).toHaveLength(0);
    expect(state.eventLog).toHaveLength(0);
  });
});
