"""
Audio Processing Logic
Separates audio into stems and converts to mel spectrograms
Based on model_generation/services/formatter.py
"""

import librosa
import numpy as np
import os
from spleeter.separator import Separator
from pathlib import Path
import tempfile
import shutil


class AudioProcessor:
    """
    Handles audio file processing: stem separation and spectrogram conversion
    Reuses logic from model_generation/services/formatter.py
    """

    def __init__(self):
        # Audio processing parameters (same as training)
        self.sample_rate = int(os.getenv("SAMPLE_RATE", 22050))
        self.n_mels = int(os.getenv("N_MELS", 128))
        self.hop_length = int(os.getenv("HOP_LENGTH", 512))
        self.n_fft = int(os.getenv("N_FFT", 2048))

        # Stem names (must match Spleeter output and training order)
        self.STEMS = ['vocals', 'drums', 'bass', 'other']

        # Initialize Spleeter for 4-stem separation
        print("[AudioProcessor] Initializing Spleeter (4stems)...")
        self.separator = Separator('spleeter:4stems')

        print(f"[AudioProcessor] Initialized with:")
        print(f"  Sample Rate: {self.sample_rate}")
        print(f"  N Mels: {self.n_mels}")
        print(f"  Hop Length: {self.hop_length}")
        print(f"  N FFT: {self.n_fft}")
        print(f"  Stems: {self.STEMS}")

    def _audio_to_spectrogram(self, audio: np.ndarray, sr: int = None) -> np.ndarray:
        """
        Convert audio array to mel spectrogram
        Based on FormatterService._audio_to_spectrogram()

        Args:
            audio: Audio time series
            sr: Sample rate (uses self.sample_rate if None)

        Returns:
            Log mel spectrogram in dB scale
        """
        if sr is None:
            sr = self.sample_rate

        # Create mel spectrogram
        mel_spectrogram = librosa.feature.melspectrogram(
            y=audio,
            sr=sr,
            n_fft=self.n_fft,
            hop_length=self.hop_length,
            n_mels=self.n_mels
        )

        # Convert to dB scale
        log_mel_spectrogram = librosa.power_to_db(mel_spectrogram, ref=np.max)

        return log_mel_spectrogram

    def _adjust_spectrogram_length(self, spec: np.ndarray, target_frames: int = 862) -> np.ndarray:
        """
        Adjust spectrogram to target length by padding or cropping

        Args:
            spec: Spectrogram with shape (128, time)
            target_frames: Target number of time frames (default 862)

        Returns:
            Adjusted spectrogram with shape (128, target_frames)
        """
        current_frames = spec.shape[1]

        if current_frames == target_frames:
            return spec
        elif current_frames < target_frames:
            # Pad with -80.0 (silence in dB scale)
            pad_amount = target_frames - current_frames
            padded = np.pad(spec, ((0, 0), (0, pad_amount)), mode='constant', constant_values=-80.0)
            print(f"[AudioProcessor] Padded from {current_frames} to {target_frames} frames")
            return padded
        else:
            # Crop if longer
            cropped = spec[:, :target_frames]
            print(f"[AudioProcessor] Cropped from {current_frames} to {target_frames} frames")
            return cropped

    def create_multi_channel_spectrogram(self, stems_dir: Path) -> list:
        """
        Create spectrograms from separated stems
        Based on FormatterService.create_multi_channel_spectrogram()

        Args:
            stems_dir: Directory containing separated stem WAV files

        Returns:
            List of 4 spectrograms, each with shape (128, 862, 1)
            - [0] vocals
            - [1] drums
            - [2] bass
            - [3] other
        """
        spectrograms = []

        for stem in self.STEMS:
            stem_path = stems_dir / f"{stem}.wav"

            if not stem_path.exists():
                raise FileNotFoundError(f"Stem file not found: {stem_path}")

            # Load stem audio (sr=None preserves original sample rate from Spleeter)
            audio, sr = librosa.load(str(stem_path), sr=None)

            # Convert to spectrogram (128, time)
            spectrogram = self._audio_to_spectrogram(audio, sr=sr)

            # Adjust to exactly 862 frames (crop or pad as needed)
            spectrogram = self._adjust_spectrogram_length(spectrogram, target_frames=862)

            # Add channel dimension: (128, 862) -> (128, 862, 1)
            spectrogram = spectrogram[..., np.newaxis]

            spectrograms.append(spectrogram)

        return spectrograms

    def process(self, audio_path: str) -> list:
        """
        Complete audio processing pipeline:
        1. Separate audio into stems using Spleeter
        2. Create mel spectrogram for each stem
        3. Return as list of 4 separate spectrograms

        Args:
            audio_path: Path to audio file

        Returns:
            List of 4 spectrograms, each with shape (128, 862, 1)
            - [0] vocals
            - [1] drums
            - [2] bass
            - [3] other
        """
        print(f"[AudioProcessor] Processing: {audio_path}")

        # Create temporary directory for stems
        temp_dir = tempfile.mkdtemp()

        try:
            # Step 1: Separate audio into stems using Spleeter
            print("[AudioProcessor] Separating stems with Spleeter...")
            self.separator.separate_to_file(audio_path, temp_dir)

            # Spleeter creates a subdirectory named after the audio file
            audio_filename = Path(audio_path).stem
            stems_dir = Path(temp_dir) / audio_filename

            # Step 2: Create spectrograms for each stem
            print("[AudioProcessor] Creating spectrograms for each stem...")
            spectrograms = self.create_multi_channel_spectrogram(stems_dir)

            print(f"[AudioProcessor] ✅ Created {len(spectrograms)} spectrograms")
            for i, spec in enumerate(spectrograms):
                print(f"  Stem {i} ({self.STEMS[i]}): {spec.shape}")

            return spectrograms

        finally:
            # Clean up temporary directory
            shutil.rmtree(temp_dir, ignore_errors=True)
