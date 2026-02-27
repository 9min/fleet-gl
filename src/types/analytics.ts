export type TimeSeriesPoint = {
  time: number;
  running: number;
  idle: number;
  completed: number;
  delayed: number;
  progressPercent: number;
};

export type VehicleMetric = {
  vehicleId: string;
  completedWaypoints: number;
  totalWaypoints: number;
  completionRate: number;
};
