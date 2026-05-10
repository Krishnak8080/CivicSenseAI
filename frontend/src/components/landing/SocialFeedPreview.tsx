import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { motion } from 'framer-motion';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Initial center somewhere in India (e.g., New Delhi)
const center = {
  lat: 28.6139,
  lng: 77.2090
};

// Simulated mock reports for the landing page map
const mockMarkers = [
  { id: 1, lat: 28.6149, lng: 77.2090, priority: 'high', title: "Pothole on Main Road" },
  { id: 2, lat: 28.6129, lng: 77.2100, priority: 'medium', title: "Broken Streetlight" },
  { id: 3, lat: 28.6159, lng: 77.2070, priority: 'low', title: "Garbage Pile" },
];

const libraries: any = ['places'];

export function SocialFeedPreview() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const [, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  return (
    <section className="relative h-[800px] md:h-[900px] overflow-hidden bg-background-dark">
      
      {/* Map Background Layer */}
      <div className="absolute inset-0 z-0 opacity-50 grayscale hover:grayscale-0 transition-all duration-1000">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              disableDefaultUI: true,
              styles: [
                { elementType: "geometry", stylers: [{ color: "#212121" }] },
                { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
                { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
                { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
                { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
                { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
                { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
                { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
                { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
                { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
                { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
                { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
                { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
                { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
                { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
                { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
                { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
              ]
            }}
          >
            {mockMarkers.map((marker) => (
              <Marker 
                key={marker.id} 
                position={{ lat: marker.lat, lng: marker.lng }} 
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="' + (marker.priority === 'high' ? '#EF4444' : marker.priority === 'medium' ? '#F59E0B' : '#FBBF24') + '" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>'),
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="w-full h-full bg-[#111111] flex items-center justify-center text-white/50">Loading interactive map...</div>
        )}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/80 to-transparent z-10 pointer-events-none" />

      <div className="container mx-auto px-6 h-full relative z-20 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
          
          {/* Left Text */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-xl pointer-events-auto"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4 uppercase tracking-tight">
              YOUR <span className="text-orange-primary">NEIGHBORHOOD</span><br />
              YOUR VOICE
            </h2>
            <p className="text-xl md:text-2xl text-white/70 mb-10 font-light">
              See what's happening within 5km of you. Support issues that matter, and watch as your community drives real change.
            </p>

            <ul className="space-y-6">
              {[
                "Real-time map with issue markers",
                "Upvote/downvote like Reddit",
                "Filter by AI-assigned priority",
                "Get notified when issues are resolved"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-4 text-lg text-white font-medium">
                  <div className="w-6 h-6 rounded-full bg-orange-primary/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-orange-primary" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Floating Cards */}
          <div className="hidden lg:flex flex-col gap-6 justify-center items-end pr-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-background-dark/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-96 shadow-2xl pointer-events-auto hover:border-orange-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-bold text-lg leading-tight">Massive Pothole on Sector 4 Road</h3>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">HIGH</span>
              </div>
              <p className="text-white/60 text-sm mb-4 line-clamp-2">This pothole has been causing massive traffic jams and damage to vehicles during rush hour...</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-orange-primary font-bold">▲ 245 Votes</span>
                <span className="text-white/40">2 hours ago</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-background-dark/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-96 shadow-2xl pointer-events-auto hover:border-orange-primary/50 transition-colors mr-12"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-bold text-lg leading-tight">Broken Streetlights</h3>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">MED</span>
              </div>
              <p className="text-white/60 text-sm mb-4 line-clamp-2">The streetlights near the park have been out for 3 days making it unsafe to walk at night...</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-orange-primary font-bold">▲ 112 Votes</span>
                <span className="text-white/40">5 hours ago</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
