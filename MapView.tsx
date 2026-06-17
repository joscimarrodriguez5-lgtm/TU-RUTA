/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { Navigation, ZoomIn, ZoomOut, Layers, MapPin } from 'lucide-react';
import { loadGoogleMaps, createMarker, createPolyline } from '../../lib/maps';
import type { Route, MapLocation } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
const HONDURAS_CENTER = { lat: 15.2, lng: -86.8 };

const MAP_STYLES: any[] = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f5d08a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#b3d9f2' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#e8f4e8' }] },
];

interface MapViewProps {
  center?: MapLocation;
  selectedRoute?: Route | null;
  onLocationSelect?: (location: MapLocation) => void;
  className?: string;
  zoom?: number;
}

export function MapView({
  center = HONDURAS_CENTER,
  selectedRoute,
  onLocationSelect,
  className = '',
  zoom = 7,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  useEffect(() => {
    if (!GOOGLE_MAPS_KEY || !containerRef.current) {
      setError('no_key');
      setLoading(false);
      return;
    }

    loadGoogleMaps(GOOGLE_MAPS_KEY)
      .then(() => {
        if (!containerRef.current) return;
        mapRef.current = new window.google.maps.Map(containerRef.current, {
          center: center,
          zoom,
          mapTypeId: mapType,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          styles: MAP_STYLES,
        });

        if (onLocationSelect) {
          mapRef.current.addListener('click', (e: any) => {
            if (e.latLng) {
              onLocationSelect({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
          });
        }

        setLoading(false);
      })
      .catch(() => {
        setError('load_error');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.panTo(center);
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    if (!selectedRoute) return;

    const origin = selectedRoute.origin_lat && selectedRoute.origin_lng
      ? { lat: selectedRoute.origin_lat, lng: selectedRoute.origin_lng }
      : null;
    const destination = selectedRoute.destination_lat && selectedRoute.destination_lng
      ? { lat: selectedRoute.destination_lat, lng: selectedRoute.destination_lng }
      : null;

    if (!origin || !destination) return;

    // Use Directions API for real road route
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: mapRef.current,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#1d6fd6',
        strokeWeight: 5,
        strokeOpacity: 0.85,
      },
    });
    directionsRendererRef.current = directionsRenderer;

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
        } else {
          const polyline = createPolyline(mapRef.current, [origin, destination]);
          polylinesRef.current.push(polyline);
        }
      }
    );

    // Origin marker
    const originMarker = createMarker(mapRef.current, origin, {
      title: selectedRoute.origin_city,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#22c55e',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      },
    });
    markersRef.current.push(originMarker);

    // Destination marker
    const destMarker = createMarker(mapRef.current, destination, {
      title: selectedRoute.destination_city,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      },
    });
    markersRef.current.push(destMarker);

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(destination);
    mapRef.current.fitBounds(bounds, 80);
  }, [selectedRoute]);

  function handleZoomIn() {
    if (mapRef.current) mapRef.current.setZoom((mapRef.current.getZoom() || 7) + 1);
  }

  function handleZoomOut() {
    if (mapRef.current) mapRef.current.setZoom((mapRef.current.getZoom() || 7) - 1);
  }

  function handleToggleMapType() {
    const next = mapType === 'roadmap' ? 'satellite' : 'roadmap';
    setMapType(next);
    if (mapRef.current) mapRef.current.setMapTypeId(next);
  }

  function handleMyLocation() {
    navigator.geolocation?.getCurrentPosition(pos => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      mapRef.current?.panTo(loc);
      mapRef.current?.setZoom(14);
    });
  }

  if (error === 'no_key') {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl overflow-hidden relative border border-blue-100`}>
        <div className="text-center p-8 max-w-sm relative z-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <MapPin size={28} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Mapa de Honduras</h3>
          <p className="text-sm text-gray-500 mb-4">
            Activa el mapa real agregando tu clave de Google Maps API:
          </p>
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-left mb-4">
            <code className="text-xs text-blue-600 font-mono block">VITE_GOOGLE_MAPS_KEY=tu_clave</code>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              'San Pedro Sula', 'Tegucigalpa', 'La Ceiba', 'Tela',
              'Copán Ruinas', 'Comayagua', 'El Progreso', 'Choluteca'
            ].map(city => (
              <div key={city} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white bg-opacity-60 rounded-lg px-2 py-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                {city}
              </div>
            ))}
          </div>
        </div>

        {/* Honduras-shaped decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Route lines mockup */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
            <path d="M 80 200 Q 200 150 320 100" stroke="#1d4ed8" strokeWidth="2" fill="none" strokeDasharray="5,5" />
            <path d="M 100 180 Q 180 130 280 160" stroke="#15803d" strokeWidth="2" fill="none" strokeDasharray="5,5" />
            <path d="M 60 220 Q 200 180 360 130" stroke="#1d4ed8" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
            <circle cx="80" cy="200" r="5" fill="#22c55e" />
            <circle cx="320" cy="100" r="5" fill="#ef4444" />
            <circle cx="100" cy="180" r="4" fill="#22c55e" />
            <circle cx="280" cy="160" r="4" fill="#ef4444" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-2xl overflow-hidden`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <LoadingSpinner size="lg" />
        </div>
      )}

      <div ref={containerRef} className="w-full h-full" />

      {!loading && !error && (
        <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
          <button
            onClick={handleMyLocation}
            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Mi ubicación"
          >
            <Navigation size={18} className="text-blue-600" />
          </button>
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ZoomIn size={18} className="text-gray-600" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ZoomOut size={18} className="text-gray-600" />
          </button>
          <button
            onClick={handleToggleMapType}
            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Cambiar vista"
          >
            <Layers size={18} className="text-gray-600" />
          </button>
        </div>
      )}

      {selectedRoute && !loading && (
        <div className="absolute bottom-3 left-3 right-16 z-10">
          <div className="bg-white rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 truncate">{selectedRoute.origin_city}</span>
              <div className="flex-1 h-px bg-gray-300 min-w-4" />
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 truncate">{selectedRoute.destination_city}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
