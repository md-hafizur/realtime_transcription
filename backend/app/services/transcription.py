import json
import os
from typing import Optional, Dict, Any
from vosk import Model, KaldiRecognizer
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class VoskTranscriptionService:
    """
    Vosk-based real-time transcription service
    Handles streaming audio and returns partial/final results
    """
    
    _instance = None
    _model = None
    
    def __new__(cls):
        """Singleton pattern to load model once"""
        if cls._instance is None:
            cls._instance = super(VoskTranscriptionService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize Vosk model"""
        if self._model is None:
            self._load_model()
    
    def _load_model(self):
        """Load Vosk model from disk"""
        model_path = settings.VOSK_MODEL_PATH
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Vosk model not found at {model_path}. "
                "Please download the model using: "
                "wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
            )
        
        logger.info(f"Loading Vosk model from {model_path}")
        self._model = Model(model_path)
        logger.info("Vosk model loaded successfully")
    
    def create_recognizer(self, sample_rate: int = None) -> KaldiRecognizer:
        """
        Create a new recognizer instance for a session
        Each WebSocket connection should have its own recognizer
        """
        if sample_rate is None:
            sample_rate = settings.VOSK_SAMPLE_RATE
        
        recognizer = KaldiRecognizer(self._model, sample_rate)
        recognizer.SetWords(True)  # Enable word-level timestamps
        
        return recognizer
    
    @staticmethod
    def process_audio_chunk(recognizer: KaldiRecognizer, audio_data: bytes) -> Dict[str, Any]:
        """
        Process audio chunk and return result
        
        Args:
            recognizer: KaldiRecognizer instance
            audio_data: Raw audio bytes (PCM 16-bit)
        
        Returns:
            dict with 'type' (partial/final) and 'text'
        """
        if recognizer.AcceptWaveform(audio_data):
            # Final result for this chunk
            result = json.loads(recognizer.Result())
            return {
                "type": "final",
                "text": result.get("text", ""),
                "confidence": result.get("confidence", None),
                "words": result.get("result", [])
            }
        else:
            # Partial result
            partial = json.loads(recognizer.PartialResult())
            return {
                "type": "partial",
                "text": partial.get("partial", "")
            }
    
    @staticmethod
    def get_final_result(recognizer: KaldiRecognizer) -> Dict[str, Any]:
        """
        Get final result when stream ends
        Call this when WebSocket connection closes
        """
        result = json.loads(recognizer.FinalResult())
        return {
            "type": "final",
            "text": result.get("text", ""),
            "confidence": result.get("confidence", None),
            "words": result.get("result", [])
        }
    
    @staticmethod
    def calculate_word_count(text: str) -> int:
        """Calculate word count from transcript text"""
        return len(text.split()) if text else 0
    
    @staticmethod
    def calculate_confidence(words: list) -> Optional[float]:
        """Calculate average confidence from word-level results"""
        if not words:
            return None
        
        confidences = [word.get("conf", 0) for word in words if "conf" in word]
        if not confidences:
            return None
        
        return sum(confidences) / len(confidences)


# Global instance
transcription_service = VoskTranscriptionService()
