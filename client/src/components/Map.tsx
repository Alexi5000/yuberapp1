// file: client/src/components/Map.tsx
// description: Google Maps wrapper using standard Google Maps API
// reference: client/src/hooks/usePersistFn.ts, client/src/lib/utils.ts

/// <reference types="@types/google.maps" />

import { usePersistFn } from '@/hooks/usePersistFn';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: typeof google;
  }
}

// Check for standard Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Fallback legacy keys (keep for compatibility if needed, but prioritize standard key)
const FORGE_API_KEY = process.env.NEXT_PUBLIC_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_FORGE_API_URL || 'https://forge.butterfly-effect.dev';

let mapScriptPromise: Promise<void> | null = null;

function loadMapScript() {
  if (mapScriptPromise) return mapScriptPromise;

  mapScriptPromise = new Promise((resolve, reject) => {
    // If script is already loaded, resolve immediately
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Check if script is already in document
    const existingScript = document.querySelector('script[src*="maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Google Maps script failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';

    // Priority 1: Standard Google Maps API
    if (GOOGLE_MAPS_API_KEY) {
      console.log('🗺️ Loading standard Google Maps API...');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    } 
    // Priority 2: Forge Proxy (Legacy)
    else if (FORGE_API_KEY) {
      console.log('🗺️ Loading Google Maps via Forge Proxy...');
      script.src = `${FORGE_BASE_URL}/v1/maps/proxy/maps/api/js?key=${FORGE_API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    } 
    else {
      const error = new Error('❌ Missing Google Maps API Key. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.');
      console.error(error.message);
      reject(error);
      mapScriptPromise = null; // Allow retrying
      return;
    }

    script.onload = () => {
      resolve();
    };
    
    script.onerror = (e) => {
      console.error('Failed to load Google Maps script', e);
      reject(new Error('Google Maps script failed to load'));
      mapScriptPromise = null; // Allow retrying
    };

    document.head.appendChild(script);
  });

  return mapScriptPromise;
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({ className, initialCenter = { lat: 39.9612, lng: -83.1259 }, initialZoom = 12, onMapReady }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  const init = usePersistFn(async () => {
    try {
      await loadMapScript();
    } catch (err: any) {
      setError(err.message);
      return;
    }

    if (!mapContainer.current) return;

    if (!map.current) {
      try {
        map.current = new window.google.maps.Map(mapContainer.current, {
          zoom: initialZoom,
          center: initialCenter,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          streetViewControl: false,
          // DEMO_MAP_ID allows vector maps and AdvancedMarkerElement without a specific paid Map ID
          // If this fails, user should verify billing is enabled on Google Cloud
          mapId: 'DEMO_MAP_ID', 
        });
        
        if (onMapReady) {
          onMapReady(map.current);
        }
      } catch (e: any) {
        console.error('Error creating map instance:', e);
        setError('Failed to create map instance. Please check your API key configuration.');
      }
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  if (error) {
    return (
      <div className={cn('w-full h-125 bg-gray-100 flex items-center justify-center p-4 text-center text-gray-500', className)}>
        <div>
          <p className="mb-2 font-semibold">Map Cannot Load</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={cn('w-full h-125', className)} />;
}
