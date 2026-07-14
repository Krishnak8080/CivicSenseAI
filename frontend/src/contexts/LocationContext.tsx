import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
  formatted_address: string;
  timestamp: number;
}

interface LocationContextType {
  userLocation: UserLocation | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  refetchLocation: () => void;
}

const LocationContext = createContext<LocationContextType>({
  userLocation: null,
  isLoadingLocation: false,
  locationError: null,
  refetchLocation: () => {},
});

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fetchUserLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode to get address
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            const result = await geocoder.geocode({
              location: { lat: latitude, lng: longitude },
            });

            if (result.results && result.results.length > 0) {
              const locationData: UserLocation = {
                latitude,
                longitude,
                address: result.results[0].address_components[0]?.long_name || '',
                formatted_address: result.results[0].formatted_address,
                timestamp: Date.now(),
              };

              localStorage.setItem('civicsense_user_location', JSON.stringify(locationData));
              setUserLocation(locationData);
            }
          } else {
            // Google Maps API not loaded, just use coordinates
            const fallbackLocation: UserLocation = {
              latitude,
              longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              formatted_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              timestamp: Date.now(),
            };
            localStorage.setItem('civicsense_user_location', JSON.stringify(fallbackLocation));
            setUserLocation(fallbackLocation);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          const fallbackLocation: UserLocation = {
            latitude,
            longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            formatted_address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            timestamp: Date.now(),
          };
          localStorage.setItem('civicsense_user_location', JSON.stringify(fallbackLocation));
          setUserLocation(fallbackLocation);
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  useEffect(() => {
    const cachedLocation = localStorage.getItem('civicsense_user_location');

    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        const age = Date.now() - parsed.timestamp;

        if (age < 3600000) {
          // 1 hour
          setUserLocation(parsed);
          setIsLoadingLocation(false);
          return;
        }
      } catch (e) {
        console.error('Invalid cached location');
      }
    }

    fetchUserLocation();
  }, []);

  const refetchLocation = () => {
    fetchUserLocation();
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        isLoadingLocation,
        locationError,
        refetchLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = () => useContext(LocationContext);
