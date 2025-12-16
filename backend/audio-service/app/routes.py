"""
Audio Service Routes
Defines all API endpoints for the audio processing service using OOP approach
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
import os

from .models import ProcessResponse
from .processor import AudioProcessor


class AudioProcessingRouter:
    """Router class that encapsulates audio processor using OOP"""

    def __init__(self, processor: AudioProcessor):
        """
        Initialize router with audio processor dependency

        Args:
            processor: AudioProcessor instance for audio processing
        """
        self.processor = processor
        self.router = APIRouter()
        self._setup_routes()

    def _setup_routes(self):
        """Define all routes for the audio service"""

        @self.router.get("/health")
        async def health_check():
            """Health check endpoint"""
            return {
                "status": "healthy",
                "service": "audio-service",
                "version": "1.0.0"
            }

        @self.router.post("/process", response_model=ProcessResponse)
        async def process_audio(audio: UploadFile = File(...)):
            """
            Process audio file and return preprocessed data

            Args:
                audio: Audio file (WAV, MP3)

            Returns:
                ProcessResponse with preprocessed data (spectrogram)
            """
            temp_path = None
            try:
                # Save uploaded file temporarily
                temp_path = f"tmp_{audio.filename}"

                with open(temp_path, "wb") as buffer:
                    content = await audio.read()
                    buffer.write(content)

                # Process audio using the injected processor
                preprocessed_data = self.processor.process(temp_path)

                # Clean up temp file
                os.remove(temp_path)

                # Convert list of numpy arrays to list of lists
                preprocessed_data_list = [spec.tolist() for spec in preprocessed_data]

                return ProcessResponse(
                    preprocessedData=preprocessed_data_list,
                    message="Audio processed successfully"
                )

            except Exception as e:
                # Clean up on error
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)

                raise HTTPException(
                    status_code=500,
                    detail=f"Error processing audio: {str(e)}"
                )
