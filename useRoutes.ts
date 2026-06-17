import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Route, SearchParams } from '../types';

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRoutes = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);

    const { origin, destination } = params;

    const { data, error: dbError } = await supabase
      .from('routes')
      .select(`
        *,
        company:transport_companies(*)
      `)
      .eq('is_active', true)
      .or(
        `origin_city.ilike.%${origin}%,destination_city.ilike.%${destination}%,name.ilike.%${origin}%,name.ilike.%${destination}%`
      );

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    // Filter routes that match both origin and destination with fuzzy matching
    const filtered = (data || []).filter(r => {
      const orig = origin.toLowerCase().trim();
      const dest = destination.toLowerCase().trim();

      if (!orig && !dest) return true;

      const routeOrig = r.origin_city.toLowerCase();
      const routeDest = r.destination_city.toLowerCase();
      const routeName = r.name.toLowerCase();

      const matchesOrig = !orig ||
        routeOrig.includes(orig) ||
        routeName.includes(orig) ||
        orig.includes(routeOrig.split(',')[0]);

      const matchesDest = !dest ||
        routeDest.includes(dest) ||
        routeName.includes(dest) ||
        dest.includes(routeDest.split(',')[0]);

      return matchesOrig || matchesDest;
    });

    setRoutes(filtered as Route[]);
    setLoading(false);
  }, []);

  const getAllRoutes = useCallback(async () => {
    setLoading(true);
    const { data, error: dbError } = await supabase
      .from('routes')
      .select('*, company:transport_companies(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (dbError) setError(dbError.message);
    else setRoutes(data as Route[]);
    setLoading(false);
  }, []);

  return { routes, loading, error, searchRoutes, getAllRoutes };
}
