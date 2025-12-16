# API Gateway - Manginassifier

Express + TypeScript API Gateway that orchestrates requests between the frontend and Python microservices.

## Architecture

```
Frontend → API Gateway (this) → Audio Service (Python)
                              → ML Service (Python)
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Run in development:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /health/detailed` - Health check + microservices status

### Prediction
- `POST /api/predict` - Genre prediction
  - Request: `multipart/form-data` with audio file
  - Response: `{ probabilities: number[], processingTime: number }`

## Port
Default: **5000**

## Required Microservices
- Audio Service (port 5001)
- ML Service (port 5002)
