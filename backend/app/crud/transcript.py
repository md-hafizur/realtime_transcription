from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID

from app.crud.base import CRUDBase
from app.models.transcript import Transcript as TranscriptModel
from app.schemas.transcript import TranscriptCreate

class CRUDTranscript(CRUDBase[TranscriptModel, TranscriptCreate, dict]):
    """CRUD operations for Transcript"""

    def get_by_session(self, db: Session, session_id: UUID) -> List[TranscriptModel]:
        """Get all transcripts for a session"""
        return (
            db.query(TranscriptModel)
            .filter(TranscriptModel.session_id == session_id)
            .order_by(TranscriptModel.created_at)
            .all()
        )

    def create_for_session(
        self, db: Session, session_id: UUID, text: str, confidence: Optional[float] = None
    ) -> TranscriptModel:
        """Create transcript for a session"""
        db_obj = TranscriptModel(
            session_id=session_id,
            transcript_text=text,
            confidence=confidence
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

transcript_crud = CRUDTranscript(TranscriptModel)
