import { useState, useEffect } from 'react';
import type { VehicleRoute, RouteManifest } from '@/types/route';

export const useVehicleData = () => {
  const [routes, setRoutes] = useState<VehicleRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRoutes = async () => {
      try {
        const manifestRes = await fetch('/data/routes/manifest.json');
        if (!manifestRes.ok) throw new Error('Failed to load manifest');
        const manifest: RouteManifest = await manifestRes.json();

        const routePromises = manifest.files.map(async (file) => {
          const res = await fetch(`/data/routes/${file}`);
          if (!res.ok) throw new Error(`Failed to load ${file}`);
          return res.json() as Promise<VehicleRoute>;
        });

        const loadedRoutes = await Promise.all(routePromises);
        if (!cancelled) {
          setRoutes(loadedRoutes);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    loadRoutes();
    return () => { cancelled = true; };
  }, []);

  return { routes, loading, error };
};
