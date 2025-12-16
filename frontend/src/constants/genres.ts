// ============================================
// GENRE CONSTANTS AND UTILITIES
// ============================================
// This file contains genre constant data
// and helper functions to work with them

import { Genre, GenreProbability } from '../types';

/**
 * Array of the 9 music genres that the model can predict.
 *
 * IMPORTANT: The order of this array MUST match exactly
 * the order in which the model returns probabilities.
 *
 * Color choices:
 * - Blues: Navy blue (#1e3a8a)
 * - Classical: Indigo (#4f46e5)
 * - Jazz: Gold/Yellow (#eab308)
 * - Metal: Dark gray (#374151)
 * - Pop: Fuchsia (#d946ef)
 * - Rap: Orange (#f97316)
 * - Rock: Red (#dc2626)
 * - R&B: Purple (#7c3aed)
 * - Techno/Electronic: Green (#16a34a)
 */
export const GENRES: Genre[] = [
  { code: "BLS", name: "Blues", color: "#1e3a8a" },
  { code: "CLA", name: "Classical", color: "#4f46e5" },
  { code: "JZZ", name: "Jazz", color: "#eab308" },
  { code: "MTL", name: "Metal", color: "#374151" },
  { code: "POP", name: "Pop", color: "#d946ef" },
  { code: "RAP", name: "Rap", color: "#f97316" },
  { code: "RCK", name: "Rock", color: "#dc2626" },
  { code: "R&B", name: "R&B", color: "#7c3aed" },
  { code: "TEC", name: "Techno/Electrónica", color: "#16a34a" },
];

/**
 * Gets the 3 genres with highest probability
 *
 * @param probabilities - Array of 9 probabilities [0-1]
 * @returns Array of 3 objects {genre, probability} sorted from highest to lowest
 *
 * Example:
 * ```typescript
 * const probs = [0.1, 0.05, 0.3, 0.05, 0.2, 0.1, 0.05, 0.15, 0.0];
 * const top3 = getTop3Genres(probs);
 * // Returns: [
 * //   { genre: GENRES[2] (Jazz), probability: 0.3 },
 * //   { genre: GENRES[4] (Pop), probability: 0.2 },
 * //   { genre: GENRES[6] (Rock), probability: 0.15 }
 * // ]
 * ```
 */
export const getTop3Genres = (probabilities: number[]): GenreProbability[] => {
  // Validation: must have exactly 9 probabilities
  if (probabilities.length !== GENRES.length) {
    console.error(`Expected ${GENRES.length} probabilities, but received ${probabilities.length}`);
    return [];
  }

  return probabilities
    .map((prob, index) => ({
      genre: GENRES[index],
      probability: prob
    }))
    .sort((a, b) => b.probability - a.probability) // Sort from highest to lowest
    .slice(0, 3); // Take only the first 3
};

/**
 * Formats a probability as a percentage
 *
 * @param probability - Number between 0 and 1
 * @param decimals - Number of decimals to show (default: 1)
 * @returns Formatted string (e.g. "45.3%")
 */
export const formatPercentage = (probability: number, decimals: number = 1): string => {
  return `${(probability * 100).toFixed(decimals)}%`;
};

/**
 * Gets a genre by its code
 *
 * @param code - Genre code (e.g. "BLS", "POP")
 * @returns The corresponding genre or undefined if not found
 */
export const getGenreByCode = (code: string): Genre | undefined => {
  return GENRES.find(genre => genre.code === code);
};
