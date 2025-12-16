// ============================================
// HEALTH CHECK ROUTES
// ============================================

import { Router, Request, Response } from 'express';
import { checkMicroservicesHealth } from '../services/healthService';

const router = Router();

/**
 * GET /health
 * Basic health check for API Gateway
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /health/detailed
 * Detailed health check including microservices
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const microservicesHealth = await checkMicroservicesHealth();

    const allHealthy = Object.values(microservicesHealth).every(
      (service: any) => service.status === 'healthy'
    );

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      microservices: microservicesHealth
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      error: 'Failed to check microservices health'
    });
  }
});

export { router as healthRouter };
