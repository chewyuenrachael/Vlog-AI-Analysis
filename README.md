# 🎙️ Vlog AI Analysis: Emotion Recognition via Audio Clustering

This project explores the emotional undercurrents of personal vlogs recorded between 2020 and 2023, using **machine learning techniques** to identify tonal dynamics and cluster emotionally similar segments. By analyzing voice pitch, timbre, rhythm, and other acoustic features, the system aims to decode how vloggers **convey emotion through voice**—without relying on transcripts or facial expressions.

## 🧠 Project Objectives

1. **Audio Pipeline Setup:** Extract and format high-quality audio from vlog videos for downstream processing.
2. **Feature Engineering:** Derive expressive audio features such as **MFCCs, pitch, spectral contrast**, and **zero-crossing rate**.
3. **Emotion Clustering:** Use **unsupervised learning** (K-Means, Hierarchical Clustering) to group vlogs into emotional categories.
4. **Model Evaluation:** Visualize and evaluate cluster cohesion using **Silhouette Score**, waveform plots, and feature scattergrams.

---

## 🚀 Key Features

| Module              | Description |
|---------------------|-------------|
| 🎧 **Audio Extraction** | Uses `moviepy` to convert vlog video files to `.wav` audio format. |
| 🛠️ **Pre-processing** | Standardizes sample rates, trims silences, and prepares data for modeling using `librosa`. |
| 📊 **Feature Extraction** | Computes MFCCs, Chroma-STFT, Spectral Centroid, and more to capture tonal quality. |
| 🔍 **Clustering Models** | Applies K-Means and Agglomerative Clustering to group similar emotional segments. |
| 📈 **Visualization** | Provides waveform plots, MFCC heatmaps, and 2D PCA plots for interpretability. |

---

## 🗂️ Project Structure

```
vlog-ai-analysis/
├── data/
│   ├── raw/                # Original vlog video files
│   ├── processed/          # Cleaned and trimmed audio in .wav format
├── notebooks/
│   ├── vlog_analysis.ipynb # End-to-end notebook for analysis and clustering
├── src/
│   ├── audio_extraction.py # Script to extract audio from vlog videos
│   ├── pre_processing.py   # Script for silence trimming and feature extraction
├── README.md               # Project documentation
└── requirements.txt        # Python dependencies
```

---

## ⚙️ Installation Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vlog-ai-analysis.git
cd vlog-ai-analysis
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

3. Ensure the following libraries are installed:
- `librosa`
- `moviepy`
- `matplotlib`
- `scikit-learn`
- `numpy`
- `seaborn`

---

## 🎧 Data Overview

The dataset consists of **102 vlogs** recorded from 2020 to 2023. Raw video files are stored in `/data/raw/`, and audio files (after extraction and cleaning) are stored in `/data/processed/`. Features include:

- **Mel Frequency Cepstral Coefficients (MFCCs)**
- **Chroma Frequencies**
- **Zero Crossing Rate**
- **Spectral Bandwidth**

---

## 🧪 Running the Pipeline

### Step 1: Audio Extraction
```bash
python src/audio_extraction.py
```

### Step 2: Audio Pre-processing
```bash
python src/pre_processing.py
```

### Step 3: Explore & Cluster via Notebook
```bash
jupyter notebook notebooks/vlog_analysis.ipynb
```

Notebook includes:
- Feature extraction
- Dimensionality reduction (PCA)
- K-Means & Hierarchical clustering
- Visual analysis of audio-based emotions

---

## 📊 Results Snapshot

- Emotion clusters were identified using **silhouette score optimization**
- Clear separation in tonal profiles based on MFCC and pitch variance
- Clusters roughly corresponded to emotions like **excitement**, **calm**, **frustration**, and **melancholy**

---

## 🔮 Future Directions

1. **Supervised Classification:** Fine-tune with labeled data using CNN or RNN-based models.
2. **Multimodal Emotion Detection:** Fuse video frames and audio for richer emotional understanding.
3. **Real-Time Feedback:** Enable emotion detection during live recording or streaming.
4. **Linguistic Layer:** Add NLP-based sentiment from transcripts for a hybrid audio-text model.

---

## 🧾 Acknowledgements

- Audio analysis powered by [`librosa`](https://librosa.org/)
- Video/audio preprocessing via [`moviepy`](https://zulko.github.io/moviepy/)
- Clustering with `scikit-learn`
- Project inspired by current trends in **affective computing** and **audio-based emotion recognition**
