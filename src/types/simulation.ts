export type SimulationStats = {
  totalVehicles: number;
  running: number;
  idle: number;
  completed: number;
  delayed: number;
  progressPercent: number;
  totalDistance: number;
};

export type PlaybackSpeed = 60 | 120 | 300 | 600;
