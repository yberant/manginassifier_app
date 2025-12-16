# ML Prediction Service

Python FastAPI microservice for music genre prediction using TensorFlow/Keras.

## Features
- Loads pre-trained Keras model (.keras format)
- Generates predictions for 9 music genres
- Returns probability distribution

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Place your trained model:
```bash
mkdir models
# Copy your genre_classifier.keras file to models/
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Run service:
```bash
python main.py
```

## Endpoints

- `GET /health` - Health check (includes model status)
- `POST /predict` - Generate prediction
  - Request: `{ data: number[128][time][4] }` (multi-channel spectrogram)
  - Response: `{ probabilities: number[9], message: string }`

## Port
Default: **5002**

## Model Requirements
- Format: `.keras` (TensorFlow/Keras 2.15+)
- Input: Multi-channel mel spectrogram
  - Shape: (batch, 128, time, 4)
  - 128 mel bands, variable time frames, 4 stems
- Output: 9 probabilities (one per genre)

## Genres (in order)
1. Blues (BLS)
2. Classical (CLA)
3. Jazz (JZZ)
4. Metal (MTL)
5. Pop (POP)
6. Rap (RAP)
7. Rock (RCK)
8. R&B (R&B)
9. Techno/Electronic (TEC)
