// ============================================
// AUDIO UPLOADER COMPONENT
// ============================================
// Allows users to upload audio files via drag & drop or file selector

import { useRef, useState } from 'react'
import { AudioFile } from '../types'
import './AudioUploader.css'

interface AudioUploaderProps {
  onAudioLoaded: (audioFile: AudioFile) => void;
}

function AudioUploader({ onAudioLoaded }: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supported audio formats
  const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/flac', 'audio/x-flac'];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  /**
   * Validates if the file is a supported audio format
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|flac)$/i)) {
      return 'Unsupported file format. Please upload MP3, WAV, OGG, or FLAC files.';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }

    return null;
  };

  /**
   * Gets audio duration using Web Audio API
   */
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio file'));
      });

      audio.src = url;
    });
  };

  /**
   * Process the uploaded file
   */
  const handleFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setIsLoading(false);
        return;
      }

      // Get audio duration
      const duration = await getAudioDuration(file);

      // Check minimum duration (need at least 10 seconds)
      if (duration < 10) {
        setError('Audio file must be at least 10 seconds long.');
        setIsLoading(false);
        return;
      }

      // Create AudioFile object
      const audioFile: AudioFile = {
        file,
        duration,
        url: URL.createObjectURL(file),
      };

      // Pass to parent component
      onAudioLoaded(audioFile);
      setIsLoading(false);

    } catch (err) {
      console.error('Error processing audio file:', err);
      setError('Failed to process audio file. Please try another file.');
      setIsLoading(false);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  /**
   * Handle drag events
   */
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  /**
   * Open file selector
   */
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="audio-uploader">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.flac"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {isLoading ? (
          <div className="upload-content">
            <div className="spinner"></div>
            <p>Loading audio file...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">🎵</div>
            <h3>Upload Audio File</h3>
            <p className="upload-instructions">
              Drag and drop your music file here, or click to browse
            </p>
            <p className="upload-formats">
              Supported formats: MP3, WAV, OGG, FLAC (max 50MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
}

export default AudioUploader;
