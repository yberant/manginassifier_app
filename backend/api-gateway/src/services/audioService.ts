// ============================================
// AUDIO SERVICE CLIENT
// ============================================
// Communicates with the Audio Processing microservice

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const AUDIO_SERVICE_URL = process.env.AUDIO_SERVICE_URL || 'http://localhost:5001';
const TIMEOUT = parseInt(process.env.AUDIO_SERVICE_TIMEOUT || '120000'); // 2 minutes for Spleeter processing

/**
 * Sends audio file to Audio Processing Service
 * Returns preprocessed data (spectrogram) ready for ML model
 */
export const processAudioFile = async (audioFilePath: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioFilePath));

    const response = await axios.post(
      `${AUDIO_SERVICE_URL}/process`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: TIMEOUT,
      }
    );

    return response.data.preprocessedData;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Audio Processing Service is not available');
    }

    throw new Error(
      `Audio processing failed: ${error.response?.data?.error || error.message}`
    );
  }
};
