from db import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship, Session

class Video(Base):
    __tablename__ = "video"

    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    url = Column(String(100))
    audio_path = Column(String(255), nullable=True)

    transcribe = relationship("Transcribe", back_populates="video")
    quiz = relationship("Quiz", back_populates="video")


def get_next_video_without_audio(db: Session):
    from model.status import get_processing_video_ids

    return (
        db.query(Video)
        .filter(Video.audio_path.is_(None))
        .filter(~Video.id.in_(get_processing_video_ids(db)))
        .order_by(Video.id.asc())
        .first()
    )