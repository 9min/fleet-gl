import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MapView from '@/components/map/MapView';
import Layout from '@/components/layout/Layout';
import Sidebar from '@/components/layout/Sidebar';
import StatsPanel from '@/components/panel/StatsPanel';
import VehicleDetail from '@/components/panel/VehicleDetail';
import LoadingScreen from '@/components/layout/LoadingScreen';
import ToastContainer from '@/components/alert/ToastContainer';
import AnalyticsPanel from '@/components/analytics/AnalyticsPanel';
import { useVehicleData } from '@/hooks/useVehicleData';
import { useInterpolation } from '@/hooks/useInterpolation';
import { useDeckLayers } from '@/hooks/useDeckLayers';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { useGeofenceData } from '@/hooks/useGeofenceData';
import { useGeofenceAlerts } from '@/hooks/useGeofenceAlerts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useUIStore } from '@/stores/uiStore';
import { createGeofenceLayer } from '@/layers/geofenceLayer';
import { createHeatmapLayer, createDeliveryDensityLayer } from '@/layers/heatmapLayer';
import { setExportPositions } from '@/components/panel/ExportMenu';
import type { Layer } from '@deck.gl/core';

const App = () => {
  const { t } = useTranslation();
  const { routes, loading } = useVehicleData();
  const { positions, ready, seek } = useInterpolation(routes);
  const { geofences } = useGeofenceData();
  const { connected: wsConnected } = useWebSocket();
  const layerVisibility = useUIStore((s) => s.layerVisibility);

  useSystemTheme();
  useKeyboardShortcuts({ seek });
  useGeofenceAlerts(positions, geofences);
  useAnalytics(positions);

  // Keep export positions in sync
  setExportPositions(positions);

  // Geofence layers
  const geofenceLayers = useMemo((): Layer[] => {
    if (!layerVisibility.geofences || geofences.length === 0) return [];
    return [createGeofenceLayer(geofences)];
  }, [geofences, layerVisibility.geofences]);

  // Heatmap layers
  const heatmapLayers = useMemo((): Layer[] => {
    const result: Layer[] = [];
    if (layerVisibility.heatmap && positions.length > 0) {
      result.push(createHeatmapLayer(positions));
    }
    if (layerVisibility.density && positions.length > 0) {
      const completedPos: [number, number][] = positions
        .filter((v) => v.status === 'completed')
        .map((v) => [v.lng, v.lat]);
      if (completedPos.length > 0) {
        result.push(createDeliveryDensityLayer(completedPos));
      }
    }
    return result;
  }, [positions, layerVisibility.heatmap, layerVisibility.density]);

  const layers = useDeckLayers(positions, routes, geofenceLayers, heatmapLayers);

  if (loading || !ready) {
    return (
      <LoadingScreen
        message={loading ? t('loading.loadingRoutes') : t('loading.initEngine')}
      />
    );
  }

  return (
    <Layout
      onSeek={seek}
      wsConnected={wsConnected}
      toasts={<ToastContainer />}
      analyticsPanel={<AnalyticsPanel />}
      sidebar={
        <Sidebar>
          <StatsPanel />
          <VehicleDetail positions={positions} routes={routes} />
        </Sidebar>
      }
    >
      <MapView layers={layers} positions={positions} ready={ready} />
    </Layout>
  );
};

export default App;
