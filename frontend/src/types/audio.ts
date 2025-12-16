// ============================================
// TYPES: AUDIO FILES
// ============================================

/**
 * Information about an audio file uploaded by the user
 */
export interface AudioFile {
  file: File;               // Browser File object
  duration: number;         // Total duration in seconds
  url: string;              // Temporary URL for playback (blob URL)
}
