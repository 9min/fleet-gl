import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { formatTime } from '@/utils/format';
import type { PlaybackSpeed } from '@/types/simulation';

type MobileTimelineProps = {
  onSeek: (time: number) => void;
};

const SPEEDS: PlaybackSpeed[] = [60, 120, 300, 600];
const SPEED_LABELS: Record<number, string> = {
  60: '1x',
  120: '2x',
  300: '5x',
  600: '10x',
};

const MobileTimeline = ({ onSeek }: MobileTimelineProps) => {
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const currentTime = useSimulationStore((s) => s.currentTime);
  const totalDuration = useSimulationStore((s) => s.totalDuration);
  const playbackSpeed = useSimulationStore((s) => s.playbackSpeed);
  const togglePlay = useSimulationStore((s) => s.togglePlay);
  const setSpeed = useSimulationStore((s) => s.setSpeed);

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSeek(Number(e.target.value));
    },
    [onSeek],
  );

  return (
    <div className="glass-panel px-3 py-2 flex flex-col gap-1.5 rounded-t-xl rounded-b-none">
      <input
        type="range"
        min={0}
        max={totalDuration}
        value={currentTime}
        onChange={handleSlider}
        className="timeline-slider"
      />
      <div className="flex items-center justify-between">
        {/* Play/pause */}
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan active:scale-95 transition-transform"
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          )}
        </button>
        {/* Time */}
        <span className="font-mono text-[10px] text-text-secondary">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
        {/* Speed */}
        <div className="flex gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
                playbackSpeed === s
                  ? 'bg-accent-cyan/20 text-accent-cyan'
                  : 'text-text-secondary'
              }`}
            >
              {SPEED_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileTimeline;
