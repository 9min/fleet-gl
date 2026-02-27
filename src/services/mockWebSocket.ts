import type { WSEvent, WSEventType } from '@/types/websocket';
import type { SimulationStats } from '@/types/simulation';

type EventListener = (event: WSEvent) => void;

const VEHICLE_IDS = Array.from({ length: 100 }, (_, i) => `V-${String(i + 1).padStart(3, '0')}`);

const EVENT_TEMPLATES: {
  type: WSEventType;
  messages: string[];
  weight: number;
}[] = [
  {
    type: 'VEHICLE_STATUS_CHANGE',
    messages: [
      '{vehicle} changed status to running',
      '{vehicle} is now idle at waypoint',
      '{vehicle} completed delivery route',
      '{vehicle} reported engine warning',
    ],
    weight: 4,
  },
  {
    type: 'NEW_ORDER',
    messages: [
      'New delivery order #ORD-{rand} assigned to {vehicle}',
      'Priority order dispatched to {vehicle}',
      'Express delivery #ORD-{rand} queued for {vehicle}',
    ],
    weight: 2,
  },
  {
    type: 'ALERT',
    messages: [
      '{vehicle} speed exceeding limit in zone',
      'Traffic congestion detected on route of {vehicle}',
      '{vehicle} fuel level below 20%',
      'Weather alert: Heavy rain affecting {vehicle} route',
    ],
    weight: 2,
  },
  {
    type: 'GEOFENCE_EVENT',
    messages: [
      '{vehicle} entered delivery zone',
      '{vehicle} exited restricted area',
      '{vehicle} approaching hub zone',
    ],
    weight: 2,
  },
];

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

const generateEvent = (stats: SimulationStats): WSEvent => {
  // Weighted random selection
  const totalWeight = EVENT_TEMPLATES.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * totalWeight;
  let template = EVENT_TEMPLATES[0]!;
  for (const t of EVENT_TEMPLATES) {
    r -= t.weight;
    if (r <= 0) {
      template = t;
      break;
    }
  }

  const vehicleId = pickRandom(VEHICLE_IDS);
  const rand = String(1000 + Math.floor(Math.random() * 9000));
  const message = pickRandom(template.messages)
    .replace('{vehicle}', vehicleId)
    .replace('{rand}', rand);

  return {
    type: template.type,
    vehicleId,
    message,
    timestamp: Date.now(),
    data: {
      totalVehicles: stats.totalVehicles,
      running: stats.running,
    },
  };
};

export class MockWebSocket {
  private listeners: EventListener[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private _connected = false;

  get connected() {
    return this._connected;
  }

  connect(getStats: () => SimulationStats, getIsPlaying: () => boolean) {
    this._connected = true;

    // Emit events at random intervals (0.5-2s)
    const scheduleNext = () => {
      const delay = 500 + Math.random() * 1500;
      this.intervalId = setTimeout(() => {
        if (!this._connected) return;

        if (getIsPlaying()) {
          const event = generateEvent(getStats());
          this.listeners.forEach((fn) => fn(event));
        }

        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  disconnect() {
    this._connected = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  on(listener: EventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}
