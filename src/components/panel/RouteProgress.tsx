import { memo } from 'react';
import { formatTime } from '@/utils/format';
import type { WaypointProgress } from '@/types/routeDetail';

type RouteProgressProps = {
  waypoints: WaypointProgress[];
};

const statusDotColor: Record<string, string> = {
  completed: '#00FF88',
  current: '#00D4FF',
  upcoming: '#8892A0',
};

const RouteProgress = memo(({ waypoints }: RouteProgressProps) => {
  if (waypoints.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-1">
      {waypoints.map((wp, i) => {
        const isLast = i === waypoints.length - 1;
        const deviationMin = Math.round(wp.deviationSeconds / 60);
        const isDelayed = wp.deviationSeconds > 300;

        return (
          <div key={i} className="flex gap-2 min-h-[32px]">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center w-4 shrink-0">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${wp.status === 'current' ? 'ring-2 ring-accent-cyan/40' : ''}`}
                style={{ backgroundColor: statusDotColor[wp.status] }}
              />
              {!isLast && (
                <div className="w-px flex-1 min-h-[16px] bg-white/10" />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 pb-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${wp.status === 'upcoming' ? 'text-text-secondary' : 'text-text-primary'}`}>
                  {wp.name}
                </span>
                {wp.status === 'completed' && isDelayed && (
                  <span className="text-[10px] text-accent-red font-mono">+{deviationMin}m</span>
                )}
                {wp.status === 'completed' && !isDelayed && deviationMin !== 0 && (
                  <span className="text-[10px] text-accent-green font-mono">{deviationMin}m</span>
                )}
              </div>
              <div className="text-[10px] text-text-secondary font-mono">
                {formatTime(wp.plannedArrival)}
                {wp.actualArrival !== null && (
                  <span className={isDelayed ? ' text-accent-red' : ' text-accent-green'}>
                    {' → '}{formatTime(wp.actualArrival)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

RouteProgress.displayName = 'RouteProgress';

export default RouteProgress;
