import json

from db import SessionLocal
from model.quiz import Quiz, get_next_transcript_for_quiz
from model.status import start_step, finish_step
from controller.util import generate_quiz

def process_pending_quiz():
    db = SessionLocal()
    try:
        transcript = get_next_transcript_for_quiz(db)
        if transcript is None:
            return

        status_row = start_step(db, transcript.video_id, "quiz")
        try:
            questions = generate_quiz(transcript.summary)

            for q in questions:
                db.add(Quiz(
                    video_id=transcript.video_id,
                    question=q["question"],
                    options=json.dumps(q["options"]),
                    answer=q["answer"],
                ))
            db.commit()
        except Exception:
            db.rollback()
            finish_step(db, status_row, success=False)
            raise
        else:
            finish_step(db, status_row, success=True)
    finally:
        db.close()
