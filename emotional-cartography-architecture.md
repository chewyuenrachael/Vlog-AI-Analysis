# 🗺️ Emotional Cartography: Technical Architecture

> Transform 3 years of vlogs across 5 countries into an interactive scrollytelling experience that reveals how a machine learned to understand emotion.

---

## 🎯 Vision

A visitor lands on your portfolio. They scroll. A map awakens—your journey unfolds city by city. Audio snippets breathe life into each location. Spectrograms ripple across the screen as the ML pipeline processes in real-time. Emotion clusters bloom like weather systems over each country. By the end, they haven't just *read* about your project—they've *experienced* it.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React/Next.js)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  ScrollManager│  │  MapCanvas   │  │ AudioEngine  │  │  MLVisualizer │    │
│  │  (GSAP/Lenis)│  │  (Mapbox GL) │  │  (Howler.js) │  │  (Three.js)  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │             │
│         └─────────────────┴────────┬────────┴─────────────────┘             │
│                                    │                                         │
│                          ┌─────────▼─────────┐                              │
│                          │   State Manager    │                              │
│                          │   (Zustand/Jotai)  │                              │
│                          └─────────┬─────────┘                              │
│                                    │                                         │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │    API Layer        │
                          │  (Next.js API/Flask)│
                          └──────────┬──────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
┌───────▼───────┐          ┌─────────▼─────────┐        ┌────────▼────────┐
│  Static Assets │          │   ML Inference    │        │  Journey Data   │
│  (Vercel/CDN)  │          │   (Modal/Replicate)│        │  (JSON/Supabase)│
│                │          │                   │        │                 │
│ • Audio clips  │          │ • Feature extract │        │ • Coordinates   │
│ • Spectrograms │          │ • Clustering      │        │ • Timestamps    │
│ • Waveform data│          │ • Classification  │        │ • Annotations   │
└────────────────┘          └───────────────────┘        └─────────────────┘
```

---

## 📦 Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Next.js 14 (App Router) | SSG for performance, API routes for ML |
| **Styling** | Tailwind + CSS Variables | Rapid iteration + theming |
| **Scroll Engine** | GSAP ScrollTrigger + Lenis | Silky smooth, precise control |
| **Map** | Mapbox GL JS | Beautiful, customizable, performant |
| **Audio** | Howler.js + Web Audio API | Cross-browser, waveform access |
| **3D/Visualizations** | Three.js + React Three Fiber | Spectrogram landscapes, particle systems |
| **State** | Zustand | Lightweight, perfect for scroll state |
| **ML Backend** | Modal Labs or Replicate | Serverless GPU inference |
| **Hosting** | Vercel | Edge functions, great DX |
| **Data** | Static JSON (or Supabase if needed) | Simple, fast |

---

## 🧩 Component Architecture

### 1. **ScrollManager** — The Conductor

Controls the entire experience timeline.

```tsx
// src/components/ScrollManager.tsx

interface ScrollState {
  progress: number;          // 0-1 overall journey progress
  currentChapter: Chapter;   // Which country/segment
  chapterProgress: number;   // 0-1 within current chapter
  isAudioPlaying: boolean;
  mlPipelineStage: 'idle' | 'extracting' | 'clustering' | 'classifying' | 'complete';
}

type Chapter = {
  id: string;
  country: string;
  city: string;
  coordinates: [number, number];
  dateRange: string;
  audioClips: AudioClip[];
  emotionCluster: EmotionCluster;
  color: string;              // Emotion-mapped color
  narrative: string;          // Your written reflection
};
```

**Key Logic:**
```
Scroll 0-15%   → Chapter 1: Singapore (origin story)
Scroll 15-35%  → Chapter 2: [Country 2]
Scroll 35-55%  → Chapter 3: [Country 3]
Scroll 55-75%  → Chapter 4: [Country 4]
Scroll 75-90%  → Chapter 5: [Country 5]
Scroll 90-100% → Conclusion: What the machine learned
```

---

### 2. **MapCanvas** — The Visual Anchor

```tsx
// src/components/MapCanvas.tsx

