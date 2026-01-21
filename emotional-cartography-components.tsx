// ============================================================
// EMOTIONAL CARTOGRAPHY - React Component Scaffolding
// ============================================================
// This file contains starter code for key components.
// Copy these into your Next.js project structure.
// ============================================================

// ------------------------------------------------------------
// 1. PROJECT STRUCTURE
// ------------------------------------------------------------
/*
emotional-cartography/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Main scrollytelling page
│   └── api/
│       └── analyze/
│           └── route.ts      # Optional: live inference endpoint
├── components/
│   ├── ScrollManager.tsx     # Orchestrates scroll state
│   ├── MapCanvas.tsx         # Mapbox visualization
│   ├── AudioEngine.tsx       # Audio playback + waveform
│   ├── MLVisualizer/
│   │   ├── index.tsx
│   │   ├── Spectrogram.tsx
│   │   ├── FeatureDisplay.tsx
│   │   └── ClusterViz.tsx
│   ├── NarrativePanel.tsx    # Text content for each chapter
│   └── ProgressBar.tsx       # Bottom waveform/progress
├── hooks/
│   ├── useScrollProgress.ts
│   └── useAudioPlayer.ts
├── stores/
│   └── journeyStore.ts       # Zustand state management
├── data/
│   └── journey.json          # Your journey data
├── public/
│   ├── audio/                # Audio clips
│   └── spectrograms/         # Pre-rendered spectrograms
└── styles/
    └── globals.css
*/

// ------------------------------------------------------------
// 2. ZUSTAND STORE (stores/journeyStore.ts)
// ------------------------------------------------------------

import { create } from 'zustand';

interface Chapter {
  id: string;
  country: string;
  city: string;
  coordinates: [number, number];
  dateRange: string;
  scrollStart: number;
  scrollEnd: number;
  color: string;
  emotionCluster: {
    id: number;
    label: string;
    confidence: number;
  };
  narrative: {
    headline: string;
    subtitle: string;
    body: string;
    technicalNote: string;
  };
  audioClips: string[];
}

interface JourneyState {
  // Scroll state
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
  
  // Current chapter
  currentChapter: Chapter | null;
  chapters: Chapter[];
  setChapters: (chapters: Chapter[]) => void;
  
  // Audio state
  isAudioEnabled: boolean;
  toggleAudio: () => void;
  currentClipId: string | null;
  setCurrentClip: (clipId: string | null) => void;
  
  // ML visualization state
  mlStage: 'idle' | 'extracting' | 'clustering' | 'complete';
  setMlStage: (stage: 'idle' | 'extracting' | 'clustering' | 'complete') => void;
  
  // Computed
  getCurrentChapter: () => Chapter | null;
}

export const useJourneyStore = create<JourneyState>((set, get) => ({
  scrollProgress: 0,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  
  currentChapter: null,
  chapters: [],
  setChapters: (chapters) => set({ chapters }),
  
  isAudioEnabled: false,
  toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),
  currentClipId: null,
  setCurrentClip: (clipId) => set({ currentClipId: clipId }),
  
  mlStage: 'idle',
  setMlStage: (stage) => set({ mlStage: stage }),
  
  getCurrentChapter: () => {
    const { scrollProgress, chapters } = get();
    return chapters.find(
      ch => scrollProgress >= ch.scrollStart && scrollProgress < ch.scrollEnd
    ) || null;
  },
}));


// ------------------------------------------------------------
// 3. SCROLL MANAGER (components/ScrollManager.tsx)
// ------------------------------------------------------------

'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useJourneyStore } from '@/stores/journeyStore';

gsap.registerPlugin(ScrollTrigger);

interface ScrollManagerProps {
  children: React.ReactNode;
}

export function ScrollManager({ children }: ScrollManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setScrollProgress = useJourneyStore((state) => state.setScrollProgress);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create scroll trigger for entire journey
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5, // Smooth scrolling
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [setScrollProgress]);

  return (
    <div ref={containerRef} className="relative">
      {children}
    </div>
  );
}


// ------------------------------------------------------------
// 4. MAP CANVAS (components/MapCanvas.tsx)
// ------------------------------------------------------------

