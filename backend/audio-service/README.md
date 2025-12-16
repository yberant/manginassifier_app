# Audio Processing Service

Python FastAPI microservice for audio preprocessing.

## Features
- Receives audio files (WAV, MP3)
- Separates audio into 4 stems using Spleeter:
  - vocals
  - drums
  - bass
  - other
- Converts each stem to mel spectrogram
- Returns multi-channel spectrogram (128, time, 4)

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

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Run service:
```bash
python main.py
```

## Endpoints

- `GET /health` - Health check
- `POST /process` - Process audio file
  - Request: `multipart/form-data` with audio file
  - Response: `{ preprocessedData: number[128][time][4], message: string }`

## Port
Default: **5001**
