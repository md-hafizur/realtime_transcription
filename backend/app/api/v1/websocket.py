from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
import json
import logging
from datetime import datetime
from uuid import uuid4
import time

from app.database import SessionLocal
from app.services.transcription import transcription_service
from app.services.audio_processor import audio_processor
from app.crud import session_crud, transcript_crud
from app.schemas.session import SessionCreate

router = APIRouter()
logger = logging.getLogger(__name__)

class TranscriptionSession:
    """Manages a single transcription session"""
    def __init__(self, websocket: WebSocket, db: Session):
        self.websocket = websocket
        self.db = db
        self.session_id = None
        self.recognizer = None
        self.start_time = None
        self.accumulated_text = []
        self.is_active = False

    async def start(self):
        """Initialize transcription session"""
        # Create database session
        session_create = SessionCreate(metadata={"started_at": datetime.utcnow().isoformat()})
        db_session = session_crud.create(self.db, obj_in=session_create)
        self.session_id = db_session.id
        self.start_time = time.time()

        # Create Vosk recognizer
        self.recognizer = transcription_service.create_recognizer()
        self.is_active = True
        logger.info(f"Started transcription session: {self.session_id}")

        # Send session ID to client
        await self.websocket.send_json({
            "type": "session_started",
            "session_id": str(self.session_id)
        })

    async def process_audio(self, audio_data: str):
        """Process incoming audio chunk"""
        if not self.is_active:
            return

        try:
            # Decode base64 audio
            pcm_data = audio_processor.base64_to_pcm(audio_data)

            # Validate audio
            if not audio_processor.validate_audio_format(pcm_data):
                logger.warning("Invalid audio format received")
                return

            # Process with Vosk
            result = transcription_service.process_audio_chunk(self.recognizer, pcm_data)

            if result["type"] == "partial":
                # Send partial result to client
                await self.websocket.send_json({
                    "type": "partial",
                    "text": result["text"]
                })
            elif result["type"] == "final":
                # Accumulate final text
                text = result["text"].strip()
                if text:
                    self.accumulated_text.append(text)
                # Send final chunk to client
                await self.websocket.send_json({
                    "type": "final_chunk",
                    "text": text,
                    "confidence": result.get("confidence")
                })
        except Exception as e:
            logger.error(f"Error processing audio: {e}")
            await self.websocket.send_json({
                "type": "error",
                "message": "Error processing audio"
            })

    async def stop(self):
        """Finalize transcription session"""
        if not self.is_active:
            return

        self.is_active = False
        try:
            # Get final result from Vosk
            final_result = transcription_service.get_final_result(self.recognizer)
            final_text = final_result.get("text", "").strip()

            if final_text:
                self.accumulated_text.append(final_text)

            # Combine all text
            full_transcript = " ".join(self.accumulated_text).strip()

            # Calculate metrics
            duration = time.time() - self.start_time
            word_count = transcription_service.calculate_word_count(full_transcript)
            confidence = transcription_service.calculate_confidence(final_result.get("words", []))

            # Save to database
            if full_transcript:
                # Create transcript
                transcript_crud.create_for_session(
                    self.db,
                    session_id=self.session_id,
                    text=full_transcript,
                    confidence=confidence
                )
                # Update session
                session_crud.update(
                    self.db,
                    db_obj=session_crud.get(self.db, self.session_id),
                    obj_in={
                        "duration_seconds": duration,
                        "word_count": word_count,
                        "status": "completed"
                    }
                )
                logger.info(f"Session {self.session_id} completed: {word_count} words in {duration:.2f}s")

                # Send final result to client
                await self.websocket.send_json({
                    "type": "final",
                    "text": full_transcript,
                    "word_count": word_count,
                    "duration": round(duration, 2),
                    "confidence": confidence
                })
            else:
                # No transcription
                session_crud.update(
                    self.db,
                    db_obj=session_crud.get(self.db, self.session_id),
                    obj_in={
                        "duration_seconds": duration,
                        "word_count": 0,
                        "status": "completed"
                    }
                )
                await self.websocket.send_json({
                    "type": "final",
                    "text": "",
                    "word_count": 0,
                    "duration": round(duration, 2)
                })

        except Exception as e:
            logger.error(f"Error finalizing session: {e}")
            await self.websocket.send_json({
                "type": "error",
                "message": "Error finalizing transcription"
            })

@router.websocket("/transcribe")
async def websocket_transcribe(websocket: WebSocket):
    """
    WebSocket endpoint for real-time transcription
    Protocol:
    Client -> Server:
        {"type": "start"}
        {"type": "audio", "data": "<base64_audio>"}
        {"type": "stop"}
    Server -> Client:
        {"type": "session_started", "session_id": "<uuid>"}
        {"type": "partial", "text": "<partial_text>"}
        {"type": "final_chunk", "text": "<final_chunk_text>"}
        {"type": "final", "text": "<full_transcript>", "word_count": N, "duration": X}
        {"type": "error", "message": "<error_message>"}
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    db = SessionLocal()
    session = None
    try:
        session = TranscriptionSession(websocket, db)
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")

            if msg_type == "start":
                await session.start()
            elif msg_type == "audio":
                audio_data = message.get("data")
                if audio_data:
                    await session.process_audio(audio_data)
            elif msg_type == "stop":
                await session.stop()
                break
            else:
                logger.warning(f"Unknown message type: {msg_type}")
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown message type: {msg_type}"
                })
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
        if session and session.is_active:
            await session.stop()
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass
    finally:
        db.close()
        logger.info("WebSocket connection closed")
