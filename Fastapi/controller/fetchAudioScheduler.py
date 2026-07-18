from db import SessionLocal
from model.video import get_next_video_without_audio
from model.status import start_step, finish_step
from controller.util import download_video_audio

def process_pending_download():
    db = SessionLocal()
    try:
        video = get_next_video_without_audio(db)
        if video is None:
            return

        status_row = start_step(db, video.id, "download")
        try:
            audio_path = download_video_audio(video.id, video.url)
            video.audio_path = audio_path
            db.commit()
        except Exception:
            db.rollback()
            finish_step(db, status_row, success=False)
            raise
        else:
            finish_step(db, status_row, success=True)
    finally:
        db.close()
