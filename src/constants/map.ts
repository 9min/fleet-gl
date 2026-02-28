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

/**
 * Auto-fit padding — accounts for desktop sidebar or mobile UI overlays
 * Desktop: Sidebar on right (320px width)
 * Mobile: Bottom sheet + timeline at bottom, KPI bar at top
 */
export const FIT_PADDING_DESKTOP = {
  top: 100,
  bottom: 80,
  left: 80,
  right: 340, // Accounts for sidebar (320px + spacing)
} as const;

export const FIT_PADDING_MOBILE = {
  top: 140,    // MobileKPIBar (~60px) + margin
  bottom: 160, // MobileTimeline (~80px) + BottomSheet peek (80px)
  left: 20,    // Symmetric - no sidebar obstruction
  right: 20,
} as const;

/**
 * Auto-fit resume delay after user interaction stops (ms)
 */
export const AUTO_FIT_RESUME_DELAY = 5000;
