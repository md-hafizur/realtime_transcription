from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    """Application settings and configuration"""

    # Application
    APP_NAME: str = "Real-Time Transcription API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/realtime_transcription"
    DATABASE_ECHO: bool = False

    # Vosk Model
    VOSK_MODEL_PATH: str = "/app/models_data/vosk-model-small-en-us-0.15"
    VOSK_SAMPLE_RATE: int = 16000

    # WebSocket
    WS_MESSAGE_QUEUE_SIZE: int = 100
    WS_HEARTBEAT_INTERVAL: int = 30

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://frontend:3000"
    ]

    # Audio Processing
    AUDIO_CHUNK_SIZE: int = 4096
    MAX_AUDIO_DURATION: int = 300  # 5 minutes max

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

settings = get_settings()