'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useJourneyStore } from '@/stores/journeyStore';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export function MapCanvas() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  const { scrollProgress, chapters, getCurrentChapter } = useJourneyStore();
  const currentChapter = getCurrentChapter();

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Or your custom style
      center: [103.8198, 1.3521], // Singapore - starting point
      zoom: 4,
      pitch: 45,
      bearing: 0,
      interactive: false, // Scroll controls the map, not mouse
    });

    // Add journey path line
    map.current.on('load', () => {
      // Add your GeoJSON path here
      map.current?.addSource('journey-path', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: chapters.map(ch => ch.coordinates),
          },
        },
      });

      map.current?.addLayer({
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
    });
  }, [chapters]);

  // Fly to current chapter's location
  useEffect(() => {
    if (!map.current || !currentChapter) return;

    map.current.flyTo({
      center: currentChapter.coordinates,
      zoom: 8,
      pitch: 50,
      bearing: scrollProgress * 360, // Subtle rotation as you scroll
      duration: 2000,
      essential: true,
    });
  }, [currentChapter?.id]);

  // Add emotion overlay circles
  useEffect(() => {
    if (!map.current || !currentChapter) return;
    
    // Remove existing overlay
    if (map.current.getLayer('emotion-overlay')) {
      map.current.removeLayer('emotion-overlay');
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
        'circle-radius': 80,
        'circle-color': currentChapter.color,
        'circle-opacity': 0.3,
        'circle-blur': 1,
      },
    });
  }, [currentChapter?.id]);

  return (
    <div 
      ref={mapContainer} 
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}


// ------------------------------------------------------------
// 5. AUDIO ENGINE (components/AudioEngine.tsx)
// ------------------------------------------------------------

'use client';

import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { useJourneyStore } from '@/stores/journeyStore';

interface AudioClip {
  id: string;
  url: string;
  waveform: number[];
}

interface AudioEngineProps {
  clips: AudioClip[];
}

export function AudioEngine({ clips }: AudioEngineProps) {
  const { isAudioEnabled, currentClipId, setCurrentClip } = useJourneyStore();
  const soundsRef = useRef<Map<string, Howl>>(new Map());
  const [currentWaveform, setCurrentWaveform] = useState<number[]>([]);

  // Preload all audio clips
  useEffect(() => {
    clips.forEach((clip) => {
      const sound = new Howl({
        src: [clip.url],
        preload: true,
        volume: 0.7,
        onend: () => setCurrentClip(null),
      });
      soundsRef.current.set(clip.id, sound);
    });

    return () => {
      soundsRef.current.forEach((sound) => sound.unload());
      soundsRef.current.clear();
    };
  }, [clips, setCurrentClip]);

  // Play/pause based on state
  useEffect(() => {
    if (!currentClipId || !isAudioEnabled) {
      // Fade out all playing sounds
      soundsRef.current.forEach((sound) => {
        if (sound.playing()) {
          sound.fade(sound.volume(), 0, 500);
          setTimeout(() => sound.stop(), 500);
        }
      });
      return;
    }

    const sound = soundsRef.current.get(currentClipId);
    if (sound && !sound.playing()) {
      sound.fade(0, 0.7, 500);
      sound.play();
      
      // Update waveform for visualization
      const clip = clips.find(c => c.id === currentClipId);
      if (clip) setCurrentWaveform(clip.waveform);
    }
  }, [currentClipId, isAudioEnabled, clips]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-sm z-50">
      <WaveformVisualizer waveform={currentWaveform} isPlaying={!!currentClipId && isAudioEnabled} />
      <AudioToggle />
    </div>
  );
}

function WaveformVisualizer({ waveform, isPlaying }: { waveform: number[]; isPlaying: boolean }) {
  return (
    <div className="flex items-center justify-center h-full gap-[2px] px-8">
      {waveform.map((value, i) => (
        <div
          key={i}
          className="w-1 bg-white/60 rounded-full transition-all duration-150"
          style={{
            height: `${value * 40}px`,
            opacity: isPlaying ? 0.8 : 0.3,
            transform: isPlaying ? `scaleY(${1 + Math.sin(Date.now() / 200 + i) * 0.2})` : 'scaleY(1)',
          }}
        />
      ))}
    </div>
  );
}

