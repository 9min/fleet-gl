import { formatTime, formatSpeed, formatDistance, padVehicleId } from '../format';

describe('formatTime', () => {
  it('formats 0 seconds as 06:00 (base offset)', () => {
    expect(formatTime(0)).toBe('06:00');
  });

  it('formats 3600 seconds as 07:00', () => {
    expect(formatTime(3600)).toBe('07:00');
  });

  it('formats 36000 seconds as 16:00', () => {
    expect(formatTime(36000)).toBe('16:00');
  });
});

describe('formatSpeed', () => {
  it('formats 0 m/s as 0 km/h', () => {
    expect(formatSpeed(0)).toBe('0 km/h');
  });

  it('formats 27.78 m/s as 100 km/h', () => {
    expect(formatSpeed(27.78)).toBe('100 km/h');
  });
});

describe('formatDistance', () => {
  it('formats 500m as "500 m"', () => {
    expect(formatDistance(500)).toBe('500 m');
  });

  it('formats 1500m as "1.5 km"', () => {
    expect(formatDistance(1500)).toBe('1.5 km');
  });
});

describe('padVehicleId', () => {
  it('pads single digit: 1 → "V-001"', () => {
    expect(padVehicleId(1)).toBe('V-001');
  });

  it('pads triple digit: 100 → "V-100"', () => {
    expect(padVehicleId(100)).toBe('V-100');
  });
});
