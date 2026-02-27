/**
 * Programmatic low-poly box truck mesh generator.
 * Produces a simple truck geometry (cargo box + cabin) without external model files.
 *
 * Truck front faces +Y direction (North).
 *
 * Side view (→ = +Y = forward):
 *       ┌───┐
 *       │cab│ h=0.45
 *    ┌──┴───┤
 *    │cargo │ h=0.25
 *    └──────┘
 *
 * Cargo box: (-0.4, -0.5, 0) → (0.4, 0.3, 0.25)
 * Cabin:     (-0.35, 0.3, 0) → (0.35, 0.5, 0.45)
 *
 * Total: 48 vertices, 24 triangles (ultra-lightweight)
 */

type BoxParams = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
};

type MeshData = {
  positions: { value: Float32Array; size: number };
  normals: { value: Float32Array; size: number };
  indices: { value: Uint16Array; size: number };
};

/**
 * Add a box to the mesh buffers.
 * All faces use CCW winding when viewed from outside → outward-pointing normals.
 */
const addBox = (
  box: BoxParams,
  positions: number[],
  normals: number[],
  indices: number[],
  vertexOffset: number,
) => {
  const { minX, maxX, minY, maxY, minZ, maxZ } = box;

  // 6 faces × 4 vertices = 24 vertices per box
  // Each face has its own vertices for correct flat-shading normals

  // Front face (+Y normal)
  const v = vertexOffset;
  positions.push(
    maxX, maxY, minZ,
    minX, maxY, minZ,
    minX, maxY, maxZ,
    maxX, maxY, maxZ,
  );
  normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
  indices.push(v, v + 1, v + 2, v, v + 2, v + 3);

  // Back face (-Y normal)
  const b = v + 4;
  positions.push(
    minX, minY, minZ,
    maxX, minY, minZ,
    maxX, minY, maxZ,
    minX, minY, maxZ,
  );
  normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0);
  indices.push(b, b + 1, b + 2, b, b + 2, b + 3);

  // Right face (+X normal)
  const r = v + 8;
  positions.push(
    maxX, minY, minZ,
    maxX, maxY, minZ,
    maxX, maxY, maxZ,
    maxX, minY, maxZ,
  );
  normals.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);
  indices.push(r, r + 1, r + 2, r, r + 2, r + 3);

  // Left face (-X normal)
  const l = v + 12;
  positions.push(
    minX, maxY, minZ,
    minX, minY, minZ,
    minX, minY, maxZ,
    minX, maxY, maxZ,
  );
  normals.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0);
  indices.push(l, l + 1, l + 2, l, l + 2, l + 3);

  // Top face (+Z normal)
  const t = v + 16;
  positions.push(
    minX, minY, maxZ,
    maxX, minY, maxZ,
    maxX, maxY, maxZ,
    minX, maxY, maxZ,
  );
  normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
  indices.push(t, t + 1, t + 2, t, t + 2, t + 3);

  // Bottom face (-Z normal)
  const bo = v + 20;
  positions.push(
    minX, maxY, minZ,
    maxX, maxY, minZ,
    maxX, minY, minZ,
    minX, minY, minZ,
  );
  normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
  indices.push(bo, bo + 1, bo + 2, bo, bo + 2, bo + 3);

  return vertexOffset + 24;
};

export const createTruckMesh = (): MeshData => {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  let offset = 0;

  // Cargo box: wider, lower
  offset = addBox(
    { minX: -0.4, maxX: 0.4, minY: -0.5, maxY: 0.3, minZ: 0, maxZ: 0.25 },
    positions,
    normals,
    indices,
    offset,
  );

  // Cabin: narrower, taller
  addBox(
    { minX: -0.35, maxX: 0.35, minY: 0.3, maxY: 0.5, minZ: 0, maxZ: 0.45 },
    positions,
    normals,
    indices,
    offset,
  );

  return {
    positions: { value: new Float32Array(positions), size: 3 },
    normals: { value: new Float32Array(normals), size: 3 },
    indices: { value: new Uint16Array(indices), size: 1 },
  };
};
