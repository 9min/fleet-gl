import { bearing, lerp, haversineDistance } from '../geo';

describe('bearing', () => {
  it('returns ~90° when moving east', () => {
    const result = bearing(126.0, 37.0, 127.0, 37.0);
    expect(result).toBeCloseTo(90, 0);
  });

  it('returns ~0° when moving north', () => {
    const result = bearing(126.0, 37.0, 126.0, 38.0);
    expect(result).toBeCloseTo(0, 0);
  });

  it('returns ~180° when moving south', () => {
    const result = bearing(126.0, 38.0, 126.0, 37.0);
    expect(result).toBeCloseTo(180, 0);
  });

  it('returns ~270° when moving west', () => {
    const result = bearing(127.0, 37.0, 126.0, 37.0);
    expect(result).toBeCloseTo(270, 0);
  });

  it('returns 0 for identical coordinates', () => {
    const result = bearing(126.0, 37.0, 126.0, 37.0);
    expect(result).toBe(0);
  });
});

describe('lerp', () => {
  it('returns a when t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns b when t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint when t=0.5', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });
});

describe('haversineDistance', () => {
  it('returns ~27km for Seoul to Incheon', () => {
    // Seoul (126.978, 37.566) → Incheon (126.705, 37.456)
    const dist = haversineDistance(126.978, 37.566, 126.705, 37.456);
    expect(dist).toBeGreaterThan(25_000);
    expect(dist).toBeLessThan(30_000);
  });

  it('returns 0 for identical coordinates', () => {
    const dist = haversineDistance(126.978, 37.566, 126.978, 37.566);
    expect(dist).toBe(0);
  });
});
