import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSimulationStore } from '@/stores/simulationStore';
import type { PlaybackSpeed } from '@/types/simulation';

const SPEEDS: PlaybackSpeed[] = [60, 120, 300, 600];

const PlaybackControls = () => {
  const { t } = useTranslation();
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const playbackSpeed = useSimulationStore((s) => s.playbackSpeed);
  const togglePlay = useSimulationStore((s) => s.togglePlay);
  const setSpeed = useSimulationStore((s) => s.setSpeed);

  const handleSpeedClick = useCallback(
    (speed: PlaybackSpeed) => {
      setSpeed(speed);
    },
    [setSpeed],
  );

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center rounded-md bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan transition-colors"
        aria-label={isPlaying ? t('playback.pause') : t('playback.play')}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="2" y="1" width="3.5" height="12" rx="1" />
            <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3 1.5v11l9-5.5z" />
          </svg>
        )}
      </button>

      <div className="flex gap-1">
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => handleSpeedClick(speed)}
            className={`px-2 py-0.5 text-xs rounded font-mono transition-colors ${
              playbackSpeed === speed
                ? 'bg-accent-cyan text-bg-dark font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {speed >= 60 ? `${speed / 60}m/s` : `${speed}x`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlaybackControls;
