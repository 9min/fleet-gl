export const MAP_CONFIG = {
  center: [126.935, 37.3615] as [number, number], // Gunpo origin
  zoom: 13.5,
  pitch: 50,
  bearing: -15,
  minZoom: 6,
  maxZoom: 18,
} as const;

export const ENTRY_ANIMATION = {
  /** Start wide: full metropolitan area visible */
  startCenter: [127.0, 37.5] as [number, number], // Seoul center
  startZoom: 9,
  startPitch: 0,
  startBearing: 0,
  /** Fly-to target (MAP_CONFIG values) */
  duration: 4000,
  autoPlayDelay: 500,
} as const;
