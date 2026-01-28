'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useJourneyStore } from '@/stores/journeyStore';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token from environment variable
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function MapCanvas() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollProgress, chapters } = useJourneyStore();
  const getCurrentChapter = useJourneyStore((state) => state.getCurrentChapter);
  const currentChapter = getCurrentChapter();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [103.8198, 1.3521], // Singapore - starting point
      zoom: isMobile ? 2 : 3,
      pitch: isMobile ? 30 : 45,
      bearing: 0,
      interactive: false, // Scroll controls the map, not mouse
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [isMobile]);

  // Add journey path when chapters are loaded
  useEffect(() => {
    if (!map.current || !mapLoaded || chapters.length === 0) return;

    // Remove existing layers if they exist
    if (map.current.getLayer('journey-line')) {
      map.current.removeLayer('journey-line');
    }
    if (map.current.getSource('journey-path')) {
      map.current.removeSource('journey-path');
    }

    // Add journey path line
    map.current.addSource('journey-path', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: chapters.map((ch) => ch.coordinates),
        },
      },
    });

    map.current.addLayer({
      id: 'journey-line',
      type: 'line',
      source: 'journey-path',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#FF9F1C',
        'line-width': isMobile ? 2 : 3,
        'line-opacity': 0.7,
        'line-dasharray': [2, 2],
      },
    });
  }, [chapters, mapLoaded, isMobile]);

  // Fly to current chapter's location
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentChapter) return;

    map.current.flyTo({
      center: currentChapter.coordinates,
      zoom: isMobile ? 4 : 6,
      pitch: isMobile ? 30 : 50,
      bearing: scrollProgress * (isMobile ? 30 : 60), // Less rotation on mobile
      duration: 2000,
      essential: true,
    });
  }, [currentChapter?.id, mapLoaded, scrollProgress, isMobile]);

  // Update emotion overlay
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentChapter) return;

    // Remove existing overlay
    if (map.current.getLayer('emotion-overlay')) {
      map.current.removeLayer('emotion-overlay');
    }
    if (map.current.getSource('emotion-overlay')) {
      map.current.removeSource('emotion-overlay');
    }

    // Add new overlay
    map.current.addSource('emotion-overlay', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: currentChapter.coordinates,
        },
      },
    });

    map.current.addLayer({
      id: 'emotion-overlay',
      type: 'circle',
      source: 'emotion-overlay',
      paint: {
        'circle-radius': isMobile ? 50 : 80,
        'circle-color': currentChapter.color,
        'circle-opacity': 0.3,
        'circle-blur': 1,
      },
    });
  }, [currentChapter?.id, currentChapter?.color, mapLoaded, isMobile]);

  // Show placeholder if no Mapbox token
  if (!MAPBOX_TOKEN) {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#0a0a0f] flex items-center justify-center z-0">
        <div className="text-center text-white/50 px-4">
          <p className="text-base sm:text-lg mb-2">Map requires Mapbox token</p>
          <p className="text-xs sm:text-sm font-mono break-all">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
