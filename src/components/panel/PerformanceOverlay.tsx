import { useUIStore } from '@/stores/uiStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const getFPSColor = (fps: number): string => {
  if (fps >= 50) return '#00FF88';
  if (fps >= 30) return '#FFB800';
  return '#FF4757';
};

const PerformanceOverlay = () => {
  const isOpen = useUIStore((s) => s.isPerformanceOverlayOpen);
  const stats = usePerformanceMonitor(isOpen);
  const vehicleCount = useSimulationStore((s) => s.stats.totalVehicles);

  if (!isOpen) return null;

  const fpsColor = getFPSColor(stats.fps);

  return (
    <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
      <div className="glass-panel px-3 py-2 font-mono text-[11px] flex flex-col gap-0.5 min-w-[130px]">
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">FPS</span>
          <span style={{ color: fpsColor }} className="font-bold tabular-nums">
            {stats.fps}
          </span>
        </div>
        {stats.heapMB > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-text-secondary">Heap</span>
            <span className="text-text-primary tabular-nums">{stats.heapMB} MB</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">Vehicles</span>
          <span className="text-accent-cyan tabular-nums">{vehicleCount}</span>
        </div>
        <div className="border-t border-white/10 mt-1 pt-1 text-[9px] text-text-secondary text-center">
          Press P to toggle
        </div>
      </div>
    </div>
  );
};

export default PerformanceOverlay;
