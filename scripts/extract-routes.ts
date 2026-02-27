/**
 * Route extraction script using Kakao Mobility Directions API.
 *
 * Prerequisites:
 *   - Set KAKAO_REST_API_KEY in .env.local
 *
 * Usage:
 *   npx tsx scripts/extract-routes.ts
 *   npx tsx scripts/extract-routes.ts --force   # re-extract all
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import path from 'path';

// ── Load env ──────────────────────────────────────────────────────────────────
const envPath = path.resolve(import.meta.dirname, '..', '.env.local');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.+?)\s*$/);
    if (match) process.env[match[1]!] = match[2]!;
  }
}

const API_KEY = process.env.KAKAO_REST_API_KEY;
if (!API_KEY) {
  console.error('❌ KAKAO_REST_API_KEY not found in .env.local');
  process.exit(1);
}

// ── Constants ─────────────────────────────────────────────────────────────────
const VEHICLE_COUNT = 100;
const SIM_DURATION = 57600; // 16 hours (06:00 ~ 22:00)
const OUTPUT_DIR = path.resolve(import.meta.dirname, '..', 'public', 'data', 'routes');
const FORCE = process.argv.includes('--force');
const API_BASE = 'https://apis-navi.kakaomobility.com/v1/directions';
const RATE_LIMIT_MS = 120; // ~8 req/s to stay under 10/s limit

// ── Seed-based RNG ────────────────────────────────────────────────────────────
let seed = 42;
const random = (): number => {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
};
const randRange = (min: number, max: number) => min + random() * (max - min);
const randInt = (min: number, max: number) => Math.floor(randRange(min, max + 1));

// ── Hub definitions ───────────────────────────────────────────────────────────
const ORIGIN = { lng: 126.935, lat: 37.3615 };

const HUBS: { name: string; lng: number; lat: number }[] = [
  { name: '강남 허브', lng: 127.0276, lat: 37.4979 },
  { name: '송파 허브', lng: 127.1059, lat: 37.5145 },
  { name: '분당 센터', lng: 127.0286, lat: 37.3595 },
  { name: '수원 물류', lng: 127.0286, lat: 37.2636 },
  { name: '인천 센터', lng: 126.7052, lat: 37.4563 },
  { name: '부천 허브', lng: 126.7660, lat: 37.5035 },
  { name: '안양 센터', lng: 126.9518, lat: 37.3943 },
  { name: '성남 허브', lng: 127.1378, lat: 37.4201 },
  { name: '용인 물류', lng: 127.1775, lat: 37.2411 },
  { name: '화성 센터', lng: 126.8312, lat: 37.1995 },
  { name: '평택 허브', lng: 126.9920, lat: 36.9921 },
  { name: '의왕 센터', lng: 126.9683, lat: 37.3449 },
  { name: '광명 허브', lng: 126.8545, lat: 37.4786 },
  { name: '시흥 물류', lng: 126.8031, lat: 37.3800 },
  { name: '안산 센터', lng: 126.8307, lat: 37.3219 },
  { name: '구리 허브', lng: 127.1296, lat: 37.5943 },
  { name: '남양주 센터', lng: 127.2163, lat: 37.6361 },
  { name: '하남 물류', lng: 127.2069, lat: 37.5393 },
  { name: '김포 허브', lng: 126.7156, lat: 37.6153 },
  { name: '파주 센터', lng: 126.7800, lat: 37.7600 },
  { name: '고양 허브', lng: 126.8320, lat: 37.6564 },
  { name: '의정부 센터', lng: 127.0348, lat: 37.7381 },
  { name: '동대문 허브', lng: 127.0396, lat: 37.5712 },
  { name: '마포 센터', lng: 126.9018, lat: 37.5547 },
  { name: '영등포 허브', lng: 126.8964, lat: 37.5159 },
  { name: '관악 물류', lng: 126.9514, lat: 37.4783 },
  { name: '강서 센터', lng: 126.8496, lat: 37.5510 },
  { name: '노원 허브', lng: 127.0569, lat: 37.6543 },
  { name: '은평 센터', lng: 126.9293, lat: 37.6027 },
  { name: '서초 허브', lng: 127.0178, lat: 37.4837 },
  { name: '강동 센터', lng: 127.1236, lat: 37.5301 },
  { name: '중랑 허브', lng: 127.0926, lat: 37.6066 },
  { name: '도봉 센터', lng: 127.0470, lat: 37.6689 },
  { name: '양천 허브', lng: 126.8665, lat: 37.5170 },
  { name: '종로 센터', lng: 126.9780, lat: 37.5730 },
  { name: '이천 물류', lng: 127.4350, lat: 37.2720 },
  { name: '광주 센터', lng: 127.2551, lat: 37.4095 },
  { name: '오산 허브', lng: 127.0700, lat: 37.1500 },
  { name: '군포 남부', lng: 126.9350, lat: 37.3400 },
  { name: '과천 센터', lng: 126.9875, lat: 37.4292 },
];

// ── Kakao API ─────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type KakaoRoad = {
  vertexes: number[]; // [lng, lat, lng, lat, ...]
  distance: number;
  duration: number;
};

type KakaoSection = {
  distance: number;
  duration: number;
  roads: KakaoRoad[];
};

type KakaoRoute = {
  result_code: number;
  result_msg: string;
  sections: KakaoSection[];
  summary: { distance: number; duration: number };
};

type KakaoResponse = {
  trans_id: string;
  routes: KakaoRoute[];
};

const fetchDirections = async (
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
): Promise<{ coords: [number, number][]; distance: number; duration: number } | null> => {
  const url = `${API_BASE}?origin=${fromLng},${fromLat}&destination=${toLng},${toLat}&priority=RECOMMEND`;

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${API_KEY}` },
  });

  if (!res.ok) {
    console.warn(`  ⚠ API ${res.status}: ${fromLng.toFixed(4)},${fromLat.toFixed(4)} → ${toLng.toFixed(4)},${toLat.toFixed(4)}`);
    return null;
  }

  const data = (await res.json()) as KakaoResponse;
  const route = data.routes[0];

  if (!route || route.result_code !== 0) {
    console.warn(`  ⚠ No route: code=${route?.result_code} msg=${route?.result_msg}`);
    return null;
  }

  // Extract all vertex coordinates from road segments
  const coords: [number, number][] = [];
  let totalDist = 0;
  let totalDur = 0;

  for (const section of route.sections) {
    totalDist += section.distance;
    totalDur += section.duration;
    for (const road of section.roads) {
      for (let i = 0; i < road.vertexes.length; i += 2) {
        const lng = road.vertexes[i]!;
        const lat = road.vertexes[i + 1]!;
        // Skip duplicate consecutive points
        if (coords.length > 0) {
          const last = coords[coords.length - 1]!;
          if (Math.abs(last[0] - lng) < 1e-7 && Math.abs(last[1] - lat) < 1e-7) continue;
        }
        coords.push([lng, lat]);
      }
    }
  }

  return { coords, distance: totalDist, duration: totalDur };
};

// ── Haversine ─────────────────────────────────────────────────────────────────
const haversine = (lng1: number, lat1: number, lng2: number, lat2: number): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Downsample path to reduce file size while keeping shape
const downsamplePath = (coords: [number, number][], maxPoints: number): [number, number][] => {
  if (coords.length <= maxPoints) return coords;
  const step = (coords.length - 1) / (maxPoints - 1);
  const result: [number, number][] = [];
  for (let i = 0; i < maxPoints; i++) {
    result.push(coords[Math.round(i * step)]!);
  }
  return result;
};

// ── Straight-line fallback (when API fails) ───────────────────────────────────
const straightLineFallback = (
  fromLng: number, fromLat: number,
  toLng: number, toLat: number,
  count: number,
): [number, number][] => {
  const points: [number, number][] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    points.push([
      fromLng + (toLng - fromLng) * t,
      fromLat + (toLat - fromLat) * t,
    ]);
  }
  return points;
};

// ── Vehicle route generation ──────────────────────────────────────────────────
type RoutePoint = { lng: number; lat: number; timestamp: number };
type Waypoint = { name: string; lng: number; lat: number; arrivalTime: number; dwellTime: number };

const generateVehicleRoute = async (vehicleIndex: number) => {
  const vehicleId = `V-${String(vehicleIndex + 1).padStart(3, '0')}`;
  const vehicleName = `배송차량 ${vehicleIndex + 1}`;

  // Each vehicle visits 15~25 hubs
  const waypointCount = randInt(15, 25);
  const selectedHubs: typeof HUBS = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < waypointCount; i++) {
    let idx: number;
    do {
      idx = randInt(0, HUBS.length - 1);
    } while (usedIndices.has(idx) && usedIndices.size < HUBS.length);
    usedIndices.add(idx);
    selectedHubs.push(HUBS[idx]!);
  }

  // Stagger departure within first 2 hours
  const departureOffset = randRange(0, 7200);

  const fullPath: RoutePoint[] = [];
  const waypoints: Waypoint[] = [];
  let currentTime = departureOffset;
  let currentLng = ORIGIN.lng;
  let currentLat = ORIGIN.lat;
  let totalDist = 0;
  let apiCalls = 0;
  let apiFails = 0;

  for (const hub of selectedHubs) {
    const destLng = hub.lng;
    const destLat = hub.lat;

    // Call Kakao Directions API
    await sleep(RATE_LIMIT_MS);
    const result = await fetchDirections(currentLng, currentLat, destLng, destLat);
    apiCalls++;

    let segCoords: [number, number][];
    let segDist: number;
    let segDur: number;

    if (result && result.coords.length >= 2) {
      // Downsample to max 20 points per segment to keep file size reasonable
      segCoords = downsamplePath(result.coords, 20);
      segDist = result.distance;
      segDur = result.duration; // Kakao returns seconds
    } else {
      // Fallback to straight line
      apiFails++;
      segDist = haversine(currentLng, currentLat, destLng, destLat);
      segDur = segDist / (40 / 3.6); // assume 40 km/h
      segCoords = straightLineFallback(currentLng, currentLat, destLng, destLat, 10);
    }

    totalDist += segDist;

    // Add path points with interpolated timestamps
    for (let i = 0; i < segCoords.length; i++) {
      const t = segCoords.length > 1 ? i / (segCoords.length - 1) : 1;
      const ptTime = currentTime + segDur * t;
      fullPath.push({
        lng: segCoords[i]![0],
        lat: segCoords[i]![1],
        timestamp: Math.round(ptTime),
      });
    }

    currentTime += segDur;

    // Dwell time (2-10 min)
    const dwellTime = randRange(120, 600);
    waypoints.push({
      name: hub.name,
      lng: destLng,
      lat: destLat,
      arrivalTime: Math.round(currentTime),
      dwellTime: Math.round(dwellTime),
    });

    currentTime += dwellTime;
    currentLng = destLng;
    currentLat = destLat;

    if (currentTime >= SIM_DURATION - 1800) break;
  }

  // Clamp timestamps
  for (const pt of fullPath) {
    if (pt.timestamp > SIM_DURATION) pt.timestamp = SIM_DURATION;
  }

  console.log(`  ✓ ${vehicleId}: ${waypoints.length} waypoints, ${fullPath.length} path points, ${apiCalls} API calls (${apiFails} fallbacks)`);

  return {
    vehicleId,
    vehicleName,
    waypoints,
    path: fullPath,
    totalDistance: Math.round(totalDist),
    estimatedDuration: Math.round(currentTime - departureOffset),
  };
};

// ── Main ──────────────────────────────────────────────────────────────────────
const main = async () => {
  console.log(`\n🚛 Generating ${VEHICLE_COUNT} vehicle routes using Kakao Mobility API...\n`);

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const manifest = {
    totalVehicles: VEHICLE_COUNT,
    simulationDuration: SIM_DURATION,
    files: [] as string[],
  };

  let totalApiCalls = 0;
  const startTime = Date.now();

  for (let i = 0; i < VEHICLE_COUNT; i++) {
    const filename = `vehicle-${String(i + 1).padStart(3, '0')}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);

    if (!FORCE && existsSync(filepath)) {
      console.log(`  ⏭ ${filename} exists (use --force to overwrite)`);
      manifest.files.push(filename);
      // Advance RNG to keep determinism consistent
      randInt(15, 25);
      for (let j = 0; j < 30; j++) random();
      continue;
    }

    const route = await generateVehicleRoute(i);
    writeFileSync(filepath, JSON.stringify(route));
    manifest.files.push(filename);

    const waypointApiCalls = route.waypoints.length;
    totalApiCalls += waypointApiCalls;

    if ((i + 1) % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n  📊 Progress: ${i + 1}/${VEHICLE_COUNT} (${elapsed}s elapsed, ${totalApiCalls} API calls)\n`);
    }
  }

  writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Done! ${VEHICLE_COUNT} routes generated in ${totalTime}s`);
  console.log(`   Total API calls: ~${totalApiCalls}`);
  console.log(`   Output: ${OUTPUT_DIR}\n`);
};

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
