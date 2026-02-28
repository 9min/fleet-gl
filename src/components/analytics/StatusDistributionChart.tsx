import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useSimulationStore } from '@/stores/simulationStore';
import { useThemeStore } from '@/stores/themeStore';

const STATUS_ITEMS: { key: string; tKey: string; color: string }[] = [
  { key: 'running', tKey: 'status.running', color: '#00D4FF' },
  { key: 'idle', tKey: 'status.idle', color: '#FFB800' },
  { key: 'completed', tKey: 'status.completed', color: '#00FF88' },
  { key: 'delayed', tKey: 'status.delayed', color: '#FF4757' },
];

const StatusDistributionChart = memo(() => {
  const { t } = useTranslation();
  const stats = useSimulationStore((s) => s.stats);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === 'dark';

  const values: Record<string, number> = {
    running: stats.running,
    idle: stats.idle,
    completed: stats.completed,
    delayed: stats.delayed,
  };

  const data = STATUS_ITEMS
    .map((item) => ({
      key: item.key,
      name: t(item.tKey),
      value: values[item.key] ?? 0,
      color: item.color,
    }))
    .filter((d) => d.value > 0);

  return (
    <div className="h-48">
      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
        {t('charts.fleetDistribution')}
      </h4>
      <div className="flex items-center h-[85%]">
        <ResponsiveContainer width="60%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1A2332' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '8px',
                fontSize: '11px',
                color: isDark ? '#E8ECF1' : '#1A2332',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5">
          {data.map((entry) => (
            <div key={entry.key} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
              <span className="text-[10px] text-text-secondary">{entry.name}</span>
              <span className="text-[10px] font-mono text-text-primary font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

StatusDistributionChart.displayName = 'StatusDistributionChart';
export default StatusDistributionChart;
