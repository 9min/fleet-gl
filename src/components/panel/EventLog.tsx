import { useAnalyticsStore, type EventLogEntry } from '@/stores/analyticsStore';

const EventItem = ({ event }: { event: EventLogEntry }) => {
  const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
      <div
        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
        style={{ backgroundColor: event.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-primary leading-relaxed truncate">{event.message}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-text-secondary font-mono">{time}</span>
          {event.vehicleId && (
            <span className="text-[10px] font-mono" style={{ color: event.color }}>
              {event.vehicleId}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const EventLog = () => {
  const eventLog = useAnalyticsStore((s) => s.eventLog);
  const reversed = [...eventLog].reverse();

  if (reversed.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-text-secondary text-xs">
        No events yet. Start the simulation to see events.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
        Event Log ({eventLog.length})
      </h4>
      <div className="flex flex-col max-h-[60vh] overflow-y-auto">
        {reversed.map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventLog;
