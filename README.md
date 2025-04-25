# 🎙️ Vlog AI Analysis: Emotion Recognition via Audio Clustering & Classification

This project analyzes the emotional tonalities embedded in personal vlogs recorded between 2020 and 2023. By leveraging audio signal processing and machine learning, it builds a full pipeline that extracts features from audio, clusters emotional signatures using unsupervised learning, and experiments with supervised classification using spectrograms and gradient boosting models.

> 📁 **Related Paper**: See the attached PDF report [`AI Video Analysis Pipeline.pdf`](./AI%20Video%20Analysis%20Pipeline.pdf) for full mathematical derivations, visualizations, and extended methodology.

---

## 🎯 Objectives

- **Decode emotions** from vlog audio using tonal, spectral, and rhythmic features.
- **Cluster vlog segments** by affective state without using transcripts or facial data.
- **Compare unsupervised and supervised ML methods** for emotional classification.

---

## 🧠 Machine Learning Methods

### 🌀 Unsupervised Learning

Three main clustering algorithms were applied:

#### 1. **KMeans Clustering**
- Uses Euclidean distance to group feature vectors.
- Optimized using **Silhouette Score** to determine the number of emotion clusters.
- Includes mathematical modeling with Jensen-Shannon Divergence and inertia-based loss functions.
- Visualized via PCA (2D/3D).

#### 2. **Agglomerative Clustering**
- A hierarchical bottom-up clustering approach.
- Distance metrics: Ward linkage, average linkage.
- Highlights relationships in emotional tone across vlogs via dendrograms.
- Evaluated for cohesion and separation of clusters.

#### 3. **Spectral Clustering**
- Leverages graph theory and eigen-decomposition of similarity matrices.
- Used when clusters are non-spherical or not linearly separable.
- Demonstrates clear groupings in audio tone landscapes using Laplacian matrices.

---

### 🤖 Supervised Learning (Experimental)

Labeled a subset of data manually to test supervised models:

#### 4. **Convolutional Neural Network (CNN)**
- Input: Audio spectrograms (MFCC, Chroma).
- Architecture: Convolutional layers → ReLU → MaxPooling → Dense.
- Trained on binary emotional categories.
- Evaluation: ROC Curve, Confusion Matrix, Accuracy.

#### 5. **XGBoost Classifier**
- Input: Hand-engineered features (MFCC, spectral centroid, zero crossings, etc.).
- Used for structured emotion classification.
- Robust to overfitting, high performance on tabular data.
- Combined with CNN features for hybrid modeling.

---

## 📁 Project Structure

```
vlog-ai-analysis/
├── data/
│   ├── raw/                # Original vlog videos
│   ├── processed/          # Cleaned audio (.wav)
├── notebooks/
│   ├── vlog_analysis.ipynb # Feature extraction, clustering, visualizations
├── src/
│   ├── audio_extraction.py # Converts .mp4 to .wav
│   ├── pre_processing.py   # Trims silence, normalizes volume
├── models/
│   ├── cnn_model.py        # CNN architecture for spectrogram classification
├── README.md
└── requirements.txt
```

---

## 🔍 Features Extracted

All features were computed using `librosa`, `numpy`, and `scipy`:

| Feature               | Description |
|----------------------|-------------|
| MFCC (13 Coeffs)     | Captures timbral and phonetic cues |
| Chroma-STFT          | Pitch class energy distribution |
| Zero-Crossing Rate   | Noisiness measure |
| Spectral Centroid    | “Brightness” of audio |
| Spectral Bandwidth   | Spread of frequencies |
| Spectral Contrast    | Harmonic vs non-harmonic content |
| Spectral Rolloff     | Frequency boundary (spectrum end) |
| RMS Energy           | Overall loudness |
| Tempo & Pitch        | Rhythmic and prosodic dynamics |

---

## 📊 Visualizations

- **Waveforms**: Before/after silence trimming
- **Heatmaps**: MFCC and Chroma evolution over time
- **Boxplots**: Feature variance across vlog clips
- **Cluster Projections**: PCA and t-SNE reduced feature space
- **Confusion Matrix**: For CNN performance

---

## 🚀 How to Run

### Extract and Preprocess Audio
```bash
python src/audio_extraction.py
python src/pre_processing.py
```

### Explore and Cluster (Jupyter)
```bash
jupyter notebook notebooks/vlog_analysis.ipynb
```

### Train Supervised Model (optional)
```bash
python models/cnn_model.py
```

---

## 📈 Results Snapshot

- **KMeans** identified 2–4 emotional groupings with a peak silhouette score of ~0.61.
- **Agglomerative clustering** captured nuances in voice modulation and was more robust to outliers.
- **Spectral clustering** performed best when emotion contours were non-linear.
- **CNN classifier** achieved 85%+ accuracy on labeled spectrogram data.

---

## 🔮 Future Work

- 🎯 Extend emotion labels using self-reflection journaling.
- 🎼 Integrate music/soundtrack analysis in vlog backgrounds.
- 🎥 Add facial expression recognition for multimodal learning.
- 🗣️ Use Whisper or Wav2Vec for transcript-based fusion models.

---

## 🧾 Credits

- `librosa` for feature extraction
- `moviepy` for video/audio conversion
- `sklearn`, `xgboost`, and `tensorflow` for modeling
- Project inspired by real-world vlogging journeys across seven cities and the quest for emotional self-understanding
