import json

from db import SessionLocal
from model.transcribe import get_next_transcript_for_translation
from model.status import start_step, finish_step
from controller.util import translate_text

def process_pending_translation():
    db = SessionLocal()
    try:
        transcript = get_next_transcript_for_translation(db)
        if transcript is None:
            return

        status_row = start_step(db, transcript.video_id, "translate")
        try:
            existing_progress = (
                json.loads(transcript.translation_progress)
                if transcript.translation_progress
                else []
            )

            def save_progress(translations):
                transcript.translation_progress = json.dumps(translations)
                db.commit()

            transcript.translation = translate_text(
                transcript.transcription,
                existing_progress=existing_progress,
                on_progress=save_progress,
            )
            transcript.translation_progress = None
            db.commit()
        except Exception:
            db.rollback()
            finish_step(db, status_row, success=False)
            raise
        else:
            finish_step(db, status_row, success=True)
    finally:
        db.close()
