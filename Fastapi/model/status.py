from db import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

class VideoStatus(Base):
    __tablename__ = "video_status"
    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("video.id"), unique=True, nullable=False)
    step = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

def get_processing_video_ids(db: Session):
    return db.query(VideoStatus.video_id).filter(VideoStatus.status == "processing")

def start_step(db: Session, video_id: int, step: str) -> VideoStatus:
    status_row = db.query(VideoStatus).filter(VideoStatus.video_id == video_id).one_or_none()
    if status_row is None:
        status_row = VideoStatus(video_id=video_id, step=step, status="processing")
        db.add(status_row)
    else:
        status_row.step = step
        status_row.status = "processing"
    db.commit()
    return status_row

def finish_step(db: Session, status_row: VideoStatus, success: bool):
    status_row.status = "done" if success else "failed"
    db.commit()