function AudioToggle() {
  const { isAudioEnabled, toggleAudio } = useJourneyStore();
  
  return (
    <button
      onClick={toggleAudio}
      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      aria-label={isAudioEnabled ? 'Mute audio' : 'Enable audio'}
    >
      {isAudioEnabled ? (
        <SpeakerOnIcon className="w-5 h-5 text-white" />
      ) : (
        <SpeakerOffIcon className="w-5 h-5 text-white/50" />
      )}
    </button>
  );
}

// Simple icons (replace with your preferred icon library)
const SpeakerOnIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
  </svg>
);

const SpeakerOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
  </svg>
);


// ------------------------------------------------------------
// 6. ML VISUALIZER (components/MLVisualizer/index.tsx)
// ------------------------------------------------------------

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourneyStore } from '@/stores/journeyStore';

interface ClipFeatures {
  mfcc: number[];
  spectralCentroid: number;
  spectralBandwidth: number;
  zeroCrossingRate: number;
  rmsEnergy: number;
  tempo: number;
}

interface MLVisualizerProps {
  spectrogramUrl: string;
  features: ClipFeatures;
  cluster: { id: number; label: string; confidence: number };
}

export function MLVisualizer({ spectrogramUrl, features, cluster }: MLVisualizerProps) {
  const { mlStage, setMlStage } = useJourneyStore();
  
  // Animate through stages
  useEffect(() => {
    setMlStage('idle');
    const timer1 = setTimeout(() => setMlStage('extracting'), 500);
    const timer2 = setTimeout(() => setMlStage('clustering'), 2000);
    const timer3 = setTimeout(() => setMlStage('complete'), 3500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [spectrogramUrl, setMlStage]);

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 space-y-6">
      {/* Spectrogram */}
      <div className="relative">
        <h3 className="text-xs uppercase tracking-widest text-white/50 mb-2 font-mono">
          Mel Spectrogram
        </h3>
        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: mlStage !== 'idle' ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="relative"
        >
          <img 
            src={spectrogramUrl} 
            alt="Spectrogram" 
            className="w-full h-32 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-purple-500/20 rounded-lg" />
        </motion.div>
      </div>

      {/* Features */}
      <AnimatePresence>
        {(mlStage === 'clustering' || mlStage === 'complete') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xs uppercase tracking-widest text-white/50 mb-3 font-mono">
              Extracted Features
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <FeatureBar label="Spectral Centroid" value={features.spectralCentroid} max={5000} />
              <FeatureBar label="Zero Crossing" value={features.zeroCrossingRate} max={0.2} />
              <FeatureBar label="RMS Energy" value={features.rmsEnergy} max={0.1} />
              <FeatureBar label="Tempo" value={features.tempo} max={200} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cluster Result */}
      <AnimatePresence>
        {mlStage === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center pt-4 border-t border-white/10"
          >
            <div className="text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">
              Emotional Signature
            </div>
            <div className="text-2xl font-serif text-white">
              {cluster.label}
            </div>
            <div className="text-sm text-white/60 font-mono">
              {(cluster.confidence * 100).toFixed(1)}% confidence
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div>
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
        />
      </div>
    </div>
  );
}


// ------------------------------------------------------------
// 7. NARRATIVE PANEL (components/NarrativePanel.tsx)
// ------------------------------------------------------------

'use client';

import { motion } from 'framer-motion';

interface NarrativePanelProps {
  headline: string;
  subtitle: string;
  body: string;
  technicalNote: string;
  color: string;
}

export function NarrativePanel({ headline, subtitle, body, technicalNote, color }: NarrativePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.6 }}
      className="h-full flex flex-col justify-center p-8 lg:p-12"
    >
      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl lg:text-5xl font-serif text-white mb-2"
        style={{ textShadow: `0 0 40px ${color}40` }}
      >
        {headline}
      </motion.h2>
      
      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-white/60 font-light mb-8"
      >
        {subtitle}
      </motion.p>
      
      {/* Body */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-white/80 leading-relaxed text-lg font-serif mb-8"
      >
        {body}
      </motion.p>
      
      {/* Technical Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="border-l-2 border-white/20 pl-4"
      >
        <p className="text-sm text-white/50 font-mono leading-relaxed">
          {technicalNote}
        </p>
      </motion.div>
    </motion.div>
  );
}


// ------------------------------------------------------------
// 8. MAIN PAGE (app/page.tsx)
// ------------------------------------------------------------

import { ScrollManager } from '@/components/ScrollManager';
import { MapCanvas } from '@/components/MapCanvas';
import { AudioEngine } from '@/components/AudioEngine';
import { MLVisualizer } from '@/components/MLVisualizer';
import { NarrativePanel } from '@/components/NarrativePanel';
import journeyData from '@/data/journey.json';

export default function HomePage() {
  return (
    <main className="bg-[#0a0a0f] text-white min-h-screen">
      {/* Fixed background map */}
      <MapCanvas />
      
      {/* Scrollable content */}
      <ScrollManager>
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center relative z-10">
          <div className="text-center max-w-2xl px-8">
            <h1 className="text-5xl lg:text-7xl font-serif mb-6">
              Emotional Cartography
            </h1>
            <p className="text-xl text-white/60 mb-8">
              I recorded vlogs across 5 countries over 3 years.
              <br />
              Then I asked: <em>can a machine understand how I felt?</em>
            </p>
            <div className="animate-bounce text-white/40">
              ↓ Scroll to explore
            </div>
          </div>
        </section>

        {/* Chapter Sections */}
        {journeyData.chapters.map((chapter, index) => (
          <section 
            key={chapter.id}
            className="min-h-screen relative z-10"
            data-chapter={chapter.id}
          >
            <div className="container mx-auto h-screen grid lg:grid-cols-[1fr_500px] gap-8 items-center">
              {/* Left side: Map shows through (transparent) */}
              <div className="hidden lg:block" />
              
              {/* Right side: Narrative + ML Viz */}
              <div className="bg-black/60 backdrop-blur-xl rounded-2xl overflow-hidden h-[80vh] flex flex-col">
                <NarrativePanel
                  headline={chapter.narrative.headline}
                  subtitle={chapter.narrative.subtitle}
                  body={chapter.narrative.body}
                  technicalNote={chapter.narrative.technicalNote}
                  color={chapter.color}
                />
                
                <div className="p-6 border-t border-white/10">
                  <MLVisualizer
                    spectrogramUrl={`/spectrograms/${chapter.audioClips[0]}.png`}
                    features={/* load from clip data */}
                    cluster={chapter.emotionCluster}
                  />
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Conclusion Section */}
        <section className="min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center max-w-3xl px-8">
            <h2 className="text-4xl lg:text-5xl font-serif mb-8">
              What the Machine Learned
            </h2>
            <p className="text-xl text-white/70 leading-relaxed mb-12">
              Agglomerative clustering worked best—it captured the nuances 
              of voice modulation better than KMeans or Spectral methods.
              But the real insight wasn't technical.
            </p>
            <blockquote className="text-2xl font-serif italic text-white/90 border-l-4 border-purple-500 pl-6 text-left">
              "The process of systematizing something as messy as emotion 
              taught me that even the most human problems can benefit from 
              structure—if you approach them with humility."
            </blockquote>
          </div>
        </section>
      </ScrollManager>

      {/* Audio controls - fixed at bottom */}
      <AudioEngine clips={/* your clips data */} />
    </main>
  );
}


// ------------------------------------------------------------
// 9. GLOBAL STYLES (styles/globals.css)
// ------------------------------------------------------------

/*
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap');

:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --text-primary: #e8e8ed;
  --text-muted: #6b6b7b;
  
  --cluster-a: #FF6B6B;
  --cluster-b: #4ECDC4;
  --cluster-c: #FFE66D;
  --cluster-d: #95E1D3;
  
  --accent-spectrogram: #7B61FF;
  --accent-path: #FF9F1C;
}

body {
  font-family: 'Source Serif 4', Georgia, serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

h1, h2, h3 {
  font-family: 'Newsreader', Georgia, serif;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Hide scrollbar but keep functionality */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

/* Custom selection color */
::selection {
  background-color: var(--accent-spectrogram);
  color: white;
}
*/


// ------------------------------------------------------------
// 10. PACKAGE.JSON DEPENDENCIES
// ------------------------------------------------------------

/*
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "gsap": "^3.12.0",
    "mapbox-gl": "^3.0.0",
    "howler": "^2.2.4",
    "framer-motion": "^10.16.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "three": "^0.158.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/howler": "^2.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
*/
