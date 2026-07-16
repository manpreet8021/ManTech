from db import Base
from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import relationship, Session

class Transcribe(Base):
    __tablename__ = "transcribe"
    transcribe_id = Column(Integer, primary_key=True)
    transcription = Column(Text)
    chunks = Column(Text)
    translation = Column(Text, nullable=True)
    translation_progress = Column(LONGTEXT, nullable=True)
    summary = Column(Text, nullable=True)
    summary_chunk_progress = Column(LONGTEXT, nullable=True)
    video_id = Column(Integer, ForeignKey('video.video_id'))

    video = relationship("Video", back_populates="transcribe")


def get_next_video_for_transcription(db: Session):
    from model.video import Video
    from model.status import get_processing_video_ids

    return (
        db.query(Video)
        .outerjoin(Transcribe, Transcribe.video_id == Video.video_id)
        .filter(Video.audio_path.isnot(None), Transcribe.transcribe_id.is_(None))
        .filter(~Video.video_id.in_(get_processing_video_ids(db)))
        .order_by(Video.video_id.asc())
        .first()
    )


def get_next_transcript_for_translation(db: Session):
    from model.status import get_processing_video_ids

    return (
        db.query(Transcribe)
        .filter(Transcribe.transcription.isnot(None), Transcribe.translation.is_(None))
        .filter(~Transcribe.video_id.in_(get_processing_video_ids(db)))
        .order_by(Transcribe.transcribe_id.asc())
        .first()
    )


def get_next_transcript_for_summary(db: Session):
    from model.status import get_processing_video_ids

    return (
        db.query(Transcribe)
        .filter(Transcribe.translation.isnot(None), Transcribe.summary.is_(None))
        .filter(~Transcribe.video_id.in_(get_processing_video_ids(db)))
        .order_by(Transcribe.transcribe_id.asc())
        .first()
    )