/* eslint-disable @typescript-eslint/no-explicit-any */
type GoogleMap = any;
type GoogleMarker = any;
type GooglePolyline = any;

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

let mapLoadPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (mapLoadPromise) return mapLoadPromise;
  if (window.google?.maps) return Promise.resolve();

  mapLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return mapLoadPromise;
}

export function createMarker(
  map: GoogleMap,
  position: { lat: number; lng: number },
  options?: Record<string, unknown>
): GoogleMarker {
  return new window.google.maps.Marker({ map, position, ...options });
}

export function createPolyline(
  map: GoogleMap,
  path: { lat: number; lng: number }[],
  options?: Record<string, unknown>
): GooglePolyline {
  return new window.google.maps.Polyline({
    map,
    path,
    strokeColor: '#1d6fd6',
    strokeOpacity: 0.9,
    strokeWeight: 4,
    ...options,
  });
}
