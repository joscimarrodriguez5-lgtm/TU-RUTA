import { useState, useCallback } from 'react';
import type { MapLocation } from '../types';

interface GeolocationState {
  location: MapLocation | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Mi Ubicación',
          },
          loading: false,
          error: null,
        });
      },
      (err) => {
        setState({ location: null, loading: false, error: err.message });
      },
      { timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  return { ...state, getCurrentLocation };
}