interface MapCanvasProps {
  currentCoordinates: [number, number];
  journeyPath: GeoJSON.LineString;
  emotionOverlays: EmotionOverlay[];
  transitionDuration: number;
}

// Emotion overlays rendered as custom layers
interface EmotionOverlay {
  coordinates: [number, number];
  radius: number;
  color: string;           // Mapped from cluster
  intensity: number;       // 0-1, from model confidence
  label: string;           // "Cluster A: Reflective"
}
```

**Visual Behaviors:**
- **Flight Animation**: Camera smoothly flies between cities as user scrolls
- **Emotion Halos**: Circular gradients bloom around each location, colored by cluster
- **Path Trail**: Dotted line shows your complete journey, animates as you progress
- **Fog of War**: Unvisited sections are desaturated/dim

**Mapbox Custom Style:**
Create a muted, slightly desaturated base map that lets your emotion colors pop. Consider a dark mode aesthetic—your spectrograms and visualizations will glow.

---

### 3. **AudioEngine** — The Emotional Core

```tsx
// src/components/AudioEngine.tsx

interface AudioClip {
  id: string;
  url: string;              // CDN path to .mp3/.wav
  startTime: number;        // When in scroll timeline to trigger
  duration: number;
  waveformData: number[];   // Pre-computed for visualization
  features: {
    mfcc: number[];
    spectralCentroid: number;
    energy: number;
    tempo: number;
  };
  predictedEmotion: string;
  confidence: number;
}
```

**Audio UX Principles:**
- Clips fade in/out smoothly (500ms crossfade)
- Volume tied to scroll velocity (slow scroll = louder)
- Multiple clips can layer with different volumes
- User can mute/unmute (persist preference)
- Mobile: require tap-to-enable audio

**Waveform Visualization:**
```
┌────────────────────────────────────────────────┐
│  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁ │
│                    ▲                            │
│              playhead synced                    │
│              to scroll position                 │
└────────────────────────────────────────────────┘
```

---

### 4. **MLVisualizer** — The Technical Showcase

This is where you show the pipeline *working*. Three sub-components:

#### 4a. **SpectrogramDisplay**
```tsx
// Real-time spectrogram that builds as audio plays
// Use canvas or WebGL for performance

interface SpectrogramProps {
  audioData: Float32Array;
  colorMap: 'viridis' | 'magma' | 'plasma' | 'emotion'; // custom emotion gradient
  isAnimating: boolean;
}
```

#### 4b. **FeatureExtractor** (Animated)
```tsx
// Shows features being "extracted" from the spectrogram
// Animated numbers/bars that settle into final values

interface FeatureDisplay {
  name: string;           // "MFCC Coefficient 3"
  value: number;
  normalizedValue: number; // For bar visualization
  isExtracting: boolean;   // Shows loading shimmer
}
```

#### 4c. **ClusterVisualization** (3D)
```tsx
// Three.js point cloud showing all your vlog segments
// Current segment highlighted, connected to cluster centroid

interface ClusterVizProps {
  points: Array<{
    position: [number, number, number];  // PCA-reduced
    cluster: number;
    isCurrent: boolean;
    metadata: { date: string; location: string };
  }>;
  centroids: Array<[number, number, number]>;
  clusterColors: string[];
}
```

**Animation Sequence:**
```
[User scrolls to new chapter]
       ↓
[Audio begins playing]
       ↓
[Spectrogram builds from left to right] ← 2 seconds
       ↓
[Feature values animate from 0 to actual] ← 1 second  
       ↓
[3D cluster view rotates to show current point] ← 1 second
       ↓
[Emotion label fades in with confidence %]
```

---

### 5. **NarrativeOverlay** — The Human Element

```tsx
// src/components/NarrativeOverlay.tsx

interface NarrativeOverlayProps {
  chapter: Chapter;
  progress: number;
}

