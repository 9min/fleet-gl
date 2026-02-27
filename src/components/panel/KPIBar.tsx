import { useSimulationStore } from '@/stores/simulationStore';
import { formatTime } from '@/utils/format';
import AnimatedNumber from './AnimatedNumber';

type KPICardProps = {
  label: string;
  value: number;
  total: number;
  color: string;
  formatter?: (n: number) => string;
};

const KPICard = ({ label, value, total, color, formatter }: KPICardProps) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="glass-panel px-3 py-2 flex items-center gap-2.5 min-w-[140px]">
      <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
        <circle
          cx="22" cy="22" r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"
        />
        <circle
          cx="22" cy="22" r={radius}
          fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 22 22)"
          className="transition-all duration-700"
        />
        <text
          x="22" y="23" textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="11" fontFamily="monospace" fontWeight="bold"
        >
          {pct}
        </text>
      </svg>
      <div className="flex flex-col">
        <span className="text-text-secondary text-[10px] uppercase tracking-wider">{label}</span>
        <AnimatedNumber
          value={value}
          className="font-mono text-base font-bold text-text-primary"
          formatter={formatter}
        />
      </div>
    </div>
  );
};

const KPIBar = () => {
  const stats = useSimulationStore((s) => s.stats);
  const currentTime = useSimulationStore((s) => s.currentTime);
  const isPlaying = useSimulationStore((s) => s.isPlaying);

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
      {/* LIVE indicator */}
      <div className="glass-panel px-3 py-2 flex items-center gap-2 pointer-events-auto">
        <div className="relative flex items-center justify-center">
          {isPlaying && (
            <span className="absolute w-3 h-3 rounded-full bg-accent-red animate-pulse-live" />
          )}
          <span className={`relative w-2 h-2 rounded-full ${isPlaying ? 'bg-accent-red' : 'bg-text-secondary'}`} />
        </div>
        <span className="font-mono text-xs text-text-primary">
          {isPlaying ? 'LIVE' : 'PAUSED'}
        </span>
        <span className="font-mono text-xs text-accent-cyan">
          {formatTime(currentTime)}
        </span>
      </div>

      <KPICard
        label="Vehicles"
        value={stats.totalVehicles}
        total={stats.totalVehicles}
        color="#00D4FF"
      />
      <KPICard
        label="Active"
        value={stats.running}
        total={stats.totalVehicles}
        color="#00D4FF"
      />
      <KPICard
        label="Completed"
        value={stats.completed}
        total={stats.totalVehicles}
        color="#00FF88"
      />
      <KPICard
        label="Progress"
        value={stats.progressPercent}
        total={100}
        color="#00FF88"
        formatter={(n) => `${n}%`}
      />
    </div>
  );
};

export default KPIBar;
