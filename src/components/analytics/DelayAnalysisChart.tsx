import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { formatTime } from '@/utils/format';
import { useThemeStore } from '@/stores/themeStore';

const DelayAnalysisChart = memo(() => {
  const timeSeries = useAnalyticsStore((s) => s.timeSeries);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === 'dark';

  const data = timeSeries.map((p) => ({
    time: formatTime(p.time),
    Progress: p.progressPercent,
    Delayed: p.delayed,
  }));

  return (
    <div className="h-48">
      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
        Progress & Delay Trends
      </h4>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
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
          <Line type="monotone" dataKey="Progress" stroke="#00FF88" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Delayed" stroke="#FF4757" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

DelayAnalysisChart.displayName = 'DelayAnalysisChart';
export default DelayAnalysisChart;