// Content structure for each chapter
interface ChapterNarrative {
  headline: string;        // "Buenos Aires, 2022"
  subtitle: string;        // "The year everything changed"
  bodyText: string;        // 2-3 sentences, your voice
  technicalNote: string;   // "Agglomerative clustering placed this..."
  emotionLabel: string;    // "Cluster B: Contemplative"
}
```

**Design Pattern:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─────────────────┐    ┌────────────────────────┐ │
│  │                 │    │                        │ │
│  │   MAP CANVAS    │    │    NARRATIVE PANEL     │ │
│  │   (60% width)   │    │    (40% width)         │ │
│  │                 │    │                        │ │
│  │   [emotion      │    │  Buenos Aires, 2022    │ │
│  │    overlays]    │    │  ─────────────────     │ │
│  │                 │    │                        │ │
│  │                 │    │  "I recorded these     │ │
│  │                 │    │  vlogs during my       │ │
│  │                 │    │  genomIT internship..."│ │
│  │                 │    │                        │ │
│  │                 │    │  ┌──────────────────┐  │ │
│  │                 │    │  │ [SPECTROGRAM]    │  │ │
│  │                 │    │  │ [FEATURES]       │  │ │
│  │                 │    │  │ [CLUSTER: B]     │  │ │
│  │                 │    │  └──────────────────┘  │ │
│  └─────────────────┘    └────────────────────────┘ │
│                                                     │
│  ═══════════════════════════════════════════════   │
│              [WAVEFORM / PROGRESS BAR]             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Data Models

### journey.json
```json
{
  "metadata": {
    "totalDuration": "3 years",
    "totalClips": 47,
    "countries": 5,
    "dateRange": ["2020-01-15", "2023-06-30"]
  },
  "chapters": [
    {
      "id": "ch-singapore",
      "country": "Singapore",
      "city": "Singapore",
      "coordinates": [103.8198, 1.3521],
      "dateRange": "Jan 2020 - Mar 2020",
      "scrollStart": 0,
      "scrollEnd": 0.15,
      "color": "#4A90D9",
      "emotionCluster": {
        "id": 2,
        "label": "Grounded",
        "centroid": [0.23, -0.45, 0.12],
        "confidence": 0.78
      },
      "narrative": {
        "headline": "Singapore",
        "subtitle": "Where it began",
        "body": "Home. The familiar. I started recording vlogs here not knowing they'd become data for a machine learning experiment three years later.",
        "technicalNote": "Audio from this period showed high spectral stability—the algorithm detected consistent tonal patterns."
      },
      "audioClips": ["clip-sg-001.mp3", "clip-sg-002.mp3"]
    }
    // ... more chapters
  ]
}
```

### clips/{clip-id}.json
```json
{
  "id": "clip-sg-001",
  "filename": "clip-sg-001.mp3",
  "duration": 12.4,
  "recordedAt": "2020-02-14T15:30:00Z",
  "waveform": [0.12, 0.34, 0.56, ...],  // 100 samples
  "features": {
    "mfcc": [-234.5, 45.2, -12.3, ...],  // 13 coefficients
    "chromaStft": [0.4, 0.2, 0.6, ...],  // 12 values
    "spectralCentroid": 1842.3,
    "spectralBandwidth": 2103.4,
    "spectralRolloff": 4521.2,
    "zeroCrossingRate": 0.082,
    "rmsEnergy": 0.034,
    "tempo": 112.5
  },
  "predictions": {
    "kmeans": { "cluster": 2, "confidence": 0.72 },
    "agglomerative": { "cluster": 1, "confidence": 0.85 },
    "spectral": { "cluster": 2, "confidence": 0.68 }
  },
  "spectrogramUrl": "/spectrograms/clip-sg-001.png"
}
```

---

## 🎨 Visual Design Direction

### Aesthetic: **"Data Memoir"**
A blend of documentary warmth and technical precision. Think *information is beautiful* meets *personal essay*.

### Color System
```css
:root {
  /* Base */
  --bg-primary: #0a0a0f;        /* Near-black with blue tint */
  --bg-secondary: #12121a;
  --text-primary: #e8e8ed;
  --text-muted: #6b6b7b;
  
  /* Emotion Clusters (derived from your actual clustering) */
  --cluster-a: #FF6B6B;          /* Energetic/Excited */
  --cluster-b: #4ECDC4;          /* Calm/Reflective */
  --cluster-c: #FFE66D;          /* Neutral/Observational */
  --cluster-d: #95E1D3;          /* Contemplative */
  
  /* Accents */
  --accent-spectrogram: #7B61FF; /* Purple glow for ML viz */
  --accent-path: #FF9F1C;        /* Journey line on map */
}
```

### Typography
```css
/* Display: Something with character */
font-family: 'Newsreader', Georgia, serif;  /* Editorial feel */

