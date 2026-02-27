import { pointInPolygon } from '../pointInPolygon';

// Simple square: (0,0) → (10,0) → (10,10) → (0,10)
const square: [number, number][] = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
];

describe('pointInPolygon', () => {
  it('returns true for point inside square', () => {
    expect(pointInPolygon([5, 5], square)).toBe(true);
  });

  it('returns false for point outside square', () => {
    expect(pointInPolygon([15, 15], square)).toBe(false);
  });

  it('returns true for point near inside edge', () => {
    expect(pointInPolygon([0.1, 0.1], square)).toBe(true);
  });

  it('returns false for point far outside', () => {
    expect(pointInPolygon([-5, -5], square)).toBe(false);
  });

  it('handles L-shaped polygon correctly', () => {
    // L-shape
    const lShape: [number, number][] = [
      [0, 0],
      [5, 0],
      [5, 5],
      [10, 5],
      [10, 10],
      [0, 10],
    ];

    // Inside the bottom part of the L
    expect(pointInPolygon([2, 2], lShape)).toBe(true);
    // Inside the top-right part of the L
    expect(pointInPolygon([7, 7], lShape)).toBe(true);
    // Outside the cut-out corner (top-right of bottom rect)
    expect(pointInPolygon([7, 2], lShape)).toBe(false);
  });
});
