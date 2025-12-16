"""
Data models for ML Service
"""

from pydantic import BaseModel
from typing import List, Any


class PredictionRequest(BaseModel):
    """Request model for prediction"""
    # List of 4 spectrograms, each with shape (128, 862, 1)
    # [0] vocals, [1] drums, [2] bass, [3] other
    data: List[List[List[List[float]]]]


class PredictionResponse(BaseModel):
    """Response model for prediction"""
    probabilities: List[float]  # 9 probabilities [0-1]
    message: str
