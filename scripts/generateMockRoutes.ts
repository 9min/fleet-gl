import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

// --- Seed-based pseudo-random ---
let seed = 42;
const random = (): number => {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
};
const randRange = (min: number, max: number) => min + random() * (max - min);
const randInt = (min: number, max: number) => Math.floor(randRange(min, max + 1));

// --- Constants ---
const VEHICLE_COUNT = 100;
const SIM_DURATION = 57600; // 16 hours in seconds (06:00 ~ 22:00)
const OUTPUT_DIR = path.resolve(import.meta.dirname, '..', 'public', 'data', 'routes');

// Gunpo logistics terminal (origin)
const ORIGIN = { lng: 126.935, lat: 37.3615 };

// Delivery hubs around Seoul metropolitan area
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

// Generate intermediate points between two locations to simulate road-like paths
const generateIntermediatePoints = (
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  count: number,
): { lng: number; lat: number }[] => {
  const points: { lng: number; lat: number }[] = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    // Add some random offset to simulate curves in roads
    const jitterLng = randRange(-0.008, 0.008) * Math.sin(t * Math.PI);
    const jitterLat = randRange(-0.006, 0.006) * Math.sin(t * Math.PI);
    points.push({
      lng: fromLng + (toLng - fromLng) * t + jitterLng,
      lat: fromLat + (toLat - fromLat) * t + jitterLat,
    });
  }
  return points;
};

// Haversine distance in meters
const distance = (lng1: number, lat1: number, lng2: number, lat2: number): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

type RoutePoint = { lng: number; lat: number; timestamp: number };
type Waypoint = { name: string; lng: number; lat: number; arrivalTime: number; dwellTime: number };

const generateVehicleRoute = (vehicleIndex: number) => {
  const vehicleId = `V-${String(vehicleIndex + 1).padStart(3, '0')}`;
  const vehicleName = `배송차량 ${vehicleIndex + 1}`;

  // Each vehicle visits 20~35 random hubs
  const waypointCount = randInt(20, 35);
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

  // Stagger departure: vehicles depart within first 2 hours
  const departureOffset = randRange(0, 7200);

  // Build path with timestamps
  const path: RoutePoint[] = [];
  const waypoints: Waypoint[] = [];

  let currentTime = departureOffset;
  let currentLng = ORIGIN.lng + randRange(-0.005, 0.005);
  let currentLat = ORIGIN.lat + randRange(-0.003, 0.003);
  let totalDist = 0;

  // Start point
  path.push({ lng: currentLng, lat: currentLat, timestamp: currentTime });

  for (const hub of selectedHubs) {
    const destLng = hub.lng + randRange(-0.003, 0.003);
    const destLat = hub.lat + randRange(-0.002, 0.002);

    // Intermediate points between current and destination
    const intermediateCount = randInt(5, 15);
    const intermediates = generateIntermediatePoints(
      currentLng, currentLat, destLng, destLat, intermediateCount,
    );

    // Calculate segment distance for timing
    let segDist = 0;
    let prevLng = currentLng;
    let prevLat = currentLat;
    const allPoints = [...intermediates, { lng: destLng, lat: destLat }];

    for (const pt of allPoints) {
      segDist += distance(prevLng, prevLat, pt.lng, pt.lat);
      prevLng = pt.lng;
      prevLat = pt.lat;
    }

    totalDist += segDist;

    // Average speed 30-60 km/h → travel time
    const avgSpeed = randRange(30, 60) / 3.6; // m/s
    const travelTime = segDist / avgSpeed;

    // Add intermediate path points with timestamps
    for (let i = 0; i < allPoints.length; i++) {
      const t = (i + 1) / allPoints.length;
      const ptTime = currentTime + travelTime * t;
      path.push({
        lng: allPoints[i]!.lng,
        lat: allPoints[i]!.lat,
        timestamp: Math.round(ptTime),
      });
    }

    currentTime += travelTime;

    // Dwell time at waypoint (2-10 minutes)
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

    // Stop if we exceed simulation duration
    if (currentTime >= SIM_DURATION - 1800) break;
  }

  // Clamp all timestamps to SIM_DURATION
  for (const pt of path) {
    if (pt.timestamp > SIM_DURATION) pt.timestamp = SIM_DURATION;
  }

  return {
    vehicleId,
    vehicleName,
    waypoints,
    path,
    totalDistance: Math.round(totalDist),
    estimatedDuration: Math.round(currentTime - departureOffset),
  };
};

// --- Main ---
console.log(`Generating ${VEHICLE_COUNT} mock vehicle routes...`);

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const manifest = {
  totalVehicles: VEHICLE_COUNT,
  simulationDuration: SIM_DURATION,
  files: [] as string[],
};

for (let i = 0; i < VEHICLE_COUNT; i++) {
  const route = generateVehicleRoute(i);
  const filename = `vehicle-${String(i + 1).padStart(3, '0')}.json`;
  writeFileSync(
    path.join(OUTPUT_DIR, filename),
    JSON.stringify(route),
  );
  manifest.files.push(filename);

  if ((i + 1) % 10 === 0) {
    console.log(`  ${i + 1}/${VEHICLE_COUNT} generated`);
  }
}

writeFileSync(
  path.join(OUTPUT_DIR, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
);

console.log(`Done! ${VEHICLE_COUNT} routes written to ${OUTPUT_DIR}`);
console.log(`Total files: ${manifest.files.length + 1} (including manifest.json)`);
