# Audio-Based-Emotion-Recognition-Supervised-and-Unsupervised-Clustering
This project focuses on analyzing and decoding the underlying emotions conveyed through vlogs recorded between 2020 and 2023. The aim is to build a machine learning pipeline capable of recognizing tonal dynamics and classifying vlog segments into distinct emotional categories.

### Key Objectives:
1. **Data Pre-processing:** Extract and format audio from vlogs for analysis.
2. **Feature Engineering:** Apply audio metrics like tonality, pitch, and frequency to extract emotion-related features.
3. **Model Development:** Build unsupervised clustering models (K-Means, Hierarchical) to classify emotions.
4. **Evaluation:** Assess model performance using appropriate metrics like accuracy, precision, and recall.

## Features

- **Audio Extraction:** Extracts audio from vlog files using `moviepy` and saves the files in a structured directory.
- **Pre-processing:** Standardizes sample rates, trims silences, and extracts important audio features.
- **Clustering Models:** K-Means and Agglomerative Clustering models used to analyze and group vlogs based on tonal and emotional content.
- **Feature Visualization:** Waveforms, MFCC, and Chroma-STFT analyses offer insights into the emotional intensity and tonal characteristics of the vlogs.

## File Structure

```
├── data/
│   ├── raw/                # Original vlog files
│   ├── processed/          # Processed audio files
├── notebooks/
│   ├── vlog_analysis.ipynb # Jupyter notebook for data analysis and model building
├── src/
│   ├── audio_extraction.py # Code for extracting audio from vlog files
│   ├── pre_processing.py   # Code for pre-processing the audio files
├── README.md               # Project readme
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/vlog-sentiment-analysis.git
```

2. Install the required Python packages:

```bash
pip install -r requirements.txt
```

3. Ensure you have the following libraries installed:
   - `librosa`
   - `moviepy`
   - `matplotlib`
   - `numpy`
   - `scikit-learn`
   - `seaborn`

## Data

The dataset consists of 102 vlogs recorded over three years, stored in the `/data/raw/` directory. The processed audio files are stored in `/data/processed/`. Key audio features such as MFCC, spectral centroid, zero crossings, and more are extracted for analysis.

## Usage

### Audio Extraction

To extract audio from your vlog videos:

```bash
python src/audio_extraction.py
```

This will convert vlog files into `.wav` format and save them into the `data/processed/` folder.

### Pre-processing

To pre-process the extracted audio for model training:

```bash
python src/pre_processing.py
```

This step trims silences and standardizes the audio sample rate.

### Model Training and Evaluation

You can explore and run the analysis in the Jupyter notebook:

```bash
jupyter notebook notebooks/vlog_analysis.ipynb
```

This notebook includes:
- Feature extraction using `librosa`
- Clustering using K-Means and Hierarchical Clustering
- Data visualization (waveforms, MFCC, etc.)

## Results

The project leverages unsupervised clustering to group vlogs based on tonal patterns. The optimal number of clusters was determined using the silhouette score. Visualizations of key features (MFCC, Chroma-STFT) show how emotions and tone vary across vlogs.

## Future Improvements

1. **Supervised Learning:** Further improvements can include manually labeling vlogs and using supervised models like CNNs for more precise emotion classification.
2. **Additional Features:** Incorporating video analysis could enrich the emotional insights.
3. **Real-time Analysis:** Implement real-time sentiment analysis for vlog recordings.
