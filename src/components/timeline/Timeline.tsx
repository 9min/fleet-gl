import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { formatTime } from '@/utils/format';
import PlaybackControls from './PlaybackControls';

type TimelineProps = {
  onSeek: (time: number) => void;
};

const Timeline = ({ onSeek }: TimelineProps) => {
  const currentTime = useSimulationStore((s) => s.currentTime);
  const totalDuration = useSimulationStore((s) => s.totalDuration);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = Number(e.target.value);
      onSeek(time);
    },
    [onSeek],
  );

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="h-14 flex items-center gap-4 px-4 bg-bg-card/80 backdrop-blur-xl border-t border-white/10">
      <PlaybackControls />

      <div className="flex-1 flex items-center gap-3">
        <span className="text-accent-cyan font-mono text-sm w-12 text-right">
          {formatTime(currentTime)}
        </span>

        <div className="flex-1 relative">
          <input
            type="range"
            min={0}
            max={totalDuration}
            value={currentTime}
            onChange={handleSliderChange}
            className="timeline-slider w-full"
          />
          <div
            className="absolute top-1/2 left-0 h-1 bg-accent-cyan/60 rounded-full pointer-events-none -translate-y-1/2"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-text-secondary font-mono text-sm w-12">
          {formatTime(totalDuration)}
        </span>
      </div>
    </div>
  );
};

export default Timeline;
