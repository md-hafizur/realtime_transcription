import base64
import numpy as np
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class AudioProcessor:
    """
    Utility class for audio processing
    Handles format conversion, validation, etc.
    """
    
    @staticmethod
    def base64_to_pcm(base64_data: str) -> bytes:
        """
        Convert base64 encoded audio to PCM bytes
        
        Args:
            base64_data: Base64 encoded audio string
        
        Returns:
            Raw PCM bytes
        """
        try:
            audio_bytes = base64.b64decode(base64_data)
            return audio_bytes
        except Exception as e:
            logger.error(f"Error decoding base64 audio: {e}")
            raise ValueError("Invalid base64 audio data")
    
    @staticmethod
    def validate_audio_format(
        audio_data: bytes, 
        expected_sample_rate: int = 16000,
        expected_channels: int = 1
    ) -> bool:
        """
        Validate audio format (basic check)
        
        Args:
            audio_data: Raw audio bytes
            expected_sample_rate: Expected sample rate
            expected_channels: Expected number of channels
        
        Returns:
            True if valid, False otherwise
        """
        # Basic validation - check if we have data
        if not audio_data or len(audio_data) == 0:
            return False
        
        # Check if length is reasonable (at least 100ms of audio)
        min_bytes = (expected_sample_rate * expected_channels * 2) // 10  # 100ms
        if len(audio_data) < min_bytes:
            logger.warning(f"Audio chunk too small: {len(audio_data)} bytes")
        
        return True
    
    @staticmethod
    def pcm_to_numpy(pcm_data: bytes, dtype=np.int16) -> np.ndarray:
        """
        Convert PCM bytes to numpy array
        
        Args:
            pcm_data: Raw PCM bytes
            dtype: Data type (default int16 for 16-bit PCM)
        
        Returns:
            Numpy array
        """
        return np.frombuffer(pcm_data, dtype=dtype)
    
    @staticmethod
    def calculate_duration(audio_bytes: bytes, sample_rate: int = 16000, channels: int = 1) -> float:
        """
        Calculate audio duration in seconds
        
        Args:
            audio_bytes: Raw audio bytes
            sample_rate: Sample rate in Hz
            channels: Number of audio channels
        
        Returns:
            Duration in seconds
        """
        # 16-bit PCM = 2 bytes per sample
        bytes_per_sample = 2
        total_samples = len(audio_bytes) // (bytes_per_sample * channels)
        duration = total_samples / sample_rate
        return duration
    
    @staticmethod
    def normalize_audio(audio_data: np.ndarray) -> np.ndarray:
        """
        Normalize audio amplitude
        
        Args:
            audio_data: Audio as numpy array
        
        Returns:
            Normalized audio
        """
        if len(audio_data) == 0:
            return audio_data
        
        max_val = np.max(np.abs(audio_data))
        if max_val > 0:
            return (audio_data / max_val * 32767).astype(np.int16)
        return audio_data
    
    @staticmethod
    def detect_silence(audio_data: bytes, threshold: float = 0.01) -> bool:
        """
        Detect if audio chunk is mostly silence
        
        Args:
            audio_data: Raw audio bytes
            threshold: Silence threshold (0-1)
        
        Returns:
            True if silent, False otherwise
        """
        audio_np = AudioProcessor.pcm_to_numpy(audio_data)
        if len(audio_np) == 0:
            return True
        
        # Calculate RMS (root mean square)
        rms = np.sqrt(np.mean(audio_np.astype(float) ** 2))
        max_possible = 32767  # 16-bit max
        
        normalized_rms = rms / max_possible
        return normalized_rms < threshold


audio_processor = AudioProcessor()
