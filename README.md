# Manginassifier - Music Genre Classification App

This repository contains the source code for web application for classifying music genres using machine learning with multi-channel audio processing.

Claude code AI was used to assist the development of this project.

## Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (included in Docker Desktop)
- At least 8 GB RAM available
- 5 GB free disk space
- In case you want to test the application WITHOUT docker, you should have:
  - node version 20.11.x or higher
  - conda version 25.9.1

## Quick Start

### 1. Add the trained model

**Important:** This repository does NOT include the trained ML model file due to its size.

You need to obtain the trained model file and place it at:

```
backend/ml-service/models/
```

The trained model file can be found in [this drive link](https://drive.google.com/file/d/1tZQA-UTK_W4iBk9xDFZQQ9mkBSRkSNL3/view?usp=drive_link). You should download the file `genre_classifier_v4.keras`.

### 2. Start the application

Before running the application, make sure to have docker installed and running.

To run application on docker containers you can execute:

```bash
docker-compose up -d
```

You can also test the application without docker containers by opening multiple command lines:

- frontend:

```bash
cd "<YOUR DIRECTORY>\frontend"
npm install
npm run dev
```

- Api Gateway:

```bash
cd "<YOUR DIRECTORY>\backend\api-gateway"
npm install
npm run dev
```

- Audio Service:

```bash
cd "<YOUR DIRECTORY>\audio-service"
npm  conda env create -f environment.yml
conda activate audio-service
python main.py
```

- ML Service:

```bash
cd "<YOUR DIRECTORY>\ml-service"
npm  conda env create -f environment.yml
conda activate ml-service
python main.py
```

### 3. Access the application

The endpoints of each service are:

- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:5000/health
- **Audio Service:** http://localhost:5001/health
- **ML Service:** http://localhost:5002/health

In order to test the application, simply go to the frontend endpoint from a web browser. You can attach audio files and select 10 second segments to see the prediction.

**Note:** Spleeter (audio separation library) will automatically download its pretrained models (~100-200 MB) on first use. This will cause the first prediction to take longer than usual (around 40 seconds). This is normal and only happens once.

## Architecture

```
Frontend (React + Vite) :3000
    ↓
API Gateway (Express) :5000
    ↓
┌──────────────┬───────────────┐
Audio Service  │  ML Service
(Spleeter)     │  (TensorFlow)
:5001          │  :5002
```

## Services

| Service       | Port | Description                      |
| ------------- | ---- | -------------------------------- |
| Frontend      | 3000 | React web interface              |
| API Gateway   | 5000 | Request orchestration            |
| Audio Service | 5001 | Audio processing with Spleeter   |
| ML Service    | 5002 | Genre prediction with TensorFlow |

## Genres Supported

1. Blues (BLS)
2. Classical (CLA)
3. Jazz (JZZ)
4. Metal (MTL)
5. Pop (POP)
6. Rap (RAP)
7. Rock (RCK)
8. R&B (R&B)
9. Techno/Electronic (TEC)

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Wavesurfer.js
- **Backend:** Express (TypeScript), FastAPI (Python)
- **ML:** TensorFlow/Keras
- **Audio Processing:** Spleeter, Librosa
- **Infrastructure:** Docker, Docker Compose
