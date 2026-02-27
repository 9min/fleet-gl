import { create } from 'zustand';
import type { SimulationStats, PlaybackSpeed } from '@/types/simulation';

type SimulationState = {
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  currentTime: number;
  totalDuration: number;

  stats: SimulationStats;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  seek: (time: number) => void;
  updateStats: (stats: SimulationStats) => void;
  updateCurrentTime: (time: number) => void;
};

export const useSimulationStore = create<SimulationState>()((set) => ({
  isPlaying: false,
  playbackSpeed: 1,
  currentTime: 0,
  totalDuration: 57600,

  stats: {
    totalVehicles: 0,
    running: 0,
    idle: 0,
    completed: 0,
    delayed: 0,
    progressPercent: 0,
    totalDistance: 0,
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setSpeed: (speed) => set({ playbackSpeed: speed }),
  seek: (time) => set({ currentTime: time }),
  updateStats: (stats) => set({ stats }),
  updateCurrentTime: (time) => set({ currentTime: time }),
}));
