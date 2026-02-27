import { memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { formatTime } from '@/utils/format';
import { useThemeStore } from '@/stores/themeStore';

const DeliveryTrendsChart = memo(() => {
  const timeSeries = useAnalyticsStore((s) => s.timeSeries);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === 'dark';

  const data = timeSeries.map((p) => ({
    time: formatTime(p.time),
    Completed: p.completed,
    Running: p.running,
    Idle: p.idle,
  }));

  return (
    <div className="h-48">
      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
        Delivery Trends
      </h4>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: isDark ? '#8892A0' : '#6B7280' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: isDark ? '#8892A0' : '#6B7280' }} width={30} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1A2332' : '#FFFFFF',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '8px',
              fontSize: '11px',
              color: isDark ? '#E8ECF1' : '#1A2332',
            }}
          />
          <Area type="monotone" dataKey="Completed" stackId="1" stroke="#00FF88" fill="#00FF88" fillOpacity={0.3} />
          <Area type="monotone" dataKey="Running" stackId="1" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.3} />
          <Area type="monotone" dataKey="Idle" stackId="1" stroke="#FFB800" fill="#FFB800" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

DeliveryTrendsChart.displayName = 'DeliveryTrendsChart';
export default DeliveryTrendsChart;
