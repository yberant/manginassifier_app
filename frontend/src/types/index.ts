// ============================================
// BARREL FILE - TYPE RE-EXPORTS
// ============================================
// This file only re-exports types from other files
// to facilitate imports throughout the application
//
// Usage:
// import { Genre, PredictionResult, AudioFile } from '@/types';

// Genre types
export type { Genre, GenreProbability } from './genre';

// Audio types
export type { AudioFile } from './audio';

// Prediction types
export type { PredictionResult, PredictionStatus } from './prediction';
