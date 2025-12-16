# Manginassifier - Progress Tracker

## Project Overview
Music Genre Classification Web Application

**Architecture:** Microservices-based

```
Frontend (React + TS)
    ↓
API Gateway (Express/NestJS)
    ↓
┌─────────────────┬──────────────────┬─────────────────┐
│                 │                  │                 │
Audio Service   ML Service   Storage Service (future)
(Python)        (Python)          (Python)
```

**Tech Stack:**
- **Frontend:** React + TypeScript + Vite
- **API Gateway:** Express or NestJS (Node.js/TypeScript)
- **Microservices:** Python (Flask/FastAPI)
  - Audio Processing Service
  - ML Prediction Service
  - (Future: Storage/History Service)

**9 Music Genres:**
Blues, Classical, Jazz, Metal, Pop, R&B, Rap, Rock, Techno/Electronic

---

## Session History

### Session 1 (Nov 14, 2025)
**Status:** Frontend completed

**Completed:**
- [x] Frontend React app structure
- [x] Pages: Home, Upload, Result, History
- [x] Audio upload and segment selection (10-second clips)
- [x] Results visualization with charts
- [x] TypeScript types and interfaces
- [x] Prediction client ready for backend integration

**Frontend Contract:**
```typescript
// POST /api/predict
Request: FormData {
  audio: Blob (WAV file, 10 seconds),
  fileName: string,
  segmentStart: number,
  segmentEnd: number
}

Response: {
  probabilities: number[] // Array of 9 probabilities [0-1]
}

// GET /health
Response: 200 OK
```

**Genre Order (MUST match model output):**
1. Blues (BLS) 2. Classical (CLA) 3. Jazz (JZZ)
4. Metal (MTL) 5. Pop (POP) 6. Rap (RAP)
7. Rock (RCK) 8. R&B (R&B) 9. Techno/Electronic (TEC)

---

### Session 2 (Nov 15, 2025)
**Status:** Backend architecture completed ✅

**Completed:**
- [x] Chose Express for API Gateway (simpler, faster)
- [x] Created complete microservices architecture
- [x] Implemented all 3 services with full code
- [x] Reused code from model_generation/services/
- [x] Fixed frontend port configuration (3000)
- [x] Created environment.yml for conda setup

**Implementation Details:**

#### 1. API Gateway (Express + TypeScript) ✅
- **Port:** 5000
- **Location:** `backend/api-gateway/`
- **Features:**
  - Routes: `/health`, `/health/detailed`, `/api/predict`
  - CORS middleware configured for frontend (port 3000)
  - File upload handling with Multer (max 10MB)
  - Service clients for audio-service and ml-service
  - Error handling and 404 middleware
  - Axios for HTTP communication with Python services

#### 2. Audio Processing Service (Python + FastAPI) ✅
- **Port:** 5001
- **Location:** `backend/audio-service/`
- **Features:**
  - **Spleeter integration** for 4-stem separation
    - Stems: vocals, drums, bass, other
  - **Mel spectrogram generation** (reused from FormatterService)
    - Parameters: sr=22050, n_mels=128, hop_length=512, n_fft=2048
  - Returns multi-channel array: **(128, time, 4)**
  - Automatic cleanup of temporary files

#### 3. ML Prediction Service (Python + FastAPI) ✅
- **Port:** 5002
- **Location:** `backend/ml-service/`
- **Features:**
  - Loads `.keras` model: `genre_classifier_v1.keras`
  - Accepts multi-channel spectrograms (128, time, 4)
  - Returns **9 genre probabilities** [0-1]
  - Model validation and health checking

**Architecture Flow:**
```
Frontend (React, Port 3000)
    ↓ multipart/form-data
API Gateway (Express, Port 5000)
    ↓ FormData
Audio Service (Python, Port 5001)
    • Spleeter → 4 stems
    • Mel spectrogram per stem
    • Stack → (128, time, 4)
    ↓ JSON with array
ML Service (Python, Port 5002)
    • Load .keras model
    • Predict from multi-channel input
    • Return 9 probabilities
    ↓ JSON response
API Gateway → Frontend
```

**Files Created:**
- `backend/api-gateway/` (15 files)
- `backend/audio-service/` (7 files)
- `backend/ml-service/` (7 files)
- `PROGRESS.md` (this file)

---

## Next Steps

**Installation:**
```bash
# Audio Service
cd backend/audio-service
conda env create -f environment.yml
conda activate audio-service

# ML Service
cd backend/ml-service
conda env create -f environment.yml
conda activate ml-service

# API Gateway
cd backend/api-gateway
npm install
cp .env.example .env
```

**Testing:**
1. Test each service health endpoint
2. Test audio processing with sample file
3. Test prediction with preprocessed data
4. Test full integration frontend → backend

**Future Enhancements:**
1. Docker containerization (Python 3.10 base images)
2. Add authentication/authorization
3. Add request rate limiting
4. Add caching for predictions
5. Add history/storage service
6. Add monitoring and logging

---

### Session 3 (Nov 15, 2025)
**Status:** All microservices running successfully ✅

**Completed:**
- [x] Created conda environments for both Python services
- [x] Resolved Python version compatibility issues
- [x] Determined Python 3.10 as required version
- [x] Removed redundant requirements.txt files
- [x] Fixed NumPy 2.x incompatibility (downgraded to NumPy 1.26.4)
- [x] Fixed Windows multiprocessing issues with Spleeter/TensorFlow
- [x] Implemented lazy loading for AudioProcessor
- [x] Created models directory and copied trained model
- [x] Installed API Gateway dependencies (npm)
- [x] Created .env files for all services
- [x] All three microservices started successfully

**Python Version Resolution:**
- **Initial attempt**: Python 3.13 - Spleeter incompatible
- **Second attempt**: Python 3.11 - Spleeter not available in conda-forge
- **Final solution**: Python 3.10 - All dependencies compatible ✅

**Key Issues Resolved:**
1. **NumPy Compatibility**: Spleeter requires NumPy < 2.0
   - Solution: Updated environment.yml to specify `numpy<2`
   - Conda installed NumPy 1.26.4 successfully

2. **Windows Multiprocessing**: RuntimeError with Spleeter/TensorFlow
   - Solution: Implemented lazy loading for AudioProcessor
   - Processor now initializes on first request, not on module import
   - Set `reload=False` in uvicorn to avoid additional issues

**Important Notes:**
- **Python 3.10 is REQUIRED** for Spleeter compatibility
- **NumPy < 2.0 is REQUIRED** (using 1.26.4)
- Use conda environments (not venv) for both Python services
- Only environment.yml needed (requirements.txt removed)
- AudioProcessor uses lazy loading to avoid Windows multiprocessing issues
- Both conda environments created successfully:
  - `audio-service` (Python 3.10, NumPy 1.26.4)
  - `ml-service` (Python 3.10/3.11)

**Services Status:**
- ✅ ML Service running on port 5002
- ✅ Audio Service running on port 5001
- ✅ API Gateway running on port 5000

**Next Steps:**
1. Test API Gateway health endpoints
2. Test audio processing pipeline
3. Test full integration with frontend
4. Verify end-to-end genre classification

---

## Notes
- Each microservice should be independently deployable
- Use HTTP/REST for service communication (or gRPC for future optimization)
- Frontend expects exactly 9 probabilities in the specific genre order
- Audio segments are 10 seconds long
- **IMPORTANT**: Python 3.10 required for Spleeter compatibility
- Docker images must use Python 3.10 base images
- Model file location: `backend/ml-service/models/genre_classifier.keras`
