export type VehicleStatus = 'running' | 'idle' | 'completed' | 'delayed';

export type VehiclePosition = {
  vehicleId: string;
  lng: number;
  lat: number;
  bearing: number;
  status: VehicleStatus;
  speed: number;
  waypointIndex: number;
  totalWaypoints: number;
};
