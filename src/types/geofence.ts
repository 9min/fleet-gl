export type GeofenceType = 'hub' | 'restricted' | 'delivery-area';

export type GeofenceZone = {
  id: string;
  name: string;
  type: GeofenceType;
  polygon: [number, number][];
  center: [number, number];
};

export type GeofenceEvent = {
  id: string;
  vehicleId: string;
  zoneId: string;
  zoneName: string;
  zoneType: GeofenceType;
  action: 'enter' | 'exit';
  timestamp: number;
};
