import { MockWebSocket } from '../mockWebSocket';
import type { SimulationStats } from '@/types/simulation';

const mockStats: SimulationStats = {
  totalVehicles: 100,
  running: 60,
  idle: 20,
  completed: 15,
  delayed: 5,
  progressPercent: 50,
  totalDistance: 5000,
};

describe('MockWebSocket', () => {
  let ws: MockWebSocket;

  beforeEach(() => {
    vi.useFakeTimers();
    ws = new MockWebSocket();
  });

  afterEach(() => {
    ws.disconnect();
    vi.useRealTimers();
  });

  it('starts disconnected', () => {
    expect(ws.connected).toBe(false);
  });

  it('connect() sets connected to true', () => {
    ws.connect(() => mockStats, () => true);
    expect(ws.connected).toBe(true);
  });

  it('disconnect() sets connected to false', () => {
    ws.connect(() => mockStats, () => true);
    ws.disconnect();
    expect(ws.connected).toBe(false);
  });

  it('on() registers a listener and returns unsubscribe fn', () => {
    const listener = vi.fn();
    const unsub = ws.on(listener);
    expect(typeof unsub).toBe('function');

    ws.connect(() => mockStats, () => true);
    vi.advanceTimersByTime(3000);

    expect(listener).toHaveBeenCalled();

    const callCount = listener.mock.calls.length;
    unsub();
    vi.advanceTimersByTime(3000);
    // After unsubscribe, listener should not be called again
    expect(listener.mock.calls.length).toBe(callCount);
  });

  it('emits events when isPlaying is true', () => {
    const listener = vi.fn();
    ws.on(listener);
    ws.connect(() => mockStats, () => true);

    vi.advanceTimersByTime(5000);
    expect(listener.mock.calls.length).toBeGreaterThan(0);
  });

  it('does not emit events when isPlaying is false', () => {
    const listener = vi.fn();
    ws.on(listener);
    ws.connect(() => mockStats, () => false);

    vi.advanceTimersByTime(5000);
    expect(listener).not.toHaveBeenCalled();
  });
});
