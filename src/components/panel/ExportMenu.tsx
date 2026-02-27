import { useCallback, useState, useRef, useEffect } from 'react';
import { exportMapScreenshot } from '@/utils/exportPng';
import { exportVehiclePositions, exportFleetStats, exportGeofenceEvents } from '@/utils/exportCsv';
import { useSimulationStore } from '@/stores/simulationStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';

// We accept positions from the App level via a shared ref
let _positions: { vehicleId: string; lng: number; lat: number; bearing: number; status: 'running' | 'idle' | 'completed' | 'delayed'; speed: number; waypointIndex: number; totalWaypoints: number }[] = [];

export const setExportPositions = (p: typeof _positions) => { _positions = p; };

const ExportMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleScreenshot = useCallback(() => {
    exportMapScreenshot();
    setIsOpen(false);
  }, []);

  const handleVehicleData = useCallback(() => {
    exportVehiclePositions(_positions);
    setIsOpen(false);
  }, []);

  const handleFleetSummary = useCallback(() => {
    const { stats } = useSimulationStore.getState();
    const { currentTime } = useSimulationStore.getState();
    exportFleetStats(stats, currentTime);
    setIsOpen(false);
  }, []);

  const handleGeofenceEvents = useCallback(() => {
    const { eventLog } = useAnalyticsStore.getState();
    exportGeofenceEvents(eventLog);
    setIsOpen(false);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        title="Export data"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 glass-panel p-1 min-w-[180px] z-50">
          <button
            onClick={handleScreenshot}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors"
          >
            <span className="text-xs text-text-secondary">PNG</span>
            <span className="text-xs text-text-primary">Screenshot</span>
          </button>
          <button
            onClick={handleVehicleData}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors"
          >
            <span className="text-xs text-text-secondary">CSV</span>
            <span className="text-xs text-text-primary">Vehicle Data</span>
          </button>
          <button
            onClick={handleFleetSummary}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors"
          >
            <span className="text-xs text-text-secondary">CSV</span>
            <span className="text-xs text-text-primary">Fleet Summary</span>
          </button>
          <button
            onClick={handleGeofenceEvents}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors"
          >
            <span className="text-xs text-text-secondary">CSV</span>
            <span className="text-xs text-text-primary">Event Log</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
