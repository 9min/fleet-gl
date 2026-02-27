import { useUIStore } from '../uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      selectedVehicleId: null,
      isPanelOpen: false,
      isAnalyticsPanelOpen: false,
      filters: {
        status: ['running', 'idle', 'completed', 'delayed'],
        searchQuery: '',
      },
      layerVisibility: {
        vehicles: true,
        trails: true,
        heatmap: false,
        density: false,
        geofences: true,
      },
    });
  });

  it('has null selectedVehicleId initially', () => {
    expect(useUIStore.getState().selectedVehicleId).toBeNull();
  });

  it('selectVehicle sets id and opens panel', () => {
    useUIStore.getState().selectVehicle('V-001');
    const state = useUIStore.getState();
    expect(state.selectedVehicleId).toBe('V-001');
    expect(state.isPanelOpen).toBe(true);
  });

  it('selectVehicle(null) clears selection and closes panel', () => {
    useUIStore.getState().selectVehicle('V-001');
    useUIStore.getState().selectVehicle(null);
    const state = useUIStore.getState();
    expect(state.selectedVehicleId).toBeNull();
    expect(state.isPanelOpen).toBe(false);
  });

  it('toggleLayer flips layer visibility', () => {
    expect(useUIStore.getState().layerVisibility.heatmap).toBe(false);
    useUIStore.getState().toggleLayer('heatmap');
    expect(useUIStore.getState().layerVisibility.heatmap).toBe(true);
  });

  it('setStatusFilter updates status filter', () => {
    useUIStore.getState().setStatusFilter(['running']);
    expect(useUIStore.getState().filters.status).toEqual(['running']);
  });

  it('setSearchQuery updates search query', () => {
    useUIStore.getState().setSearchQuery('V-042');
    expect(useUIStore.getState().filters.searchQuery).toBe('V-042');
  });

  it('toggleAnalyticsPanel toggles analytics panel', () => {
    expect(useUIStore.getState().isAnalyticsPanelOpen).toBe(false);
    useUIStore.getState().toggleAnalyticsPanel();
    expect(useUIStore.getState().isAnalyticsPanelOpen).toBe(true);
  });
});
