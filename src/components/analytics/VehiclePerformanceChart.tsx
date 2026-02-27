import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useThemeStore } from '@/stores/themeStore';

const VehiclePerformanceChart = memo(() => {
  const vehicleMetrics = useAnalyticsStore((s) => s.vehicleMetrics);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === 'dark';

  const data = vehicleMetrics.map((m) => ({
    name: m.vehicleId.replace('V-', ''),
    rate: Math.round(m.completionRate * 100),
    completed: m.completedWaypoints,
  }));

  return (
    <div className="h-48">
      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
        Top 10 Vehicle Performance
      </h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'} />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: isDark ? '#8892A0' : '#6B7280' }} />
          <YAxis tick={{ fontSize: 10, fill: isDark ? '#8892A0' : '#6B7280' }} width={30} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1A2332' : '#FFFFFF',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '8px',
              fontSize: '11px',
              color: isDark ? '#E8ECF1' : '#1A2332',
            }}
            formatter={(value: number) => [`${value}%`, 'Completion']}
          />
          <Bar dataKey="rate" fill="#00D4FF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

VehiclePerformanceChart.displayName = 'VehiclePerformanceChart';
export default VehiclePerformanceChart;
