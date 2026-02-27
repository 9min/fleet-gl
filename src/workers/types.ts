import type { SimulationStats } from '@/types/simulation';

// --- Path data sent during INIT ---
export type WorkerRouteData = {
  vehicleId: string;
  path: { lng: number; lat: number; timestamp: number }[];
  waypointTimestamps: number[];
  totalWaypoints: number;
};

// --- Main → Worker messages ---
export type WorkerInMessage =
  | { type: 'INIT'; routes: WorkerRouteData[] }
  | { type: 'TICK'; currentTime: number; speed: number }
  | { type: 'SEEK'; targetTime: number };

// --- Worker → Main messages ---
export type WorkerOutMessage =
  | { type: 'READY'; vehicleCount: number }
  | { type: 'POSITIONS'; buffer: ArrayBuffer; vehicleCount: number }
  | { type: 'STATS'; stats: SimulationStats; currentTime: number };
