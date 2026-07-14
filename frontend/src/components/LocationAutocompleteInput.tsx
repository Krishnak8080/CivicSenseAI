import { useState, useRef, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Search } from 'lucide-react';
import { Input } from './ui/input';

export interface LocationData {
  address: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  place_id?: string;
}

interface LocationAutocompleteInputProps {
  onLocationSelect: (location: LocationData) => void;
  initialValue?: string;
  error?: string;
}

export const LocationAutocompleteInput = ({
  onLocationSelect,
  initialValue = '',
  error,
}: LocationAutocompleteInputProps) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();

        if (!inputRef.current) return;

        // Initialize autocomplete with Delhi bias
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'in' }, // Restrict to India
          fields: ['formatted_address', 'geometry', 'name', 'place_id'],
          types: ['geocode', 'establishment'], // Allow both addresses and places
          bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(28.4089, 76.841), // Delhi SW
            new google.maps.LatLng(28.8836, 77.3466) // Delhi NE
          ),
          strictBounds: false,
        });

        // Listen for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();

          if (!place || !place.geometry || !place.geometry.location) {
            console.error('No details available for selected place');
            return;
          }

          const locationData: LocationData = {
            address: place.name || '',
            formatted_address: place.formatted_address || '',
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            place_id: place.place_id,
          };

          setSelectedLocation(locationData);
          setInputValue(place.formatted_address || place.name || '');
          onLocationSelect(locationData);
        });
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initAutocomplete();
  }, [onLocationSelect]);

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get address
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({
            location: { lat: latitude, lng: longitude },
          });

          if (result.results[0]) {
            const locationData: LocationData = {
              address: result.results[0].address_components[0]?.long_name || '',
              formatted_address: result.results[0].formatted_address,
              latitude,
              longitude,
              place_id: result.results[0].place_id,
            };

            setInputValue(result.results[0].formatted_address);
            setSelectedLocation(locationData);
            onLocationSelect(locationData);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
      }
    );
  };

  return (
    <div className="space-y-2">
      <label htmlFor="location" className="text-sm font-medium text-[var(--text-secondary)] block">
        Precise Location
      </label>

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--orange-primary)] z-10" />

        <Input
          ref={inputRef}
          id="location"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Start typing location... (e.g., Connaught Place, Delhi)"
          className={`pl-11 h-14 text-lg bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-white focus-visible:ring-[var(--orange-primary)] w-full
                     ${error ? 'border-red-500' : ''}`}
        />

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--orange-primary)] 
                     hover:text-[var(--orange-hover)] transition-colors p-2"
          title="Use current location"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {selectedLocation && (
        <div className="text-xs text-[var(--text-muted)] mt-2 p-2 bg-[var(--bg-elevated)] rounded-md border border-[var(--border-subtle)]">
          <p className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-[var(--orange-primary)]" />
            <span className="font-medium text-white">Selected:</span>{' '}
            {selectedLocation.formatted_address}
          </p>
          <p className="mt-1">
            Coordinates: {selectedLocation.latitude.toFixed(6)},{' '}
            {selectedLocation.longitude.toFixed(6)}
          </p>
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)] italic mt-2">
        Our AI will automatically tag the coordinates based on this location.
      </p>
    </div>
  );
};
