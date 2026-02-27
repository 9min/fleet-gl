import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useSimulationStore } from '@/stores/simulationStore';
import { useThemeStore } from '@/stores/themeStore';

const COLORS = ['#00D4FF', '#FFB800', '#00FF88', '#FF4757'];
const LABELS = ['Running', 'Idle', 'Completed', 'Delayed'];

const StatusDistributionChart = memo(() => {
  const stats = useSimulationStore((s) => s.stats);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === 'dark';

  const data = [
    { name: 'Running', value: stats.running },
    { name: 'Idle', value: stats.idle },
    { name: 'Completed', value: stats.completed },
    { name: 'Delayed', value: stats.delayed },
  ].filter((d) => d.value > 0);

  return (
    <div className="h-48">
      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
        Fleet Status Distribution
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
              {data.map((entry) => {
                const idx = LABELS.indexOf(entry.name);
                return <Cell key={entry.name} fill={COLORS[idx] ?? '#8892A0'} />;
              })}
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
          {data.map((entry) => {
            const idx = LABELS.indexOf(entry.name);
            return (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[idx] }} />
                <span className="text-[10px] text-text-secondary">{entry.name}</span>
                <span className="text-[10px] font-mono text-text-primary font-bold">{entry.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

StatusDistributionChart.displayName = 'StatusDistributionChart';
export default StatusDistributionChart;
