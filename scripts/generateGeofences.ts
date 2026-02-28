// Generate geofence zones across the full vehicle route area (수도권 전역)
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
    // deterministic jitter: same shape on every run, still slightly irregular
    const jitter =
      1 + 0.15 * Math.sin((i + 1) * 12.9898 + center[0] * 78.233 + center[1] * 37.719);
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

// --- Zone definitions covering full vehicle route area (수도권 전역) ---

const hubs: GeofenceZone[] = [
  { id: 'hub-01', name: 'Gunpo Logistics Terminal', type: 'hub', center: [126.935, 37.3615], polygon: createCirclePolygon([126.935, 37.3615], 1.0, 12) },
  { id: 'hub-02', name: 'Incheon Distribution Center', type: 'hub', center: [126.7052, 37.4563], polygon: createCirclePolygon([126.7052, 37.4563], 0.8, 12) },
  { id: 'hub-03', name: 'Gangnam Logistics Hub', type: 'hub', center: [127.0276, 37.4979], polygon: createCirclePolygon([127.0276, 37.4979], 0.8, 12) },
  { id: 'hub-04', name: 'Suwon Distribution Center', type: 'hub', center: [127.0286, 37.2636], polygon: createCirclePolygon([127.0286, 37.2636], 0.8, 12) },
  { id: 'hub-05', name: 'Pyeongtaek Logistics Hub', type: 'hub', center: [126.992, 36.9921], polygon: createCirclePolygon([126.992, 36.9921], 1.0, 12) },
  { id: 'hub-06', name: 'Goyang Distribution Center', type: 'hub', center: [126.832, 37.6564], polygon: createCirclePolygon([126.832, 37.6564], 0.8, 12) },
  { id: 'hub-07', name: 'Seongnam Logistics Hub', type: 'hub', center: [127.1378, 37.4201], polygon: createCirclePolygon([127.1378, 37.4201], 0.8, 12) },
];

const restricted: GeofenceZone[] = [
  { id: 'res-01', name: 'Gimpo Airport Zone', type: 'restricted', center: [126.7942, 37.5585], polygon: createRectPolygon([126.7942, 37.5585], 2.0, 1.5) },
  { id: 'res-02', name: 'Osan Air Base Zone', type: 'restricted', center: [127.03, 37.09], polygon: createRectPolygon([127.03, 37.09], 2.0, 1.5) },
  { id: 'res-03', name: 'Yongsan Military Zone', type: 'restricted', center: [126.97, 37.53], polygon: createRectPolygon([126.97, 37.53], 1.5, 1.0) },
  { id: 'res-04', name: 'Gwacheon Government Complex', type: 'restricted', center: [126.9875, 37.4292], polygon: createCirclePolygon([126.9875, 37.4292], 1.2, 12) },
  { id: 'res-05', name: 'Paju DMZ Buffer Zone', type: 'restricted', center: [126.78, 37.74], polygon: createRectPolygon([126.78, 37.74], 2.5, 1.5) },
];

type DeliveryDef = { id: string; name: string; center: [number, number]; radiusKm: number };

const deliveryDefs: DeliveryDef[] = [
  { id: 'del-01', name: 'Songpa Delivery Zone', center: [127.1059, 37.5145], radiusKm: 0.8 },
  { id: 'del-02', name: 'Bundang Delivery Zone', center: [127.0286, 37.3595], radiusKm: 1.0 },
  { id: 'del-03', name: 'Bucheon Delivery Zone', center: [126.766, 37.5035], radiusKm: 0.8 },
  { id: 'del-04', name: 'Anyang Delivery Zone', center: [126.9518, 37.3943], radiusKm: 0.7 },
  { id: 'del-05', name: 'Yongin Delivery Zone', center: [127.1775, 37.2411], radiusKm: 1.0 },
  { id: 'del-06', name: 'Hwaseong Delivery Zone', center: [126.8312, 37.1995], radiusKm: 1.2 },
  { id: 'del-07', name: 'Uiwang Delivery Zone', center: [126.9683, 37.3449], radiusKm: 0.6 },
  { id: 'del-08', name: 'Gwangmyeong Delivery Zone', center: [126.8545, 37.4786], radiusKm: 0.7 },
  { id: 'del-09', name: 'Siheung Delivery Zone', center: [126.8031, 37.38], radiusKm: 0.8 },
  { id: 'del-10', name: 'Ansan Delivery Zone', center: [126.8307, 37.3219], radiusKm: 0.8 },
  { id: 'del-11', name: 'Guri Delivery Zone', center: [127.1296, 37.5943], radiusKm: 0.7 },
  { id: 'del-12', name: 'Namyangju Delivery Zone', center: [127.2163, 37.6361], radiusKm: 1.0 },
  { id: 'del-13', name: 'Hanam Delivery Zone', center: [127.2069, 37.5393], radiusKm: 0.8 },
  { id: 'del-14', name: 'Gimpo Delivery Zone', center: [126.7156, 37.6153], radiusKm: 0.8 },
  { id: 'del-15', name: 'Paju Delivery Zone', center: [126.78, 37.76], radiusKm: 1.0 },
  { id: 'del-16', name: 'Uijeongbu Delivery Zone', center: [127.0348, 37.7381], radiusKm: 1.0 },
  { id: 'del-17', name: 'Dongdaemun Delivery Zone', center: [127.0396, 37.5712], radiusKm: 0.6 },
  { id: 'del-18', name: 'Mapo Delivery Zone', center: [126.9018, 37.5547], radiusKm: 0.7 },
  { id: 'del-19', name: 'Yeongdeungpo Delivery Zone', center: [126.8964, 37.5159], radiusKm: 0.7 },
  { id: 'del-20', name: 'Gwanak Delivery Zone', center: [126.9514, 37.4783], radiusKm: 0.7 },
  { id: 'del-21', name: 'Gangseo Delivery Zone', center: [126.8496, 37.551], radiusKm: 0.8 },
  { id: 'del-22', name: 'Nowon Delivery Zone', center: [127.0569, 37.6543], radiusKm: 0.8 },
  { id: 'del-23', name: 'Eunpyeong Delivery Zone', center: [126.9293, 37.6027], radiusKm: 0.7 },
  { id: 'del-24', name: 'Seocho Delivery Zone', center: [127.0178, 37.4837], radiusKm: 0.7 },
  { id: 'del-25', name: 'Gangdong Delivery Zone', center: [127.1236, 37.5301], radiusKm: 0.8 },
  { id: 'del-26', name: 'Jongno Delivery Zone', center: [126.978, 37.573], radiusKm: 0.5 },
  { id: 'del-27', name: 'Icheon Delivery Zone', center: [127.435, 37.272], radiusKm: 1.5 },
  { id: 'del-28', name: 'Osan Delivery Zone', center: [127.07, 37.15], radiusKm: 1.0 },
];

const deliveryAreas: GeofenceZone[] = deliveryDefs.map((d) => ({
  id: d.id,
  name: d.name,
  type: 'delivery-area' as GeofenceType,
  center: d.center,
  polygon: createCirclePolygon(d.center, d.radiusKm, 8),
}));

const zones: GeofenceZone[] = [...hubs, ...restricted, ...deliveryAreas];

// Write output
const outDir = path.resolve('public/data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'geofences.json');
fs.writeFileSync(outPath, JSON.stringify(zones, null, 2));
console.log(`Generated ${zones.length} geofence zones → ${outPath}`);
