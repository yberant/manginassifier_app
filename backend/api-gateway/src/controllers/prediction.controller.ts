// ============================================
// PREDICTION CONTROLLER
// ============================================

import { Request, Response, NextFunction } from 'express';
import { processAudioFile } from '../services/audioService';
import { getPrediction } from '../services/mlService';
import fs from 'fs/promises';

/**
 * Handles the complete prediction flow:
 * 1. Receive audio file from frontend
 * 2. Send to Audio Service for preprocessing
 * 3. Send preprocessed data to ML Service for prediction
 * 4. Return probabilities to frontend
 */
export const predictGenre = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();

  try {
    // Validate file upload
    if (!req.file) {
      res.status(400).json({
        error: 'No audio file provided'
      });
      return;
    }

    // Extract metadata
    const { fileName, segmentStart, segmentEnd } = req.body;

    console.log(`[Prediction] Processing: ${fileName} (${segmentStart}s - ${segmentEnd}s)`);

    // Step 1: Send audio to Audio Processing Service
    console.log('[Prediction] Step 1: Sending to Audio Service...');
    const preprocessedData = await processAudioFile(req.file.path);

    // Step 2: Send preprocessed data to ML Service
    console.log('[Prediction] Step 2: Sending to ML Service...');
    const probabilities = await getPrediction(preprocessedData);

    // Step 3: Clean up uploaded file
    await fs.unlink(req.file.path);

    // Step 4: Return response
    const processingTime = Date.now() - startTime;
    console.log(`[Prediction] ✅ Completed in ${processingTime}ms`);

    res.status(200).json({
      probabilities,
      processingTime
    });

  } catch (error: any) {
    // Clean up file if it exists
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    console.error('[Prediction] ❌ Error:', error.message);
    next(error);
  }
};
