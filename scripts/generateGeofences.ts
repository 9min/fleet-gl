// Generate geofence zones around the simulation area (Seoul southern region)
// Run: npx tsx scripts/generateGeofences.ts

import fs from 'fs';
import path from 'path';

type GeofenceType = 'hub' | 'restricted' | 'delivery-area';

type GeofenceZone = {
  id: string;
  name: string;
  type: GeofenceType;
  polygon: [number, number][];
  center: [number, number];
};

// Create a roughly circular polygon around a center
const createCirclePolygon = (
  center: [number, number],
  radiusKm: number,
  points = 12,
): [number, number][] => {
  const polygon: [number, number][] = [];
  const lngDeg = radiusKm / (111.32 * Math.cos(center[1] * Math.PI / 180));
  const latDeg = radiusKm / 110.574;

  for (let i = 0; i < points; i++) {
    const angle = (2 * Math.PI * i) / points;
    const jitter = 0.85 + Math.random() * 0.3;
    polygon.push([
      center[0] + Math.cos(angle) * lngDeg * jitter,
      center[1] + Math.sin(angle) * latDeg * jitter,
    ]);
  }
  // Close the polygon
  polygon.push(polygon[0]!);
  return polygon;
};

// Create a rectangular polygon
const createRectPolygon = (
  center: [number, number],
  widthKm: number,
  heightKm: number,
): [number, number][] => {
  const halfW = widthKm / 2 / (111.32 * Math.cos(center[1] * Math.PI / 180));
  const halfH = heightKm / 2 / 110.574;

  return [
    [center[0] - halfW, center[1] - halfH],
    [center[0] + halfW, center[1] - halfH],
    [center[0] + halfW, center[1] + halfH],
    [center[0] - halfW, center[1] + halfH],
    [center[0] - halfW, center[1] - halfH], // close
  ];
};

const zones: GeofenceZone[] = [
  // Hubs (logistics centers)
  {
    id: 'hub-01', name: 'Central Hub', type: 'hub',
    center: [126.94, 37.36],
    polygon: createCirclePolygon([126.94, 37.36], 0.8),
  },
  {
    id: 'hub-02', name: 'North Hub', type: 'hub',
    center: [126.95, 37.40],
    polygon: createCirclePolygon([126.95, 37.40], 0.6),
  },
  {
    id: 'hub-03', name: 'East Hub', type: 'hub',
    center: [127.02, 37.35],
    polygon: createCirclePolygon([127.02, 37.35], 0.7),
  },
  {
    id: 'hub-04', name: 'South Hub', type: 'hub',
    center: [126.92, 37.32],
    polygon: createCirclePolygon([126.92, 37.32], 0.5),
  },
  {
    id: 'hub-05', name: 'West Hub', type: 'hub',
    center: [126.86, 37.37],
    polygon: createCirclePolygon([126.86, 37.37], 0.6),
  },

  // Restricted zones
  {
    id: 'res-01', name: 'Military Zone', type: 'restricted',
    center: [126.98, 37.42],
    polygon: createRectPolygon([126.98, 37.42], 1.2, 0.8),
  },
  {
    id: 'res-02', name: 'Airport Zone', type: 'restricted',
    center: [126.85, 37.33],
    polygon: createRectPolygon([126.85, 37.33], 1.5, 1.0),
  },
  {
    id: 'res-03', name: 'Industrial Zone', type: 'restricted',
    center: [127.05, 37.38],
    polygon: createRectPolygon([127.05, 37.38], 0.8, 0.6),
  },

  // Delivery areas
  ...generateDeliveryAreas(),
];

function generateDeliveryAreas(): GeofenceZone[] {
  const areas: GeofenceZone[] = [];
  const names = [
    'Gangnam District', 'Seocho Area', 'Songpa Zone', 'Bundang Area',
    'Gwacheon Zone', 'Anyang Area', 'Uiwang District', 'Gunpo Area',
    'Suwon North', 'Yongin West', 'Seongnam Central', 'Hanam Area',
    'Gwangmyeong Zone', 'Siheung Area', 'Ansan North', 'Bucheon South',
    'Incheon East', 'Gimpo South', 'Goyang West', 'Paju South',
    'Yangpyeong', 'Icheon West', 'Gwangju North', 'Yongin East',
    'Osan Area', 'Pyeongtaek North', 'Hwaseong West', 'Dongtan Zone',
    'Pangyo Zone', 'Jamsil Area', 'Yeouido Zone', 'Mapo Area',
  ];

  const basePositions: [number, number][] = [
    [126.98, 37.36], [126.96, 37.34], [127.00, 37.37], [127.04, 37.33],
    [126.93, 37.33], [126.91, 37.35], [126.89, 37.32], [126.87, 37.34],
    [126.99, 37.39], [127.02, 37.32], [127.00, 37.34], [127.06, 37.36],
    [126.88, 37.36], [126.86, 37.34], [126.84, 37.35], [126.85, 37.38],
    [126.82, 37.36], [126.83, 37.39], [126.87, 37.40], [126.90, 37.42],
    [127.08, 37.35], [127.06, 37.32], [127.04, 37.37], [127.06, 37.34],
    [127.00, 37.30], [126.98, 37.28], [126.94, 37.29], [127.02, 37.29],
    [127.02, 37.35], [127.01, 37.38], [126.91, 37.38], [126.92, 37.40],
  ];

  for (let i = 0; i < names.length; i++) {
    const center = basePositions[i]!;
    areas.push({
      id: `del-${String(i + 1).padStart(2, '0')}`,
      name: names[i]!,
      type: 'delivery-area',
      center,
      polygon: createCirclePolygon(center, 0.3 + Math.random() * 0.4, 8),
    });
  }

  return areas;
}

// Write output
const outDir = path.resolve('public/data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'geofences.json');
fs.writeFileSync(outPath, JSON.stringify(zones, null, 2));
console.log(`Generated ${zones.length} geofence zones → ${outPath}`);
