import MapView from '@/components/map/MapView';
import Layout from '@/components/layout/Layout';
import Sidebar from '@/components/layout/Sidebar';
import StatsPanel from '@/components/panel/StatsPanel';
import VehicleDetail from '@/components/panel/VehicleDetail';
import LoadingScreen from '@/components/layout/LoadingScreen';
import { useVehicleData } from '@/hooks/useVehicleData';
import { useInterpolation } from '@/hooks/useInterpolation';
import { useDeckLayers } from '@/hooks/useDeckLayers';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const App = () => {
  const { routes, loading } = useVehicleData();
  const { positions, ready, seek } = useInterpolation(routes);
  const layers = useDeckLayers(positions, routes);

  useKeyboardShortcuts({ seek });

  if (loading || !ready) {
    return (
      <LoadingScreen
        message={loading ? 'Loading route data...' : 'Initializing simulation engine...'}
      />
    );
  }

  return (
    <Layout
      onSeek={seek}
      sidebar={
        <Sidebar>
          <StatsPanel />
          <VehicleDetail positions={positions} />
        </Sidebar>
      }
    >
      <MapView layers={layers} positions={positions} ready={ready} />
    </Layout>
  );
};

export default App;