/* Technical/Data: Clean monospace */
font-family: 'JetBrains Mono', monospace;

/* Body: Readable, warm */
font-family: 'Source Serif 4', Georgia, serif;
```

### Key Visual Moments

1. **Hero Load**: Map fades in from black, your journey path draws itself, text types out: *"Can a machine understand how I felt?"*

2. **Chapter Transitions**: Map camera swoops to new coordinates, old emotion overlay fades, new one blooms

3. **ML Pipeline Reveal**: First time the spectrogram appears, it should feel like a reveal—maybe slides up from bottom with a slight glow

4. **Final Cluster View**: At the end, zoom out to show ALL data points colored by cluster, your entire emotional landscape

---

## 🔌 API Endpoints

### Static Data (Pre-computed)
```
GET /data/journey.json           → Full journey metadata
GET /data/clips/{id}.json        → Individual clip features
GET /audio/{filename}            → Audio file (CDN)
GET /spectrograms/{filename}     → Pre-rendered spectrogram images
```

### Live Inference (Optional, for "Try It Yourself")
```
POST /api/analyze
  Body: { audioBase64: string }
  Returns: {
    features: { mfcc, spectralCentroid, ... },
    predictions: { cluster, confidence },
    spectrogramBase64: string
  }
```

**Implementation (Modal Labs):**
```python
# api/analyze.py (deployed to Modal)
import modal
import librosa
import numpy as np

stub = modal.Stub("emotional-cartography")
image = modal.Image.debian_slim().pip_install("librosa", "scikit-learn", "numpy")

@stub.function(image=image)
def analyze_audio(audio_bytes: bytes) -> dict:
    # Load audio
    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050)
    
    # Extract features (same as your notebook)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    # ... more features
    
    # Load pre-trained model
    model = load_model()  # Your agglomerative model
    
    # Predict
    features_vector = np.concatenate([...])
    cluster = model.predict(features_vector.reshape(1, -1))
    
    return {
        "features": {...},
        "cluster": int(cluster[0]),
        "confidence": float(confidence)
    }
```

---

## 📱 Responsive Strategy

### Desktop (1200px+)
Full experience: side-by-side map + narrative, 3D cluster visualization, full waveform

### Tablet (768px - 1199px)
Stacked layout: Map on top (60vh), narrative scrolls below, simplified ML viz

### Mobile (< 768px)
- Map becomes header element (40vh, fixed during chapter)
- Heavy focus on narrative text
- ML visualization becomes expandable accordion
- Audio requires explicit tap to play
- Consider: "View on desktop for full experience" prompt

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Next.js project setup with Tailwind
- [ ] Basic scroll tracking with GSAP ScrollTrigger
- [ ] Static journey data structure
- [ ] Mapbox integration with camera animation

### Phase 2: Audio + Waveforms (Week 2)
- [ ] Howler.js integration
- [ ] Pre-compute waveform data from your clips
- [ ] Waveform visualization component
- [ ] Scroll-synced audio playback

### Phase 3: ML Visualizations (Week 3)
- [ ] Static spectrogram display
- [ ] Feature extraction animation
- [ ] Three.js cluster visualization (can be 2D initially)
- [ ] Connect all to scroll state

### Phase 4: Polish + Narrative (Week 4)
- [ ] Write chapter narratives
- [ ] Typography and color refinement
- [ ] Transitions and micro-interactions
- [ ] Mobile responsive pass

### Phase 5: Deploy + Optional Live Demo (Week 5)
- [ ] Vercel deployment
- [ ] Optional: Modal Labs inference endpoint
- [ ] Performance optimization (lazy load, code split)
- [ ] Analytics (how far do people scroll?)

---

## 🧪 Pre-computation Script

Run this once to generate all static assets:

```python
# scripts/precompute.py

