// ============================================
// TYPES: MODEL PREDICTIONS
// ============================================

import { Genre } from './genre';

/**
 * Result of an ML model prediction
 */
export interface PredictionResult {
  probabilities: number[];  // Array of 10 probabilities [0-1] in GENRES order
  genres: Genre[];          // Array of genres in the same order
  timestamp: Date;          // Prediction date and time
  audioFileName: string;    // Name of the analyzed audio file
  segmentStart: number;     // Segment start second (0-duration)
  segmentEnd: number;       // Segment end second (start+10)
}

/**
 * Application state during the prediction process
 */
export type PredictionStatus =
  | 'idle'           // Not started
  | 'uploading'      // Uploading file
  | 'processing'     // Processing on backend/ML
  | 'completed'      // Successfully completed
  | 'error';         // Process error
