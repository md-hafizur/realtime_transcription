from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, Dict, Any, List

class SessionBase(BaseModel):
    """Base session schema"""
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, alias="session_metadata")

    class Config:
        from_attributes = True
        populate_by_name = True

class SessionCreate(SessionBase):
    """Schema for creating a new session"""
    pass

class SessionUpdate(BaseModel):
    """Schema for updating session"""
    duration_seconds: Optional[float] = None
    word_count: Optional[int] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(None, alias="session_metadata")

    class Config:
        from_attributes = True
        populate_by_name = True

class TranscriptInSession(BaseModel):
    """Nested transcript schema for session response"""
    id: UUID
    transcript_text: str
    confidence: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

class SessionResponse(BaseModel):
    """Schema for session response"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    duration_seconds: Optional[float]
    word_count: int
    status: str
    metadata: Dict[str, Any] = Field(alias="session_metadata")
    transcripts: List[TranscriptInSession] = []

    class Config:
        from_attributes = True
        populate_by_name = True

class SessionListResponse(BaseModel):
    """Schema for list of sessions"""
    total: int
    sessions: List[SessionResponse]