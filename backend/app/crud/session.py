from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from uuid import UUID

from app.crud.base import CRUDBase
from app.models.session import Session as SessionModel
from app.schemas.session import SessionCreate, SessionUpdate

class CRUDSession(CRUDBase[SessionModel, SessionCreate, SessionUpdate]):
    """CRUD operations for Session"""

    def get_with_transcripts(self, db: Session, session_id: UUID) -> Optional[SessionModel]:
        """Get session with all transcripts loaded"""
        return (
            db.query(SessionModel)
            .options(joinedload(SessionModel.transcripts))
            .filter(SessionModel.id == session_id)
            .first()
        )

    def get_by_status(self, db: Session, status: str) -> List[SessionModel]:
        """Get sessions by status"""
        return db.query(SessionModel).filter(SessionModel.status == status).all()

    def update_status(self, db: Session, session_id: UUID, status: str) -> Optional[SessionModel]:
        """Update session status"""
        db_obj = self.get(db, session_id)
        if db_obj:
            db_obj.status = status
            db.commit()
            db.refresh(db_obj)
        return db_obj

session_crud = CRUDSession(SessionModel)
