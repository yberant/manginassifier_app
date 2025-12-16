// ============================================
// TYPES: MUSIC GENRES
// ============================================

/**
 * Represents a music genre
 */
export interface Genre {
  code: string;      // Short genre code (e.g. "BLS")
  name: string;      // Full name (e.g. "Blues")
  color: string;     // Hex color for visualization (e.g. "#1e3a8a")
}

/**
 * Music genre with its associated probability
 * Useful for displaying the Top 3 predicted genres
 */
export interface GenreProbability {
  genre: Genre;
  probability: number;  // Value between 0 and 1
}
