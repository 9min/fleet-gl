export type WaypointStatus = 'completed' | 'current' | 'upcoming';

export type WaypointProgress = {
  name: string;
  plannedArrival: number;
  actualArrival: number | null;
  status: WaypointStatus;
  deviationSeconds: number;
  lng: number;
  lat: number;
};
