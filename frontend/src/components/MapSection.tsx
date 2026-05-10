import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useState } from 'react';
import type { Report } from '../types';

interface MapSectionProps {
  reports: Report[];
  onMarkerClick?: (id: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default to New Delhi (Central location)
const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2a2a2a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0d1f0d" }] }
];

const libraries: any = ['places'];

export function MapSection({ reports, onMarkerClick }: MapSectionProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const center = reports.length > 0 && !isNaN(Number(reports[0].latitude)) && !isNaN(Number(reports[0].longitude))
    ? { lat: Number(reports[0].latitude), lng: Number(reports[0].longitude) }
    : defaultCenter;

  if (!isLoaded) return (
    <div className="w-full h-full bg-[var(--bg-secondary)] animate-pulse flex items-center justify-center text-[var(--text-muted)]">
      Loading Map Data...
    </div>
  );

  // Priority-based marker icons
  const getMarkerIcon = (priority: string = 'medium') => {
    const baseUrl = '/markers/';
    
    // Safety check: sometimes the window.google maps object isn't fully ready synchronously,
    // but inside GoogleMap it should be.
    if (!window.google) return undefined;

    return {
      url: `${baseUrl}pin-${priority.toLowerCase()}.svg`,
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 40)
    };
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      options={{ 
        styles: darkMapStyles,
        disableDefaultUI: true, 
        zoomControl: true,
        backgroundColor: '#0a0a0a'
      }}
    >
      {reports.map((report) => {
        const lat = Number(report.latitude);
        const lng = Number(report.longitude);
        if (isNaN(lat) || isNaN(lng)) return null;

        return (
          <Marker
            key={report.id}
            position={{ lat, lng }}
            title={report.title}
            animation={window.google?.maps?.Animation?.DROP}
            icon={getMarkerIcon(report.priority || report.current_priority)}
            onClick={() => {
              setSelectedMarker(report.id);
              if (onMarkerClick) onMarkerClick(report.id);
            }}
          />
        );
      })}

      {selectedMarker && (
        <InfoWindow
          position={{
            lat: Number(reports.find(r => r.id === selectedMarker)?.latitude) || 0,
            lng: Number(reports.find(r => r.id === selectedMarker)?.longitude) || 0
          }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="p-2 bg-black text-white rounded-lg shadow-lg border border-[var(--border-subtle)]">
            <h3 className="font-bold text-sm text-[var(--orange-primary)]">
              {reports.find(r => r.id === selectedMarker)?.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {reports.find(r => r.id === selectedMarker)?.formatted_address || reports.find(r => r.id === selectedMarker)?.location}
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
