import { useEffect } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { useUIStore } from '@/stores/uiStore';
import type { PlaybackSpeed } from '@/types/simulation';

type UseKeyboardShortcutsOptions = {
  seek: (time: number) => void;
};

const SPEED_MAP: Record<string, PlaybackSpeed> = {
  '1': 60,
  '2': 120,
  '3': 300,
  '4': 600,
};

const SEEK_STEP = 300; // 5 minutes in simulation time

export const useKeyboardShortcuts = ({ seek }: UseKeyboardShortcutsOptions) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const sim = useSimulationStore.getState();
      const ui = useUIStore.getState();

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          sim.togglePlay();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, sim.currentTime - SEEK_STEP));
          break;

        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(sim.totalDuration, sim.currentTime + SEEK_STEP));
          break;

        case 'Escape':
          ui.selectVehicle(null);
          if (ui.isShortcutGuideOpen) ui.toggleShortcutGuide();
          break;

        case 'KeyP':
          if (!e.ctrlKey && !e.metaKey) {
            ui.togglePerformanceOverlay();
          }
          break;

        default:
          // Speed keys 1-4
          if (e.key in SPEED_MAP) {
            sim.setSpeed(SPEED_MAP[e.key]!);
          }
          // ? key for shortcut guide
          if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) {
            ui.toggleShortcutGuide();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [seek]);
};
