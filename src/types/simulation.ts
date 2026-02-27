export type SimulationStats = {
  totalVehicles: number;
  running: number;
  idle: number;
  completed: number;
  delayed: number;
  progressPercent: number;
  totalDistance: number;
};

export type PlaybackSpeed = 1 | 2 | 4 | 8;
