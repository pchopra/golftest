import { useState, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  granted: boolean;
}

const SF_LAT = 37.7749;
const SF_LNG = -122.4194;

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    granted: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        latitude: SF_LAT,
        longitude: SF_LNG,
        error: 'Geolocation not supported',
        granted: true,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          granted: true,
        });
      },
      () => {
        setState({
          latitude: SF_LAT,
          longitude: SF_LNG,
          error: 'Location access denied. Showing Bay Area courses.',
          loading: false,
          granted: true,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { ...state, requestLocation };
}
