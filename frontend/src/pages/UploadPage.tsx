// ============================================
// UPLOAD PAGE
// ============================================
// Page for uploading audio file and selecting segment

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AudioFile } from '../types'
import AudioUploader from '../components/AudioUploader'
import AudioSegmentSelector from '../components/AudioSegmentSelector'
import './UploadPage.css'

function UploadPage() {
  const navigate = useNavigate();
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);

  /**
   * Handle when audio file is loaded
   */
  const handleAudioLoaded = useCallback((file: AudioFile) => {
    setAudioFile(file);
  }, []);

  /**
   * Reset to upload a new file
   */
  const handleReset = useCallback(() => {
    // Revoke the blob URL to free memory
    if (audioFile) {
      URL.revokeObjectURL(audioFile.url);
    }
    setAudioFile(null);
  }, [audioFile]);

  /**
   * Handle when segment is selected
   */
  const handleSegmentSelected = useCallback((start: number, end: number) => {
    console.log('📍 handleSegmentSelected called:', { start, end });
  }, []);

  /**
   * Handle analyze button click
   */
  const handleAnalyze = useCallback((segmentBlob: Blob, startTime: number, endTime: number) => {
    console.log('🔍 handleAnalyze called');
    console.log('  audioFile:', audioFile?.file.name);
    console.log('  segment:', { startTime, endTime });
    console.log('  segmentBlob size:', segmentBlob.size);

    if (!audioFile) {
      console.warn('⚠️ Missing audioFile');
      return;
    }

    // Navigate immediately to result page with analysis data
    console.log('🧭 Navigating to /result...');
    navigate('/result', {
      state: {
        segmentBlob,
        fileName: audioFile.file.name,
        startTime,
        endTime
      }
    });
  }, [audioFile, navigate]);

  return (
    <div className="upload-page">
      {!audioFile ? (
        // Step 1: Upload audio file
        <div className="step-container">
          <div className="step-header">
            <h2>Step 1: Upload Audio File</h2>
            <p>Select a music file to analyze its genre</p>
          </div>
          <AudioUploader onAudioLoaded={handleAudioLoaded} />
        </div>
      ) : (
        // Step 2: Audio loaded - show info and segment selector
        <div className="step-container">
          <div className="step-header">
            <h2>Step 2: Select Segment</h2>
            <p>Choose a 10-second segment to analyze</p>
          </div>

          <div className="two-column-layout">
            {/* Left column: Audio metadata */}
            <div className="left-column">
              <div className="audio-info-card">
                <div className="audio-info-header">
                  <h3>✅ Audio Loaded</h3>
                  <button className="reset-button" onClick={handleReset}>
                    Change File
                  </button>
                </div>

                <div className="audio-info-content">
                  <div className="info-item">
                    <span className="info-label">File Name:</span>
                    <span className="info-value">{audioFile.file.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">
                      {Math.floor(audioFile.duration / 60)}:
                      {Math.floor(audioFile.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Size:</span>
                    <span className="info-value">
                      {(audioFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Segment selector */}
            <div className="right-column">
              <AudioSegmentSelector
                audioFile={audioFile}
                onSegmentSelected={handleSegmentSelected}
                onAnalyze={handleAnalyze}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