import librosa
import json
import numpy as np
from pathlib import Path
import matplotlib.pyplot as plt

def process_clip(audio_path: Path) -> dict:
    """Extract all features and generate visualizations for one clip."""
    y, sr = librosa.load(audio_path, sr=22050)
    
    # Features
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13).mean(axis=1).tolist()
    spectral_centroid = float(librosa.feature.spectral_centroid(y=y, sr=sr).mean())
    # ... all other features
    
    # Waveform (downsample to 100 points for visualization)
    waveform = np.abs(y)
    waveform_downsampled = np.interp(
        np.linspace(0, len(waveform), 100),
        np.arange(len(waveform)),
        waveform
    ).tolist()
    
    # Spectrogram image
    S = librosa.feature.melspectrogram(y=y, sr=sr)
    S_db = librosa.power_to_db(S, ref=np.max)
    
    fig, ax = plt.subplots(figsize=(10, 4))
    librosa.display.specshow(S_db, sr=sr, ax=ax, cmap='magma')
    plt.axis('off')
    spectrogram_path = f"public/spectrograms/{audio_path.stem}.png"
    plt.savefig(spectrogram_path, bbox_inches='tight', pad_inches=0, transparent=True)
    plt.close()
    
    return {
        "id": audio_path.stem,
        "duration": float(librosa.get_duration(y=y, sr=sr)),
        "waveform": waveform_downsampled,
        "features": {
            "mfcc": mfcc,
            "spectralCentroid": spectral_centroid,
            # ...
        },
        "spectrogramUrl": f"/spectrograms/{audio_path.stem}.png"
    }

def main():
    clips_dir = Path("data/audio")
    output_dir = Path("public/data/clips")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    all_clips = []
    for audio_file in clips_dir.glob("*.wav"):
        clip_data = process_clip(audio_file)
        all_clips.append(clip_data)
        
        # Save individual clip data
        with open(output_dir / f"{clip_data['id']}.json", 'w') as f:
            json.dump(clip_data, f, indent=2)
    
    print(f"Processed {len(all_clips)} clips")

if __name__ == "__main__":
    main()
```

---

## 🎯 Key Success Metrics

1. **Scroll Depth**: Do visitors make it to the end? (Target: 60%+)
2. **Time on Page**: Are they engaging? (Target: 3+ minutes)
3. **Audio Engagement**: Do they unmute? (Track this!)
4. **Portfolio Conversion**: Do they click through to other projects?

---

## 💡 Pro Tips

1. **Audio is optional, not required**: Some will browse at work, on transit, or just prefer silence. The experience should work without audio—let visuals carry the weight.

2. **Progressive disclosure**: Don't dump all technical details at once. The ML pipeline reveal should feel like a reward for scrolling, not a wall of information.

3. **Your voice matters**: The technical showcase impresses, but your written narrative is what makes this memorable. Don't over-edit—let your personality come through.

4. **Test on real people**: Before launch, have 3-5 non-technical friends try it. Where do they get confused? Where do they disengage?

5. **Performance budget**: Target < 3s initial load. Lazy load audio, spectrograms, and the 3D visualization. First contentful paint should just be the map + headline.

---

## 🔗 Resources

- [GSAP ScrollTrigger Docs](https://greensock.com/scrolltrigger/)
- [Mapbox GL JS Examples](https://docs.mapbox.com/mapbox-gl-js/examples/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Howler.js](https://howlerjs.com/)
- [Modal Labs](https://modal.com/) (serverless ML inference)
- [Lenis Smooth Scroll](https://lenis.studiofreight.com/)

---

*Architecture designed for Rach's Emotional Cartography project. Built with the understanding that the best technical portfolios don't just show what you built—they show how you think.*
