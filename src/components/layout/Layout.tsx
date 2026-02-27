import type { ReactNode } from 'react';
import Header from './Header';
import Timeline from '@/components/timeline/Timeline';
import KPIBar from '@/components/panel/KPIBar';
import PerformanceOverlay from '@/components/panel/PerformanceOverlay';
import ShortcutGuide from './ShortcutGuide';
import LayerToggle from '@/components/map/LayerToggle';

type LayoutProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  onSeek: (time: number) => void;
  toasts?: ReactNode;
  analyticsPanel?: ReactNode;
  wsConnected?: boolean;
};

const Layout = ({ children, sidebar, onSeek, toasts, analyticsPanel, wsConnected }: LayoutProps) => {
  return (
    <div className="w-screen h-screen flex flex-col bg-bg-dark">
      <Header wsConnected={wsConnected} />

      <main className="flex-1 relative overflow-hidden">
        {/* Map fills the main area */}
        <div className="absolute inset-0">{children}</div>

        {/* KPI bar overlay top-left */}
        <KPIBar />

        {/* Layer toggle */}
        <LayerToggle />

        {/* Analytics panel overlay on left */}
        {analyticsPanel}

        {/* Sidebar overlay on right — hidden below lg (1024px) */}
        {sidebar && (
          <div className="hidden lg:flex absolute top-4 right-4 bottom-4 w-80 flex-col gap-3 pointer-events-none z-10">
            <div className="pointer-events-auto">{sidebar}</div>
          </div>
        )}

        {/* Performance overlay bottom-left */}
        <PerformanceOverlay />

        {/* Toast container */}
        {toasts}
      </main>

      <Timeline onSeek={onSeek} />
      <ShortcutGuide />
    </div>
  );
};

export default Layout;
