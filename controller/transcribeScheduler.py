import json

from db import SessionLocal
from model.transcribe import Transcribe, get_next_video_for_transcription
from model.status import start_step, finish_step
from controller.util import transcribe_audio

def process_pending_transcription():
    db = SessionLocal()
    try:
        video = get_next_video_for_transcription(db)
        if video is None:
            return

        status_row = start_step(db, video.video_id, "transcribe")
        try:
            result = transcribe_audio(video.audio_path)

            transcript = Transcribe(
                video_id=video.video_id,
                transcription=result.get("text", ""),
                chunks=json.dumps(result.get("chunks", [])),
            )
            db.add(transcript)
            db.commit()
        except Exception:
            db.rollback()
            finish_step(db, status_row, success=False)
            raise
        else:
            finish_step(db, status_row, success=True)
    finally:
        db.close()
