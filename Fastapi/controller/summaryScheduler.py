import json

from db import SessionLocal
from model.transcribe import get_next_transcript_for_summary
from model.status import start_step, finish_step
from controller.util import summarize_text

def process_pending_summary():
    db = SessionLocal()
    try:
        transcript = get_next_transcript_for_summary(db)
        if transcript is None:
            return

        status_row = start_step(db, transcript.video_id, "summary")
        try:
            existing_progress = (
                json.loads(transcript.summary_chunk_progress)
                if transcript.summary_chunk_progress
                else []
            )

            def save_progress(summaries):
                transcript.summary_chunk_progress = json.dumps(summaries)
                db.commit()

            transcript.summary = summarize_text(
                transcript.translation,
                existing_chunk_progress=existing_progress,
                on_chunk_progress=save_progress,
            )
            transcript.summary_chunk_progress = None
            db.commit()
        except Exception:
            db.rollback()
            finish_step(db, status_row, success=False)
            raise
        else:
            finish_step(db, status_row, success=True)
    finally:
        db.close()
