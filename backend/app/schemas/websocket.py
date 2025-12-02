from pydantic import BaseModel
from typing import Literal, Optional
from uuid import UUID

class WebSocketMessage(BaseModel):
    """Base WebSocket message schema"""
    type: str

class WSStartMessage(WebSocketMessage):
    """WebSocket start session message"""
    type: Literal["start"]
    session_id: Optional[UUID] = None

class WSAudioMessage(WebSocketMessage):
    """WebSocket audio data message"""
    type: Literal["audio"]
    data: str  # base64 encoded audio

class WSStopMessage(WebSocketMessage):
    """WebSocket stop session message"""
    type: Literal["stop"]

class WSPartialResult(WebSocketMessage):
    """WebSocket partial transcription result"""
    type: Literal["partial"]
    text: str

class WSFinalResult(WebSocketMessage):
    """WebSocket final transcription result"""
    type: Literal["final"]
    text: str
    confidence: Optional[float] = None
    word_count: int
    duration: float

class WSError(WebSocketMessage):
    """WebSocket error message"""
    type: Literal["error"]
    message: str
