'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useJourneyStore } from '@/stores/journeyStore';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function MapCanvas() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { scrollProgress, chapters } = useJourneyStore();
  const getCurrentChapter = useJourneyStore((state) => state.getCurrentChapter);
  const currentChapter = getCurrentChapter();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [103.8198, 1.3521], // Singapore
      zoom: 3,
      pitch: 45,
      bearing: 0,
      interactive: false,
    });

    map.current.on('load', () => {
      if (map.current) {
        map.current.resize();
      }
      setMapLoaded(true);
    });

    map.current.on('style.load', () => {
      if (map.current) {
        map.current.resize();
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add journey path when chapters are loaded
  useEffect(() => {
    if (!map.current || !mapLoaded || chapters.length === 0) return;

    if (map.current.getLayer('journey-line')) {
      map.current.removeLayer('journey-line');
    }
    if (map.current.getSource('journey-path')) {
      map.current.removeSource('journey-path');
    }

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
        'line-width': 3,
        'line-opacity': 0.7,
        'line-dasharray': [2, 2],
      },
    });
  }, [chapters, mapLoaded]);

  // Fly to current chapter
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentChapter) return;

    map.current.flyTo({
      center: currentChapter.coordinates,
      zoom: 6,
      pitch: 50,
      bearing: scrollProgress * 60,
      duration: 2000,
      essential: true,
    });
  }, [currentChapter?.id, mapLoaded, scrollProgress]);

  // Emotion overlay
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentChapter) return;

    if (map.current.getLayer('emotion-overlay')) {
      map.current.removeLayer('emotion-overlay');
    }
    if (map.current.getSource('emotion-overlay')) {
      map.current.removeSource('emotion-overlay');
    }

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
        'circle-radius': 80,
        'circle-color': currentChapter.color,
        'circle-opacity': 0.3,
        'circle-blur': 1,
      },
    });
  }, [currentChapter?.id, currentChapter?.color, mapLoaded]);

  // Fallback if no token
  if (!MAPBOX_TOKEN) {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#0a0a0f] flex items-center justify-center z-0">
        <div className="text-center text-white/50 px-4">
          <p className="text-base sm:text-lg mb-2">Map requires Mapbox token</p>
          <p className="text-xs sm:text-sm font-mono">
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
