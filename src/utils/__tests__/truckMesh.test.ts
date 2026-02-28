import { createTruckMesh } from '../truckMesh';

describe('createTruckMesh', () => {
  const mesh = createTruckMesh();

  it('returns positions, normals, and indices', () => {
    expect(mesh.positions).toBeDefined();
    expect(mesh.normals).toBeDefined();
    expect(mesh.indices).toBeDefined();
  });

  it('positions and normals have size 3', () => {
    expect(mesh.positions.size).toBe(3);
    expect(mesh.normals.size).toBe(3);
  });

  it('indices have size 1', () => {
    expect(mesh.indices.size).toBe(1);
  });

  it('has 48 vertices (2 boxes × 24 vertices each)', () => {
    // Each box = 6 faces × 4 vertices = 24
    // 2 boxes = 48 vertices
    // positions array length = 48 × 3 = 144
    expect(mesh.positions.value.length).toBe(144);
    expect(mesh.normals.value.length).toBe(144);
  });

  it('has 72 indices (2 boxes × 6 faces × 2 triangles × 3 vertices)', () => {
    // Each box = 6 faces × 2 triangles × 3 indices = 36
    // 2 boxes = 72
    expect(mesh.indices.value.length).toBe(72);
  });

  it('all indices are within vertex range', () => {
    const maxVertex = mesh.positions.value.length / 3;
    for (let i = 0; i < mesh.indices.value.length; i++) {
      expect(mesh.indices.value[i]).toBeLessThan(maxVertex);
      expect(mesh.indices.value[i]).toBeGreaterThanOrEqual(0);
    }
  });

  it('normals are unit vectors', () => {
    const n = mesh.normals.value;
    for (let i = 0; i < n.length; i += 3) {
      const len = Math.sqrt(n[i]! ** 2 + n[i + 1]! ** 2 + n[i + 2]! ** 2);
      expect(len).toBeCloseTo(1, 5);
    }
  });

  it('uses Float32Array for positions and normals', () => {
    expect(mesh.positions.value).toBeInstanceOf(Float32Array);
    expect(mesh.normals.value).toBeInstanceOf(Float32Array);
  });

  it('uses Uint16Array for indices', () => {
    expect(mesh.indices.value).toBeInstanceOf(Uint16Array);
  });
});
