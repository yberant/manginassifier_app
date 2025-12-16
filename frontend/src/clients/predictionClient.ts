// ============================================
// PREDICTION CLIENT - REAL
// ============================================
// HTTP client to communicate with the prediction backend
// This file will be implemented when the backend is ready

import axios from 'axios';
import { PredictionResult } from '../types';
import { GENRES } from '../constants/genres';

// Backend base URL (configure according to environment)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Sends an audio segment to the backend for genre prediction
 *
 * @param audioSegment - Blob of audio segment (10 seconds)
 * @param fileName - Original file name
 * @param segmentStart - Segment start second
 * @param segmentEnd - Segment end second
 * @returns Promise with prediction result
 *
 * @throws Error if the request fails or backend returns error
 */
export const predictGenre = async (
  audioSegment: Blob,
  fileName: string,
  segmentStart: number,
  segmentEnd: number
): Promise<PredictionResult> => {

  try {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('audio', audioSegment, 'segment.wav');
    formData.append('fileName', fileName);
    formData.append('segmentStart', segmentStart.toString());
    formData.append('segmentEnd', segmentEnd.toString());

    // Make POST request to backend
    const response = await axios.post<PredictionAPIResponse>(
      `${API_BASE_URL}/api/predict`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout
      }
    );

    // Transform backend response to internal format
    return {
      probabilities: response.data.probabilities,
      genres: GENRES,
      timestamp: new Date(),
      audioFileName: fileName,
      segmentStart,
      segmentEnd,
    };

  } catch (error) {
    console.error('[predictionClient] Error predicting genre:', error);

    // More specific error handling
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error code
        throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Could not connect to server. Verify that the backend is running.');
      }
    }

    throw new Error('Unexpected error processing prediction');
  }
};

/**
 * Interface defining the backend response structure
 * Adjust according to the actual contract with the backend
 */
interface PredictionAPIResponse {
  probabilities: number[];  // Array of 10 probabilities [0-1]
  message?: string;         // Optional backend message
  processingTime?: number;  // Processing time in ms (optional)
}

/**
 * Health check of the prediction service
 * Useful to verify if the backend is available
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('[predictionClient] Backend unavailable:', error);
    return false;
  }
};
