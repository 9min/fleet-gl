export const MAP_CONFIG = {
  center: [126.94, 37.36] as [number, number],
  zoom: 12.5,
  pitch: 50,
  bearing: -15,
  minZoom: 6,
  maxZoom: 18,
} as const;

export const ENTRY_ANIMATION = {
  startZoom: 10,
  startPitch: 0,
  startBearing: 0,
  duration: 3000,
  autoPlayDelay: 500,
} as const;
