"""
ML Prediction Logic
Loads and runs TensorFlow/Keras model
"""

import tensorflow as tf
import numpy as np
import os


class GenrePredictor:
    """Handles ML model loading and prediction"""

    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None
        self.mean = None
        self.std = None
        self.genres = [
            "Blues", "Classical", "Jazz", "Metal",
            "Pop", "Rap", "Rock", "R&B", "Techno/Electronic"
        ]

        # Try to load model
        self._load_model()

        # Load normalization parameters
        self._load_normalization_params()

    def _load_model(self):
        """Load the Keras model"""
        try:
            if not os.path.exists(self.model_path):
                print(f"⚠️  Model file not found: {self.model_path}")
                print("    Service will run but predictions will fail until model is provided")
                return

            print(f"[GenrePredictor] Loading model from: {self.model_path}")
            self.model = tf.keras.models.load_model(self.model_path)
            print(f"[GenrePredictor] ✅ Model loaded successfully")
            print(f"[GenrePredictor] Model input shape: {self.model.input_shape}")
            print(f"[GenrePredictor] Model output shape: {self.model.output_shape}")

        except Exception as e:
            print(f"[GenrePredictor] ❌ Error loading model: {e}")
            self.model = None

    def _load_normalization_params(self):
        """Load mean and std for normalization"""
        try:
            # Normalization params are in normalization-params/ directory
            base_dir = os.path.dirname(os.path.abspath(__file__))  # app/
            ml_service_dir = os.path.dirname(base_dir)  # ml-service/
            normalization_dir = os.path.join(ml_service_dir, "normalization-params")
            mean_path = os.path.join(normalization_dir, "mean.npy")
            std_path = os.path.join(normalization_dir, "std.npy")

            if not os.path.exists(mean_path) or not os.path.exists(std_path):
                print(f"⚠️  Normalization files not found:")
                print(f"    {mean_path}")
                print(f"    {std_path}")
                print("    Predictions will be made without normalization (may be inaccurate)")
                return

            print(f"[GenrePredictor] Loading normalization parameters...")
            self.mean = np.load(mean_path)
            self.std = np.load(std_path)
            print(f"[GenrePredictor] ✅ Normalization params loaded")
            print(f"[GenrePredictor] Mean shape: {self.mean.shape}")
            print(f"[GenrePredictor] Std shape: {self.std.shape}")

        except Exception as e:
            print(f"[GenrePredictor] ❌ Error loading normalization params: {e}")
            self.mean = None
            self.std = None

    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model is not None

    def predict(self, data: list) -> np.ndarray:
        """
        Generate prediction from preprocessed spectrograms

        Args:
            data: List of 4 preprocessed spectrograms, each with shape (128, 862, 1)
                - [0] vocals
                - [1] drums
                - [2] bass
                - [3] other

        Returns:
            Array of 9 probabilities [0-1]
        """
        if not self.is_loaded():
            raise ValueError("Model not loaded")

        # Validate input
        if len(data) != 4:
            raise ValueError(f"Expected 4 spectrograms (stems), got {len(data)}")

        # Convert each stem to numpy array
        X1 = np.array(data[0], dtype=np.float32)  # vocals
        X2 = np.array(data[1], dtype=np.float32)  # drums
        X3 = np.array(data[2], dtype=np.float32)  # bass
        X4 = np.array(data[3], dtype=np.float32)  # other

        print(f"[GenrePredictor] Input shapes:")
        print(f"  X1 (vocals): {X1.shape}")
        print(f"  X2 (drums):  {X2.shape}")
        print(f"  X3 (bass):   {X3.shape}")
        print(f"  X4 (other):  {X4.shape}")

        # Apply normalization if parameters are loaded
        if self.mean is not None and self.std is not None:
            print(f"[GenrePredictor] Applying normalization (mean/std)...")
            # Mean and std have shape (1, 4, 1, 1) or (1, 4, 128, 1)
            # Access each stem's normalization params: [0, stem_index, ...]
            X1 = (X1 - self.mean[0, 0]) / self.std[0, 0]  # vocals
            X2 = (X2 - self.mean[0, 1]) / self.std[0, 1]  # drums
            X3 = (X3 - self.mean[0, 2]) / self.std[0, 2]  # bass
            X4 = (X4 - self.mean[0, 3]) / self.std[0, 3]  # other
        else:
            print(f"⚠️  [GenrePredictor] Normalization skipped (params not loaded)")

        # Add batch dimension to each: (128, 862, 1) -> (1, 128, 862, 1)
        X1 = np.expand_dims(X1, axis=0)
        X2 = np.expand_dims(X2, axis=0)
        X3 = np.expand_dims(X3, axis=0)
        X4 = np.expand_dims(X4, axis=0)

        print(f"[GenrePredictor] Shapes after adding batch dimension:")
        print(f"  X1: {X1.shape}, X2: {X2.shape}, X3: {X3.shape}, X4: {X4.shape}")

        # Make prediction with 4 separate inputs (each with shape (1, 128, 862, 1))
        predictions = self.model.predict([X1, X2, X3, X4], verbose=0)

        # Get probabilities for first (and only) sample
        probabilities = predictions[0]

        print(f"[GenrePredictor] Predictions: {probabilities}")

        # Validate output
        if len(probabilities) != 9:
            raise ValueError(f"Model returned {len(probabilities)} values, expected 9")

        return probabilities
