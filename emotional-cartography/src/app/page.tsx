'use client';

import { useEffect, useState } from 'react';
import { ScrollManager } from '@/components/ScrollManager';
import { MapCanvas } from '@/components/MapCanvas';
import { AudioEngine } from '@/components/AudioEngine';
import { MLVisualizer } from '@/components/MLVisualizer';
import { NarrativePanel } from '@/components/NarrativePanel';
import { useJourneyStore } from '@/stores/journeyStore';
import type { JourneyData } from '@/types';
import type { AudioClipInfo } from '@/components/AudioEngine';

// Placeholder data - will be replaced with actual journey.json
const PLACEHOLDER_JOURNEY: JourneyData = {
  metadata: {
    totalDuration: '3 years',
    totalClips: 15,
    countries: 5,
    dateRange: ['2020-01-15', '2023-06-30'],
  },
  chapters: [
    {
      id: 'ch-singapore',
      country: 'Singapore',
      city: 'Singapore',
      coordinates: [103.8198, 1.3521],
      dateRange: 'Jan 2020 - Mar 2020',
      scrollStart: 0.1,
      scrollEnd: 0.25,
      color: '#4ECDC4',
      emotionCluster: {
        id: 1,
        label: 'Grounded',
        confidence: 0.78,
      },
      narrative: {
        headline: 'Singapore',
        subtitle: 'Where it began',
        body: 'Home. The familiar. I started recording vlogs here not knowing they would become data for a machine learning experiment three years later.',
        technicalNote:
          'Audio from this period showed high spectral stability—the algorithm detected consistent tonal patterns.',
      },
      audioClips: ['clip-sg-001', 'clip-sg-002'],
    },
    {
      id: 'ch-placeholder-2',
      country: 'Country 2',
      city: 'City 2',
      coordinates: [-58.3816, -34.6037], // Buenos Aires
      dateRange: 'Apr 2021 - Aug 2021',
      scrollStart: 0.25,
      scrollEnd: 0.4,
      color: '#FF6B6B',
      emotionCluster: {
        id: 2,
        label: 'Energetic',
        confidence: 0.85,
      },
      narrative: {
        headline: 'Buenos Aires',
        subtitle: 'The year everything changed',
        body: 'Your personal narrative for this location goes here. What were you experiencing during this time?',
        technicalNote:
          'Agglomerative clustering placed this segment in the high-energy cluster based on tempo and spectral bandwidth.',
      },
      audioClips: ['clip-ar-001'],
    },
    {
      id: 'ch-placeholder-3',
      country: 'Country 3',
      city: 'City 3',
      coordinates: [121.5654, 25.033], // Taipei
      dateRange: 'Sep 2021 - Dec 2021',
      scrollStart: 0.4,
      scrollEnd: 0.55,
      color: '#FFE66D',
      emotionCluster: {
        id: 3,
        label: 'Contemplative',
        confidence: 0.72,
      },
      narrative: {
        headline: 'Taipei',
        subtitle: 'A semester of reflection',
        body: 'Your personal narrative for this location goes here.',
        technicalNote:
          'MFCC analysis revealed lower spectral centroid values during this period.',
      },
      audioClips: ['clip-tw-001'],
    },
    {
      id: 'ch-placeholder-4',
      country: 'Country 4',
      city: 'City 4',
      coordinates: [77.209, 28.6139], // Delhi
      dateRange: 'Jan 2022 - Apr 2022',
      scrollStart: 0.55,
      scrollEnd: 0.7,
      color: '#95E1D3',
      emotionCluster: {
        id: 4,
        label: 'Curious',
        confidence: 0.81,
      },
      narrative: {
        headline: 'India',
        subtitle: 'Sensory overload',
        body: 'Your personal narrative for this location goes here.',
        technicalNote:
          'High zero-crossing rates indicated more dynamic vocal patterns.',
      },
      audioClips: ['clip-in-001'],
    },
    {
      id: 'ch-placeholder-5',
      country: 'Country 5',
      city: 'City 5',
      coordinates: [-74.006, 40.7128], // New York
      dateRange: 'May 2022 - Jun 2023',
      scrollStart: 0.7,
      scrollEnd: 0.85,
      color: '#7B61FF',
      emotionCluster: {
        id: 1,
        label: 'Determined',
        confidence: 0.88,
      },
      narrative: {
        headline: 'New York',
        subtitle: 'The final chapter',
        body: 'Your personal narrative for this location goes here.',
        technicalNote:
          'Consistent RMS energy levels suggested a stable emotional baseline.',
      },
      audioClips: ['clip-ny-001'],
    },
  ],
};

