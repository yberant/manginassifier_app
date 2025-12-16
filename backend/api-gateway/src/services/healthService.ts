// ============================================
// HEALTH CHECK SERVICE
// ============================================

import axios from 'axios';

const AUDIO_SERVICE_URL = process.env.AUDIO_SERVICE_URL || 'http://localhost:5001';
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5002';

interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

interface MicroservicesHealth {
  audioService: ServiceHealth;
  mlService: ServiceHealth;
}

/**
 * Checks health of all microservices
 */
export const checkMicroservicesHealth = async (): Promise<MicroservicesHealth> => {
  const results = await Promise.allSettled([
    checkServiceHealth(`${AUDIO_SERVICE_URL}/health`),
    checkServiceHealth(`${ML_SERVICE_URL}/health`)
  ]);

  return {
    audioService: results[0].status === 'fulfilled'
      ? results[0].value
      : { status: 'unhealthy', error: 'Failed to connect' },
    mlService: results[1].status === 'fulfilled'
      ? results[1].value
      : { status: 'unhealthy', error: 'Failed to connect' }
  };
};

/**
 * Checks health of a single service
 */
const checkServiceHealth = async (url: string): Promise<ServiceHealth> => {
  const startTime = Date.now();

  try {
    const response = await axios.get(url, { timeout: 5000 });
    const responseTime = Date.now() - startTime;

    if (response.status === 200) {
      return { status: 'healthy', responseTime };
    }

    return { status: 'unhealthy', error: `Unexpected status: ${response.status}` };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message || 'Connection failed'
    };
  }
};
