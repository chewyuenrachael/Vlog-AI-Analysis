'use client';

import { useEffect, useState } from 'react';
import { ScrollManager } from '@/components/ScrollManager';
import { MapCanvas } from '@/components/MapCanvas';
import { AudioEngine } from '@/components/AudioEngine';
import { MLVisualizer } from '@/components/MLVisualizer';
import { NarrativePanel } from '@/components/NarrativePanel';
import { useJourneyStore } from '@/stores/journeyStore';
import type { JourneyData, AudioClipFeatures } from '@/types';
import type { AudioClipInfo } from '@/components/AudioEngine';

// Default features for visualization (fallback)
const DEFAULT_FEATURES: AudioClipFeatures = {
  mfcc: [],
  spectralCentroid: 2500,
  spectralBandwidth: 1800,
  spectralRolloff: 4000,
  zeroCrossingRate: 0.08,
  rmsEnergy: 0.045,
  tempo: 120,
};

interface ClipData {
  id: string;
  waveform: number[];
  features: AudioClipFeatures;
  predictions: {
    agglomerative?: {
      cluster: number;
      confidence: number;
    };
  };
}

export default function HomePage() {
  const { setChapters, getCurrentChapter } = useJourneyStore();
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [clipDataMap, setClipDataMap] = useState<Map<string, ClipData>>(new Map());
  const [audioClips, setAudioClips] = useState<AudioClipInfo[]>([]);
  const currentChapter = getCurrentChapter();

  // Load journey data
  useEffect(() => {
    fetch('/data/journey.json')
      .then((res) => res.json())
      .then((data: JourneyData) => {
        setJourneyData(data);
        setChapters(data.chapters);

        // Load clip data for all chapters
        const allClipIds = data.chapters.flatMap((ch) => ch.audioClips);
        Promise.all(
          allClipIds.map((clipId) =>
            fetch(`/data/clips/${clipId}.json`)
              .then((res) => res.json())
              .then((clipData: ClipData) => [clipId, clipData] as const)
              .catch(() => null)
          )
        ).then((results) => {
          const map = new Map<string, ClipData>();
          const clips: AudioClipInfo[] = [];

          results.forEach((result) => {
            if (result) {
              const [clipId, clipData] = result;
              map.set(clipId, clipData);
              clips.push({
                id: clipId,
                url: `/audio/${clipId}.wav`,
                waveform: clipData.waveform,
              });
            }
          });

          setClipDataMap(map);
          setAudioClips(clips);
        });
      })
      .catch((err) => console.error('Failed to load journey data:', err));
  }, [setChapters]);

  // Get clip features for current chapter
  const getChapterFeatures = (clipId: string): AudioClipFeatures => {
    const clipData = clipDataMap.get(clipId);
    return clipData?.features || DEFAULT_FEATURES;
  };

  if (!journeyData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white/50 animate-pulse">Loading journey...</div>
      </div>
    );
  }

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
            <p
              className="text-xl text-white/60 mb-8 animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              I recorded vlogs across {journeyData.metadata.countries} countries over{' '}
              {journeyData.metadata.totalDuration}.
              <br />
              Then I asked:{' '}
              <em className="text-white/80">can a machine understand how I felt?</em>
            </p>
            <div className="animate-bounce text-white/40 mt-12">↓ Scroll to explore</div>
          </div>
        </section>

        {/* Chapter Sections */}
        {journeyData.chapters.map((chapter) => {
          const primaryClipId = chapter.audioClips[0];
          const clipFeatures = getChapterFeatures(primaryClipId);

          return (
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
                      spectrogramUrl={`/spectrograms/${primaryClipId}.png`}
                      features={clipFeatures}
                      cluster={chapter.emotionCluster}
                    />
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* Conclusion Section */}
        <section className="min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center max-w-3xl px-8">
            <h2 className="text-4xl lg:text-5xl font-serif mb-8">
              What the Machine Learned
            </h2>
            <p className="text-xl text-white/70 leading-relaxed mb-12">
              Agglomerative clustering worked best—it captured the nuances of voice
              modulation better than KMeans or Spectral methods. But the real insight
              wasn&apos;t technical.
            </p>
            <blockquote className="text-2xl font-serif italic text-white/90 border-l-4 border-purple-500 pl-6 text-left">
              &quot;The process of systematizing something as messy as emotion taught me
              that even the most human problems can benefit from structure—if you
              approach them with humility.&quot;
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
      <AudioEngine clips={audioClips} />
    </main>
  );
}