// Placeholder audio clips - will be populated from journey data
const PLACEHOLDER_CLIPS: AudioClipInfo[] = [];

// Default features for visualization
const DEFAULT_FEATURES = {
  mfcc: [],
  spectralCentroid: 2500,
  spectralBandwidth: 1800,
  spectralRolloff: 4000,
  zeroCrossingRate: 0.08,
  rmsEnergy: 0.045,
  tempo: 120,
};

export default function HomePage() {
  const { setChapters, getCurrentChapter } = useJourneyStore();
  const [journeyData, setJourneyData] = useState<JourneyData>(PLACEHOLDER_JOURNEY);
  const currentChapter = getCurrentChapter();

  // Load journey data
  useEffect(() => {
    // Try to load actual journey data
    fetch('/data/journey.json')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('No journey data found');
      })
      .then((data: JourneyData) => {
        setJourneyData(data);
        setChapters(data.chapters);
      })
      .catch(() => {
        // Use placeholder data
        setChapters(PLACEHOLDER_JOURNEY.chapters);
      });
  }, [setChapters]);

  return (
    <main className="bg-[#0a0a0f] text-white min-h-screen">
      {/* Fixed background map */}
      <MapCanvas />

      {/* Scrollable content */}
      <ScrollManager>
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center relative z-10">
          <div className="text-center max-w-2xl px-8">
            <h1 className="text-5xl lg:text-7xl font-serif mb-6 animate-fade-in">
              Emotional Cartography
            </h1>
            <p className="text-xl text-white/60 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              I recorded vlogs across 5 countries over 3 years.
              <br />
              Then I asked: <em className="text-white/80">can a machine understand how I felt?</em>
            </p>
            <div className="animate-bounce text-white/40 mt-12">
              ↓ Scroll to explore
            </div>
          </div>
        </section>

        {/* Chapter Sections */}
        {journeyData.chapters.map((chapter) => (
          <section
            key={chapter.id}
            className="min-h-screen relative z-10"
            data-chapter={chapter.id}
          >
            <div className="container mx-auto min-h-screen grid lg:grid-cols-[1fr_500px] gap-8 items-center px-4">
              {/* Left side: Map shows through (transparent) */}
              <div className="hidden lg:block" />

              {/* Right side: Narrative + ML Viz */}
              <div className="glass rounded-2xl overflow-hidden min-h-[80vh] flex flex-col">
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
                    features={DEFAULT_FEATURES}
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
              Agglomerative clustering worked best—it captured the nuances of
              voice modulation better than KMeans or Spectral methods. But the
              real insight wasn&apos;t technical.
            </p>
            <blockquote className="text-2xl font-serif italic text-white/90 border-l-4 border-purple-500 pl-6 text-left">
              &quot;The process of systematizing something as messy as emotion
              taught me that even the most human problems can benefit from
              structure—if you approach them with humility.&quot;
            </blockquote>

            {/* Metrics summary */}
            <div className="mt-16 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-mono text-purple-400">
                  {journeyData.metadata.totalClips}
                </div>
                <div className="text-sm text-white/50 mt-1">Audio Clips</div>
              </div>
              <div>
                <div className="text-4xl font-mono text-cyan-400">
                  {journeyData.metadata.countries}
                </div>
                <div className="text-sm text-white/50 mt-1">Countries</div>
              </div>
              <div>
                <div className="text-4xl font-mono text-amber-400">
                  {journeyData.metadata.totalDuration}
                </div>
                <div className="text-sm text-white/50 mt-1">Duration</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer spacer for audio bar */}
        <div className="h-20" />
      </ScrollManager>

      {/* Audio controls - fixed at bottom */}
      <AudioEngine clips={PLACEHOLDER_CLIPS} />
    </main>
  );
}
