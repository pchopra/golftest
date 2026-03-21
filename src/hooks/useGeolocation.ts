import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

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

  const requestLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      if (Capacitor.isNativePlatform()) {
        // Native: use Capacitor Geolocation
        const permission = await Geolocation.requestPermissions();
        if (permission.location === 'denied') {
          setState({
            latitude: SF_LAT,
            longitude: SF_LNG,
            error: 'Location access denied. Showing Bay Area courses.',
            loading: false,
            granted: true,
          });
          return;
        }
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          granted: true,
        });
      } else {
        // Web: use browser geolocation
        if (!navigator.geolocation) {
          setState(prev => ({
            ...prev,
            latitude: SF_LAT,
            longitude: SF_LNG,
            error: 'Geolocation not supported',
            loading: false,
            granted: true,
          }));
          return;
        }

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
      }
    } catch {
      setState({
        latitude: SF_LAT,
        longitude: SF_LNG,
        error: 'Location access denied. Showing Bay Area courses.',
        loading: false,
        granted: true,
      });
    }
  }, []);

  return { ...state, requestLocation };
}
