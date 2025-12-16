"""
ML Service Routes
Defines all API endpoints for the ML prediction service using OOP approach
"""

from fastapi import APIRouter, HTTPException

from .models import PredictionRequest, PredictionResponse
from .predictor import GenrePredictor


class PredictionRouter:
    """Router class that encapsulates predictor using OOP"""

    def __init__(self, predictor: GenrePredictor):
        """
        Initialize router with predictor dependency

        Args:
            predictor: GenrePredictor instance with loaded model
        """
        self.predictor = predictor
        self.router = APIRouter()
        self._setup_routes()

    def _setup_routes(self):
        """Define all routes for the ML service"""

        @self.router.get("/health")
        async def health_check():
            """Health check endpoint"""
            return {
                "status": "healthy",
                "service": "ml-service",
                "version": "1.0.0",
                "model_loaded": self.predictor.is_loaded()
            }

        @self.router.post("/predict", response_model=PredictionResponse)
        async def predict_genre(request: PredictionRequest):
            """
            Predict music genre from preprocessed audio data

            Args:
                request: PredictionRequest with preprocessed data

            Returns:
                PredictionResponse with 10 genre probabilities
            """
            try:
                if not self.predictor.is_loaded():
                    raise HTTPException(
                        status_code=503,
                        detail="Model not loaded"
                    )

                # Get predictions
                probabilities = self.predictor.predict(request.data)

                return PredictionResponse(
                    probabilities=probabilities.tolist(),
                    message="Prediction successful"
                )

            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Prediction error: {str(e)}"
                )
