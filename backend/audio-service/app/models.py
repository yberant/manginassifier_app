"""
Data models for Audio Service
"""

from pydantic import BaseModel
from typing import List


class ProcessResponse(BaseModel):
    """Response model for audio processing"""
    # List of 4 spectrograms, each with shape (128, 862, 1)
    # [0] vocals, [1] drums, [2] bass, [3] other
    preprocessedData: List[List[List[List[float]]]]
    message: str
