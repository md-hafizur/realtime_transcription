from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

class Transcript(Base):
    """Transcript model - stores final transcription results"""
    __tablename__ = "transcripts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)

    # Transcript content
    transcript_text = Column(Text, nullable=False)
    confidence = Column(Float, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    session = relationship("Session", back_populates="transcripts")

    def __repr__(self):
        return f"<Transcript(id={self.id}, session_id={self.session_id})>"
