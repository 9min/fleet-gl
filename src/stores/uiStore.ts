import { create } from 'zustand';
import type { VehicleStatus } from '@/types/vehicle';

type LayerVisibility = {
  vehicles: boolean;
  trails: boolean;
  heatmap: boolean;
  density: boolean;
  geofences: boolean;
};

type UIState = {
  selectedVehicleId: string | null;
  selectVehicle: (id: string | null) => void;

  filters: {
    status: VehicleStatus[];
    searchQuery: string;
  };
  setStatusFilter: (status: VehicleStatus[]) => void;
  setSearchQuery: (query: string) => void;

  isPanelOpen: boolean;
  togglePanel: () => void;

  isShortcutGuideOpen: boolean;
  toggleShortcutGuide: () => void;

  isPerformanceOverlayOpen: boolean;
  togglePerformanceOverlay: () => void;

  isAnalyticsPanelOpen: boolean;
  toggleAnalyticsPanel: () => void;

  layerVisibility: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;
};

export const useUIStore = create<UIState>()((set) => ({
  selectedVehicleId: null,
  selectVehicle: (id) => set({ selectedVehicleId: id, isPanelOpen: id !== null }),

  filters: {
    status: ['running', 'idle', 'completed', 'delayed'],
    searchQuery: '',
  },
  setStatusFilter: (status) =>
    set((s) => ({ filters: { ...s.filters, status } })),
  setSearchQuery: (searchQuery) =>
    set((s) => ({ filters: { ...s.filters, searchQuery } })),

  isPanelOpen: false,
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),

  isShortcutGuideOpen: false,
  toggleShortcutGuide: () => set((s) => ({ isShortcutGuideOpen: !s.isShortcutGuideOpen })),

  isPerformanceOverlayOpen: false,
  togglePerformanceOverlay: () =>
    set((s) => ({ isPerformanceOverlayOpen: !s.isPerformanceOverlayOpen })),

  isAnalyticsPanelOpen: false,
  toggleAnalyticsPanel: () =>
    set((s) => ({ isAnalyticsPanelOpen: !s.isAnalyticsPanelOpen })),

  layerVisibility: {
    vehicles: true,
    trails: true,
    heatmap: false,
    density: false,
    geofences: true,
  },
  toggleLayer: (layer) =>
    set((s) => ({
      layerVisibility: {
        ...s.layerVisibility,
        [layer]: !s.layerVisibility[layer],
      },
    })),
}));
