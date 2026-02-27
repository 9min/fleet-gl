import { useState, useEffect } from 'react';
import type { GeofenceZone } from '@/types/geofence';

export const useGeofenceData = () => {
  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/data/geofences.json');
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data: GeofenceZone[] = await res.json();
        if (!cancelled) {
          setGeofences(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return { geofences, loading };
};
