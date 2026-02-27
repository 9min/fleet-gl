import { useSimulationStore } from '@/stores/simulationStore';
import { formatTime } from '@/utils/format';
import AnimatedNumber from '@/components/panel/AnimatedNumber';

const MobileKPIBar = () => {
  const stats = useSimulationStore((s) => s.stats);
  const currentTime = useSimulationStore((s) => s.currentTime);
  const isPlaying = useSimulationStore((s) => s.isPlaying);

  return (
    <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-1.5 pointer-events-none">
      {/* Time */}
      <div className="glass-panel px-2 py-1 flex items-center gap-1.5 pointer-events-auto">
        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-accent-red' : 'bg-text-secondary'}`} />
        <span className="font-mono text-[10px] text-accent-cyan">{formatTime(currentTime)}</span>
      </div>
      {/* Stats */}
      <div className="glass-panel px-2 py-1 flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
          <AnimatedNumber value={stats.running} className="font-mono text-[10px] text-text-primary" />
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
          <AnimatedNumber value={stats.completed} className="font-mono text-[10px] text-text-primary" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-text-secondary">{stats.progressPercent}%</span>
        </div>
      </div>
    </div>
  );
};

export default MobileKPIBar;
