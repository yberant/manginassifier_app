// ============================================
// AUDIO SEGMENT SELECTOR COMPONENT
// ============================================
// Allows users to select a 10-second segment from audio using waveform visualization

import { useEffect, useRef, useState, memo } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js'
import { AudioFile } from '../types'
import './AudioSegmentSelector.css'

interface AudioSegmentSelectorProps {
  audioFile: AudioFile;
  onSegmentSelected: (startTime: number, endTime: number) => void;
  onAnalyze: (segmentBlob: Blob, startTime: number, endTime: number) => void;
}

function AudioSegmentSelector({ audioFile, onSegmentSelected, onAnalyze }: AudioSegmentSelectorProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);

  // Store callbacks in refs to avoid re-initialization
  const onSegmentSelectedRef = useRef(onSegmentSelected);
  const onAnalyzeRef = useRef(onAnalyze);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [segmentStart, setSegmentStart] = useState(0);
  const [segmentEnd, setSegmentEnd] = useState(10);
  const [isReady, setIsReady] = useState(false);

  const SEGMENT_DURATION = 10; // 10 seconds

  // Update refs when callbacks change
  useEffect(() => {
    console.log('🔄 Updating callback refs');
    onSegmentSelectedRef.current = onSegmentSelected;
    onAnalyzeRef.current = onAnalyze;
  }, [onSegmentSelected, onAnalyze]);

  /**
   * Initialize WaveSurfer when component mounts
   */
  useEffect(() => {
    if (!waveformRef.current) return;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgba(255, 107, 53, 0.5)',
      progressColor: '#ff6b35',
      cursorColor: '#333',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 150,
      normalize: true,
      minPxPerSec: 1, // Very low value to fit entire song in view
      fillParent: true,
      hideScrollbar: true,
      interact: true,
      dragToSeek: true,
      autoScroll: false,
      autoCenter: false,
    });

    // Create Regions plugin for segment selection
    const regions = wavesurfer.registerPlugin(RegionsPlugin.create());

    wavesurferRef.current = wavesurfer;
    regionsPluginRef.current = regions;

    // Load audio file
    wavesurfer.load(audioFile.url);

    // Event listeners
    wavesurfer.on('ready', () => {
      setIsReady(true);

      // Create initial region (first 10 seconds)
      const maxEnd = Math.min(SEGMENT_DURATION, audioFile.duration);

      regions.addRegion({
        start: 0,
        end: maxEnd,
        color: 'rgba(255, 107, 53, 0.3)',
        drag: true,
        resize: false,  // Disabled to make dragging easier on long tracks
      });

      setSegmentStart(0);
      setSegmentEnd(maxEnd);
      console.log('🎯 Calling onSegmentSelected from ready event:', { start: 0, end: maxEnd });
      onSegmentSelectedRef.current(0, maxEnd);
    });

    // Handle loading errors
    wavesurfer.on('error', (error) => {
      console.error('❌ WaveSurfer error:', error);
    });

    wavesurfer.on('play', () => {
      setIsPlaying(true);
    });

    wavesurfer.on('pause', () => {
      setIsPlaying(false);
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
    });

    wavesurfer.on('timeupdate', (time) => {
      setCurrentTime(time);
    });

    // Handle region updates
    regions.on('region-updated', (region) => {
      // Ensure region is exactly 10 seconds
      const duration = region.end - region.start;
      if (Math.abs(duration - SEGMENT_DURATION) > 0.1) {
        const newEnd = region.start + SEGMENT_DURATION;
        if (newEnd <= audioFile.duration) {
          region.setOptions({ end: newEnd });
        } else {
          // If would exceed duration, move start back
          const newStart = audioFile.duration - SEGMENT_DURATION;
          region.setOptions({ start: newStart, end: audioFile.duration });
        }
      }

      setSegmentStart(region.start);
      setSegmentEnd(region.end);
      console.log('🎯 Calling onSegmentSelected from region-updated:', { start: region.start, end: region.end });
      onSegmentSelectedRef.current(region.start, region.end);
    });

    // Cleanup
    return () => {
      wavesurfer.destroy();
    };
  }, [audioFile]);

  /**
   * Play/Pause toggle
   */
  const handlePlayPause = async () => {
    if (!wavesurferRef.current) return;

    try {
      if (wavesurferRef.current.isPlaying()) {
        wavesurferRef.current.pause();
      } else {
        await wavesurferRef.current.play();
      }
    } catch (error) {
      console.error('❌ Error playing audio:', error);
    }
  };

  /**
   * Play only the selected segment
   */
  const handlePlaySegment = async () => {
    if (!wavesurferRef.current || !regionsPluginRef.current) return;

    try {
      const regions = regionsPluginRef.current.getRegions();
      if (regions.length > 0) {
        const region = regions[0];
        wavesurferRef.current.setTime(region.start);
        await wavesurferRef.current.play();

        // Stop at region end
        const checkTime = () => {
          if (wavesurferRef.current && wavesurferRef.current.getCurrentTime() >= region.end) {
            wavesurferRef.current.pause();
          } else if (wavesurferRef.current && wavesurferRef.current.isPlaying()) {
            requestAnimationFrame(checkTime);
          }
        };
        requestAnimationFrame(checkTime);
      }
    } catch (error) {
      console.error('Error playing segment:', error);
    }
  };

  /**
   * Extract segment as blob and send for analysis
   */
  const handleAnalyze = async () => {
    console.log('🎵 AudioSegmentSelector.handleAnalyze clicked');

    if (!wavesurferRef.current) {
      console.warn('⚠️ No wavesurfer instance');
      return;
    }

    try {
      // Get audio buffer
      const audioBuffer = wavesurferRef.current.getDecodedData();
      if (!audioBuffer) {
        console.error('❌ No audio data available');
        return;
      }

      console.log('✅ Got audio buffer:', audioBuffer.length, 'samples');

      // Extract segment
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(segmentStart * sampleRate);
      const endSample = Math.floor(segmentEnd * sampleRate);
      const segmentLength = endSample - startSample;

      console.log('📊 Extracting segment:', { startSample, endSample, segmentLength, sampleRate });

      // Create new buffer for segment
      const segmentBuffer = new AudioContext().createBuffer(
        audioBuffer.numberOfChannels,
        segmentLength,
        sampleRate
      );

      console.log('✅ Created segment buffer');

      // Copy data for each channel
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const sourceData = audioBuffer.getChannelData(channel);
        const targetData = segmentBuffer.getChannelData(channel);
        for (let i = 0; i < segmentLength; i++) {
          targetData[i] = sourceData[startSample + i];
        }
      }

      console.log('✅ Copied audio data');

      // Convert to WAV blob
      console.log('🔄 Converting to WAV blob...');
      const blob = await audioBufferToWav(segmentBuffer);
      console.log('✅ Created blob:', blob.size, 'bytes');

      console.log('📤 Calling onAnalyze callback with:', { start: segmentStart, end: segmentEnd });
      onAnalyzeRef.current(blob, segmentStart, segmentEnd);
      console.log('✅ onAnalyze callback completed');

    } catch (error) {
      console.error('❌ Error extracting segment:', error);
    }
  };

  /**
   * Format time as MM:SS
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-segment-selector">
      <div className="waveform-container">
        <div ref={waveformRef} className="waveform"></div>
      </div>

      {isReady && (
        <>
          <div className="segment-info">
            <div className="time-display">
              <span className="label">Selected Segment:</span>
              <span className="time-range">
                {formatTime(segmentStart)} - {formatTime(segmentEnd)}
              </span>
              <span className="duration">({SEGMENT_DURATION}s)</span>
            </div>
          </div>

          <div className="controls">
            <button
              className="control-button"
              onClick={handlePlayPause}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play All'}
            </button>

            <button
              className="control-button secondary"
              onClick={handlePlaySegment}
            >
              🎵 Play Segment
            </button>

            <button
              className="control-button primary"
              onClick={handleAnalyze}
            >
              🔍 Analyze Segment
            </button>
          </div>

          <div className="playback-info">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="separator">/</span>
            <span className="total-time">{formatTime(audioFile.duration)}</span>
          </div>
        </>
      )}

      {!isReady && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading waveform...</p>
        </div>
      )}
    </div>
  );
}

/**
 * Convert AudioBuffer to WAV Blob
 */
async function audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;

  const data = [];
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      const int16 = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
      data.push(int16);
    }
  }

  const dataLength = data.length * bytesPerSample;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    view.setInt16(offset, data[i], true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Memoize component to prevent unnecessary re-renders
export default memo(AudioSegmentSelector, (prevProps, nextProps) => {
  // Only re-render if audioFile URL changes (new file uploaded)
  return prevProps.audioFile.url === nextProps.audioFile.url;
});
