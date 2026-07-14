import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2a2a2a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a1a1a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212121' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0d1f0d' }],
  },
];

// Mock markers to drop during the reveal animation
const mockMarkers = [
  { id: 1, lat: 28.6149, lng: 77.209 },
  { id: 2, lat: 28.6129, lng: 77.21 },
  { id: 3, lat: 28.6159, lng: 77.207 },
  { id: 4, lat: 28.618, lng: 77.2 },
  { id: 5, lat: 28.609, lng: 77.215 },
];

const libraries: any = ['places'];

export function MapRevealAnimation({ onComplete }: { onComplete: () => void }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [showPins, setShowPins] = useState(false);

  useEffect(() => {
    // Sequence the animation steps
    const timer1 = setTimeout(() => setShowPins(true), 1500); // Wait for map to fade in, then drop pins
    const timer2 = setTimeout(() => {
      onComplete();
    }, 6000); // Total duration before redirect

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: 'easeOut',
      }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
    >
      <div className="relative w-full h-full">
        {/* Gradient overlay that fades out */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 pointer-events-none"
        />

        {/* Central pulsing text during load */}
        <AnimatePresence>
          {!showPins && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white text-2xl font-bold tracking-[0.5em] text-center"
              >
                LOCATING
                <br />
                <span className="text-[var(--orange-primary)]">COMMUNITY</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: 28.6139, lng: 77.209 }}
            zoom={14}
            options={{
              styles: darkMapStyles,
              disableDefaultUI: true,
              zoomControl: false,
              gestureHandling: 'none', // Prevent interaction during reveal
            }}
          >
            {showPins &&
              mockMarkers.map((marker) => (
                <motion.div key={marker.id}>
                  {/* We use a custom overlay instead of direct Marker to allow framer-motion animation easily, 
                    but since @react-google-maps/api doesn't natively support wrapping Markers in motion divs for coordinate animations easily, 
                    we simulate the drop by adding the marker after a timeout, or using SVG styling.
                    For simplicity, we just render the Marker, since Google Maps handles its own optimized rendering.
                    We will simulate the drop via the standard marker animation if supported, or just let them appear. */}
                  <Marker
                    position={{ lat: marker.lat, lng: marker.lng }}
                    animation={window.google.maps.Animation.DROP}
                    icon={{
                      url:
                        'data:image/svg+xml;charset=UTF-8,' +
                        encodeURIComponent(
                          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FF6B35" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>'
                        ),
                      scaledSize: new window.google.maps.Size(40, 40),
                    }}
                  />
                </motion.div>
              ))}
          </GoogleMap>
        ) : (
          <div className="w-full h-full bg-[#050505]" />
        )}
      </div>
    </motion.div>
  );
}
