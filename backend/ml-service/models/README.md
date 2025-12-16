# Models Directory

This directory contains the trained ML models for genre classification.

## Required Model File

**File name:** `genre_classifier.keras`

**Expected location:** `backend/ml-service/models/genre_classifier.keras`

## Setup Instructions

Copy your trained model to this directory:

```bash
# From the project root, if your model is in model_generation/
cp model_generation/models/genre_classifier_v1.keras backend/ml-service/models/genre_classifier.keras
```

## Model Specifications

- **Input shape:** (batch_size, 128, time, 4)
  - 128: mel frequency bands
  - time: temporal frames (variable)
  - 4: audio stems (vocals, drums, bass, other)

- **Output shape:** (batch_size, 9)
  - 9 probabilities for the following genres:
    1. Blues (BLS)
    2. Classical (CLA)
    3. Jazz (JZZ)
    4. Metal (MTL)
    5. Pop (POP)
    6. Rap (RAP)
    7. Rock (RCK)
    8. R&B (R&B)
    9. Techno/Electronic (TEC)

## Configuration

The model path can be configured in `.env`:

```env
MODEL_PATH=./models/genre_classifier.keras
```
