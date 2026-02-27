// Web Worker: Vehicle position interpolation engine
// Runs at 60fps, outputs Float64Array via Transferable

const ctx = self as unknown as DedicatedWorkerGlobalScope;

type PathPoint = { lng: number; lat: number; timestamp: number };

type VehicleState = {
  vehicleId: string;
  path: PathPoint[];
  waypointTimestamps: number[];
  totalWaypoints: number;
  // Cached indices for fast binary search
  lastSegmentIndex: number;
};

// --- Worker-scoped global state ---
let vehicles: VehicleState[] = [];
let vehicleCount = 0;
let frameCount = 0;

// Status enum encoding: 0=running, 1=idle, 2=completed, 3=delayed
const STATUS_RUNNING = 0;
const STATUS_IDLE = 1;
const STATUS_COMPLETED = 2;

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

const calcBearing = (
  lng1: number, lat1: number, lng2: number, lat2: number,
): number => {
  const dLng = (lng2 - lng1) * DEG_TO_RAD;
  const lat1R = lat1 * DEG_TO_RAD;
  const lat2R = lat2 * DEG_TO_RAD;
  const y = Math.sin(dLng) * Math.cos(lat2R);
  const x = Math.cos(lat1R) * Math.sin(lat2R) -
    Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLng);
  return (Math.atan2(y, x) * RAD_TO_DEG + 360) % 360;
};

// Find segment index for given time using cached hint
const findSegment = (path: PathPoint[], time: number, hint: number): number => {
  const len = path.length;
  if (len < 2) return 0;

  // Try hint first (temporal coherence)
  if (hint >= 0 && hint < len - 1) {
    const p0 = path[hint]!;
    const p1 = path[hint + 1]!;
    if (time >= p0.timestamp && time < p1.timestamp) return hint;
    // Check next segment
    if (hint + 2 < len) {
      const p2 = path[hint + 2]!;
      if (time >= p1.timestamp && time < p2.timestamp) return hint + 1;
    }
  }

  // Binary search fallback
  let lo = 0;
  let hi = len - 2;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (path[mid]!.timestamp <= time) {
      if (mid === len - 2 || path[mid + 1]!.timestamp > time) return mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return Math.max(0, Math.min(lo, len - 2));
};

// Determine current waypoint index based on time
const getWaypointIndex = (waypointTimestamps: number[], time: number): number => {
  let idx = 0;
  for (let i = 0; i < waypointTimestamps.length; i++) {
    if (time >= waypointTimestamps[i]!) idx = i + 1;
  }
  return idx;
};

// Check if vehicle is dwelling at a waypoint
const isDwelling = (waypointTimestamps: number[], time: number): boolean => {
  for (let i = 0; i < waypointTimestamps.length; i++) {
    const arrival = waypointTimestamps[i]!;
    // Assume ~5min dwell per waypoint
    if (time >= arrival && time < arrival + 300) return true;
  }
  return false;
};

const interpolateAll = (currentTime: number): ArrayBuffer => {
  // 5 values per vehicle: lng, lat, bearing, status, waypointProgress
  const buffer = new Float64Array(vehicleCount * 5);

  let running = 0;
  let idle = 0;
  let completed = 0;

  for (let i = 0; i < vehicleCount; i++) {
    const v = vehicles[i]!;
    const path = v.path;
    const offset = i * 5;

    if (path.length === 0) {
      buffer[offset] = 0;
      buffer[offset + 1] = 0;
      buffer[offset + 2] = 0;
      buffer[offset + 3] = STATUS_COMPLETED;
      buffer[offset + 4] = 0;
      completed++;
      continue;
    }

    const firstTime = path[0]!.timestamp;
    const lastTime = path[path.length - 1]!.timestamp;

    // Before departure
    if (currentTime < firstTime) {
      buffer[offset] = path[0]!.lng;
      buffer[offset + 1] = path[0]!.lat;
      buffer[offset + 2] = 0;
      buffer[offset + 3] = STATUS_IDLE;
      buffer[offset + 4] = 0;
      idle++;
      continue;
    }

    // After completion
    if (currentTime >= lastTime) {
      const last = path[path.length - 1]!;
      buffer[offset] = last.lng;
      buffer[offset + 1] = last.lat;
      buffer[offset + 2] = 0;
      buffer[offset + 3] = STATUS_COMPLETED;
      buffer[offset + 4] = v.totalWaypoints;
      completed++;
      continue;
    }

    // Interpolate position
    const segIdx = findSegment(path, currentTime, v.lastSegmentIndex);
    v.lastSegmentIndex = segIdx;

    const p0 = path[segIdx]!;
    const p1 = path[segIdx + 1]!;
    const dt = p1.timestamp - p0.timestamp;
    const t = dt > 0 ? (currentTime - p0.timestamp) / dt : 0;

    const lng = p0.lng + (p1.lng - p0.lng) * t;
    const lat = p0.lat + (p1.lat - p0.lat) * t;
    const brg = calcBearing(p0.lng, p0.lat, p1.lng, p1.lat);

    const wpIdx = getWaypointIndex(v.waypointTimestamps, currentTime);
    const dwelling = isDwelling(v.waypointTimestamps, currentTime);

    buffer[offset] = lng;
    buffer[offset + 1] = lat;
    buffer[offset + 2] = brg;
    buffer[offset + 3] = dwelling ? STATUS_IDLE : STATUS_RUNNING;
    buffer[offset + 4] = wpIdx;

    if (dwelling) idle++;
    else running++;
  }

  // Emit stats every ~60 frames (~1 second)
  frameCount++;
  if (frameCount % 60 === 0) {
    const totalWaypoints = vehicles.reduce((sum, v) => sum + v.totalWaypoints, 0);
    const completedWaypoints = vehicles.reduce((sum, _v, idx) => {
      const offset = idx * 5;
      return sum + (buffer[offset + 4] ?? 0);
    }, 0);

    const statsMsg = {
      type: 'STATS' as const,
      stats: {
        totalVehicles: vehicleCount,
        running,
        idle,
        completed,
        delayed: 0,
        progressPercent: totalWaypoints > 0
          ? Math.round((completedWaypoints / totalWaypoints) * 100)
          : 0,
        totalDistance: 0,
      },
      currentTime,
    };
    ctx.postMessage(statsMsg);
  }

  return buffer.buffer;
};

// --- Message handler ---
ctx.onmessage = (e: MessageEvent) => {
  const msg = e.data;

  switch (msg.type) {
    case 'INIT': {
      vehicles = msg.routes.map((r: {
        vehicleId: string;
        path: PathPoint[];
        waypointTimestamps: number[];
        totalWaypoints: number;
      }) => ({
        vehicleId: r.vehicleId,
        path: r.path,
        waypointTimestamps: r.waypointTimestamps,
        totalWaypoints: r.totalWaypoints,
        lastSegmentIndex: 0,
      }));
      vehicleCount = vehicles.length;
      frameCount = 0;
      ctx.postMessage({ type: 'READY', vehicleCount });
      break;
    }

    case 'TICK': {
      const buffer = interpolateAll(msg.currentTime);
      ctx.postMessage(
        { type: 'POSITIONS', buffer, vehicleCount },
        [buffer],
      );
      break;
    }

    case 'SEEK': {
      // Reset segment hints for seek
      for (const v of vehicles) {
        v.lastSegmentIndex = 0;
      }
      const buffer = interpolateAll(msg.targetTime);
      ctx.postMessage(
        { type: 'POSITIONS', buffer, vehicleCount },
        [buffer],
      );
      break;
    }
  }
};
