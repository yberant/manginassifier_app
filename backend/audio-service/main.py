"""
============================================
AUDIO PROCESSING SERVICE
============================================
FastAPI service for audio preprocessing
Converts audio files to spectrograms for ML model
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

from app.processor import AudioProcessor
from app.routes import AudioProcessingRouter

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Audio Processing Service",
    description="Processes audio files and generates spectrograms for ML prediction",
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

# Global processor instance
audio_processor = None
audio_router = None


@app.on_event("startup")
async def startup_event():
    """Initialize AudioProcessor and download Spleeter models at startup"""
    global audio_processor, audio_router

    print("🎵 Initializing Audio Processor...")
    print("⏳ This may take 1-3 minutes on first run (downloading Spleeter models)...")

    # Initialize processor (this downloads and loads Spleeter models)
    audio_processor = AudioProcessor()

    print("✅ Audio Processor initialized successfully!")

    # Initialize router with processor
    audio_router = AudioProcessingRouter(audio_processor)

    # Include routes
    app.include_router(audio_router.router)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    host = os.getenv("HOST", "0.0.0.0")

    print(f"🎵 Audio Service starting on {host}:{port}")

    # Note: reload=False on Windows to avoid multiprocessing issues with Spleeter
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=False  # Set to False on Windows due to Spleeter/TensorFlow multiprocessing
    )
