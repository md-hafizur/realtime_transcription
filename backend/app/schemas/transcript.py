from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional

class TranscriptBase(BaseModel):
    """Base transcript schema"""
    transcript_text: str
    confidence: Optional[float] = None

class TranscriptCreate(TranscriptBase):
    """Schema for creating transcript"""
    session_id: UUID

class TranscriptResponse(BaseModel):
    """Schema for transcript response"""
    id: UUID
    session_id: UUID
    transcript_text: str
    confidence: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True
