import { create } from 'zustand';
import type { VehicleStatus } from '@/types/vehicle';

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
}));
