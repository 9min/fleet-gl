export type WSEventType = 'VEHICLE_STATUS_CHANGE' | 'NEW_ORDER' | 'ALERT' | 'GEOFENCE_EVENT';

export type WSEvent = {
  type: WSEventType;
  vehicleId?: string;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
};
