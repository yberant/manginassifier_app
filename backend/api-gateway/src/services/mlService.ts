// ============================================
// ML SERVICE CLIENT
// ============================================
// Communicates with the ML Prediction microservice

import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5002';
const TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT || '30000');

/**
 * Sends preprocessed data to ML Service
 * Returns array of 9 genre probabilities [0-1]
 */
export const getPrediction = async (preprocessedData: any): Promise<number[]> => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      { data: preprocessedData },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: TIMEOUT,
      }
    );

    const probabilities = response.data.probabilities;

    // Validate response
    if (!Array.isArray(probabilities) || probabilities.length !== 9) {
      throw new Error('Invalid prediction format: expected 9 probabilities');
    }

    return probabilities;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('ML Prediction Service is not available');
    }

    throw new Error(
      `Prediction failed: ${error.response?.data?.error || error.message}`
    );
  }
};
