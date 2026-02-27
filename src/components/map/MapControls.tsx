import { useCallback } from 'react';
import { MAP_CONFIG } from '@/constants/map';

type MapControlsProps = {
  onResetCamera: () => void;
};

const MapControls = ({ onResetCamera }: MapControlsProps) => {
  const handleReset = useCallback(() => {
    onResetCamera();
  }, [onResetCamera]);

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
      <button
        onClick={handleReset}
        className="w-8 h-8 flex items-center justify-center rounded-md bg-bg-card/80 backdrop-blur-xl border border-white/10 text-text-secondary hover:text-text-primary transition-colors"
        title={`Reset to ${MAP_CONFIG.center[1].toFixed(2)}, ${MAP_CONFIG.center[0].toFixed(2)}`}
        aria-label="Reset camera"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 2v2M8 12v2M2 8h2M12 8h2" />
        </svg>
      </button>
    </div>
  );
};

export default MapControls;
