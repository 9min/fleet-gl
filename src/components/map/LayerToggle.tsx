import { useCallback, useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useIsMobile } from '@/hooks/useIsMobile';

type LayerKey = 'vehicles' | 'trails' | 'heatmap' | 'density' | 'geofences';

const LAYER_OPTIONS: { key: LayerKey; label: string; color: string }[] = [
  { key: 'vehicles', label: 'Vehicles', color: '#00D4FF' },
  { key: 'trails', label: 'Trails', color: '#00D4FF' },
  { key: 'heatmap', label: 'Heatmap', color: '#FF4757' },
  { key: 'density', label: 'Density', color: '#00FF88' },
  { key: 'geofences', label: 'Geofences', color: '#FFB800' },
];

const LayerToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const layerVisibility = useUIStore((s) => s.layerVisibility);
  const toggleLayer = useUIStore((s) => s.toggleLayer);
  const isMobile = useIsMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close on outside click (especially useful on mobile)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Mobile: top-left below KPIBar. Desktop: right of sidebar
  const positionClass = isMobile
    ? 'absolute top-12 left-3 z-20'
    : 'absolute top-4 right-[calc(theme(spacing.4)+theme(spacing.80)+theme(spacing.4))] z-10';

  return (
    <div className={positionClass} ref={wrapperRef}>
      <button
        onClick={handleToggle}
        className="glass-panel w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors pointer-events-auto"
        title="Toggle layers"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </button>

      {isOpen && (
        <div className="glass-panel mt-2 p-2 min-w-[140px] pointer-events-auto">
          {LAYER_OPTIONS.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <div
                className="w-3 h-3 rounded-sm border transition-colors"
                style={{
                  backgroundColor: layerVisibility[key] ? color : 'transparent',
                  borderColor: layerVisibility[key] ? color : 'rgba(255,255,255,0.2)',
                }}
              />
              <span className={`text-xs ${layerVisibility[key] ? 'text-text-primary' : 'text-text-secondary'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LayerToggle;
