import type { VehiclePosition } from '@/types/vehicle';
import type { SimulationStats } from '@/types/simulation';

const downloadCsv = (filename: string, content: string) => {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportVehiclePositions = (positions: VehiclePosition[]) => {
  const header = 'Vehicle ID,Longitude,Latitude,Bearing,Status,Speed,Waypoint Index,Total Waypoints';
  const rows = positions.map((v) =>
    [v.vehicleId, v.lng.toFixed(6), v.lat.toFixed(6), v.bearing.toFixed(1), v.status, v.speed.toFixed(1), v.waypointIndex, v.totalWaypoints].join(','),
  );
  downloadCsv(`vehicles-${Date.now()}.csv`, [header, ...rows].join('\n'));
};

export const exportFleetStats = (stats: SimulationStats, currentTime: number) => {
  const header = 'Metric,Value';
  const rows = [
    `Total Vehicles,${stats.totalVehicles}`,
    `Running,${stats.running}`,
    `Idle,${stats.idle}`,
    `Completed,${stats.completed}`,
    `Delayed,${stats.delayed}`,
    `Progress,${stats.progressPercent}%`,
    `Total Distance,${stats.totalDistance}`,
    `Current Time,${currentTime}`,
    `Export Time,${new Date().toISOString()}`,
  ];
  downloadCsv(`fleet-summary-${Date.now()}.csv`, [header, ...rows].join('\n'));
};

export const exportGeofenceEvents = (events: { vehicleId?: string; message: string; timestamp: number; type: string }[]) => {
  const header = 'Timestamp,Type,Vehicle ID,Message';
  const rows = events.map((e) =>
    [new Date(e.timestamp).toISOString(), e.type, e.vehicleId ?? '', `"${e.message}"`].join(','),
  );
  downloadCsv(`geofence-events-${Date.now()}.csv`, [header, ...rows].join('\n'));
};
