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
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { useGeofenceData } from '@/hooks/useGeofenceData';
import { useGeofenceAlerts } from '@/hooks/useGeofenceAlerts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useWebSocket } from '@/hooks/useWebSocket';

const App = () => {
  const { t } = useTranslation();
  const { routes, loading } = useVehicleData();
  const { geofences } = useGeofenceData();
  const { ready, seek } = useInterpolation(routes, geofences);
  const { connected: wsConnected } = useWebSocket();

  useSystemTheme();
  useKeyboardShortcuts({ seek });
  useGeofenceAlerts(geofences);
  useAnalytics();

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
          <VehicleDetail routes={routes} />
        </Sidebar>
      }
    >
      <MapView ready={ready} />
    </Layout>
  );
};

export default App;
