from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.crud import session_crud
from app.schemas.session import SessionResponse, SessionListResponse

router = APIRouter()


@router.get("", response_model=SessionListResponse)
async def get_sessions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve all transcription sessions
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum number of records to return (default: 100)
    
    Returns:
    - List of sessions with metadata
    """
    sessions = session_crud.get_multi(db, skip=skip, limit=limit)
    total = session_crud.count(db)
    
    return SessionListResponse(
        total=total,
        sessions=sessions
    )


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific transcription session with transcript
    
    Path Parameters:
    - session_id: UUID of the session
    
    Returns:
    - Session details with full transcript
    
    Raises:
    - 404: If session not found
    """
    session = session_crud.get_with_transcripts(db, session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found"
        )
    
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Delete a transcription session
    
    Path Parameters:
    - session_id: UUID of the session to delete
    
    Returns:
    - 204 No Content on success
    
    Raises:
    - 404: If session not found
    """
    session = session_crud.get(db, session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found"
        )
    
    session_crud.delete(db, id=session_id)
    return None
