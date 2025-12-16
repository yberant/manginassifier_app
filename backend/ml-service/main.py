"""
============================================
ML PREDICTION SERVICE
============================================
FastAPI service for music genre prediction
Loads Keras model and generates predictions
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

from app.predictor import GenrePredictor
from app.routes import PredictionRouter

# Load environment variables
load_dotenv()

app = FastAPI(
    title="ML Prediction Service",
    description="Music genre classification using TensorFlow/Keras",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Only methods used by this service
    allow_headers=["Content-Type", "Accept", "Authorization"],  # Only necessary headers
)

# Initialize predictor
model_path = os.getenv("MODEL_PATH", "./models/genre_classifier_v4.keras")
predictor = GenrePredictor(model_path)

# Initialize router with predictor (Dependency Injection via constructor)
prediction_router = PredictionRouter(predictor)

# Include routes
app.include_router(prediction_router.router)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5002))
    host = os.getenv("HOST", "0.0.0.0")

    print(f"🤖 ML Service starting on {host}:{port}")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True
    )
