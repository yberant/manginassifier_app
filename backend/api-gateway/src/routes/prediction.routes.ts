// ============================================
// PREDICTION ROUTES
// ============================================

import { Router } from 'express';
import { upload } from '../middleware/upload';
import { predictGenre } from '../controllers/prediction.controller';

const router = Router();

/**
 * POST /api/predict
 * Handles audio file upload and genre prediction
 *
 * Request:
 *   - multipart/form-data
 *   - audio: File (audio segment)
 *   - fileName: string
 *   - segmentStart: number
 *   - segmentEnd: number
 *
 * Response:
 *   - probabilities: number[] (10 genre probabilities)
 */
router.post('/predict', upload.single('audio'), predictGenre);

export { router as predictionRouter };
