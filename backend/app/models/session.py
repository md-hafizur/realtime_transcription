from sqlalchemy import Column, String, Integer, Float, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

class Session(Base):
    """Transcription session model"""
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Session metadata
    duration_seconds = Column(Float, nullable=True)
    word_count = Column(Integer, default=0)
    status = Column(String(20), default="in_progress")  # in_progress, completed, failed
    
    # Additional metadata (browser info, model version, etc.)
    session_metadata = Column(JSON, default={})

    # Relationship
    transcripts = relationship("Transcript", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Session(id={self.id}, status={self.status}, words={self.word_count})>"
