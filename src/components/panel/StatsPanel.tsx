import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSimulationStore } from '@/stores/simulationStore';
import AnimatedNumber from './AnimatedNumber';

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
      <AnimatedNumber
        value={value}
        className="font-mono text-sm text-text-primary w-8 text-right"
      />
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

const StatsPanel = memo(() => {
  const { t } = useTranslation();
  const stats = useSimulationStore((s) => s.stats);
  const isPlaying = useSimulationStore((s) => s.isPlaying);

  return (
    <div className="glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text-primary">{t('status.fleetStatus')}</h2>
          {isPlaying && (
            <span className="relative flex items-center">
              <span className="absolute w-2.5 h-2.5 rounded-full bg-accent-red animate-pulse-live" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-accent-red" />
            </span>
          )}
        </div>
        <AnimatedNumber
          value={stats.totalVehicles}
          className="font-mono text-lg text-accent-cyan"
        />
      </div>

      <div className="flex flex-col gap-2">
        <StatRow label={t('status.running')} value={stats.running} total={stats.totalVehicles} color="#00D4FF" />
        <StatRow label={t('status.idle')} value={stats.idle} total={stats.totalVehicles} color="#FFB800" />
        <StatRow label={t('status.completed')} value={stats.completed} total={stats.totalVehicles} color="#00FF88" />
        {stats.delayed > 0 && (
          <StatRow label={t('status.delayed')} value={stats.delayed} total={stats.totalVehicles} color="#FF4757" />
        )}
      </div>

      <div className="border-t border-white/10 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">{t('kpi.progress')}</span>
          <AnimatedNumber
            value={stats.progressPercent}
            className="font-mono text-sm text-accent-green"
            formatter={(n) => `${n}%`}
          />
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
});

StatsPanel.displayName = 'StatsPanel';

export default StatsPanel;
