import { useSimulationStore } from '@/stores/simulationStore';

type StatRowProps = {
  label: string;
  value: number;
  total: number;
  color: string;
};

const StatRow = ({ label, value, total, color }: StatRowProps) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: color }} />
      <span className="text-text-secondary text-sm flex-1">{label}</span>
      <span className="font-mono text-sm text-text-primary w-8 text-right">{value}</span>
      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-xs text-text-secondary w-8 text-right">{pct}%</span>
    </div>
  );
};

const StatsPanel = () => {
  const stats = useSimulationStore((s) => s.stats);

  return (
    <div className="glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Fleet Status</h2>
        <span className="font-mono text-lg text-accent-cyan">{stats.totalVehicles}</span>
      </div>

      <div className="flex flex-col gap-2">
        <StatRow label="Running" value={stats.running} total={stats.totalVehicles} color="#00D4FF" />
        <StatRow label="Idle" value={stats.idle} total={stats.totalVehicles} color="#FFB800" />
        <StatRow label="Completed" value={stats.completed} total={stats.totalVehicles} color="#00FF88" />
        {stats.delayed > 0 && (
          <StatRow label="Delayed" value={stats.delayed} total={stats.totalVehicles} color="#FF4757" />
        )}
      </div>

      <div className="border-t border-white/10 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Progress</span>
          <span className="font-mono text-sm text-accent-green">{stats.progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-accent-green rounded-full transition-all duration-500"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
