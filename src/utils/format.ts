export const formatTime = (seconds: number): string => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60) + 6;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const formatSpeed = (metersPerSecond: number): string => {
  const kmh = metersPerSecond * 3.6;
  return `${Math.round(kmh)} km/h`;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const padVehicleId = (n: number): string =>
  `V-${String(n).padStart(3, '0')}`;
