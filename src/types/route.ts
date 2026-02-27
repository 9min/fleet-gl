export type RoutePoint = {
  lng: number;
  lat: number;
  timestamp: number;
};

export type Waypoint = {
  name: string;
  lng: number;
  lat: number;
  arrivalTime: number;
  dwellTime: number;
};

export type VehicleRoute = {
  vehicleId: string;
  vehicleName: string;
  waypoints: Waypoint[];
  path: RoutePoint[];
  totalDistance: number;
  estimatedDuration: number;
};

export type RouteManifest = {
  totalVehicles: number;
  simulationDuration: number;
  files: string[];
};
