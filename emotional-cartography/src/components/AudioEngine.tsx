'use client';

import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { useJourneyStore } from '@/stores/journeyStore';

// Simple clip info for audio playback
export interface AudioClipInfo {
  id: string;
  url: string;
  waveform: number[];
}

interface AudioEngineProps {
  clips?: AudioClipInfo[];
}

export function AudioEngine({ clips = [] }: AudioEngineProps) {
  const { isAudioEnabled, currentClipId, setCurrentClip } = useJourneyStore();
  const soundsRef = useRef<Map<string, Howl>>(new Map());
  const [currentWaveform, setCurrentWaveform] = useState<number[]>([]);

  // Preload all audio clips
  useEffect(() => {
    clips.forEach((clip) => {
      if (!soundsRef.current.has(clip.id)) {
        const sound = new Howl({
          src: [clip.url],
          preload: true,
          volume: 0.7,
          onend: () => setCurrentClip(null),
        });
        soundsRef.current.set(clip.id, sound);
      }
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
      const clip = clips.find((c) => c.id === currentClipId);
      if (clip) setCurrentWaveform(clip.waveform);
    }
  }, [currentClipId, isAudioEnabled, clips]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-sm z-50 border-t border-white/10">
      <WaveformVisualizer
        waveform={currentWaveform}
        isPlaying={!!currentClipId && isAudioEnabled}
      />
      <AudioToggle />
    </div>
  );
}

function WaveformVisualizer({
  waveform,
  isPlaying,
}: {
  waveform: number[];
  isPlaying: boolean;
}) {
  // Generate placeholder waveform if none provided
  const displayWaveform =
    waveform.length > 0
      ? waveform
      : Array.from({ length: 50 }, () => Math.random() * 0.5 + 0.2);

  return (
    <div className="flex items-center justify-center h-full gap-[2px] px-8">
      {displayWaveform.map((value, i) => (
        <div
          key={i}
          className="w-1 bg-white/60 rounded-full transition-all duration-150"
          style={{
            height: `${Math.max(value * 40, 4)}px`,
            opacity: isPlaying ? 0.8 : 0.3,
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

// Simple speaker icons
function SpeakerOnIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function SpeakerOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  );
}
