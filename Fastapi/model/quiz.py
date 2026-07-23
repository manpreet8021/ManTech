from db import Base
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship, Session
from sqlalchemy.sql import func

class Quiz(Base):
    __tablename__ = "quiz"

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("video.id"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    # Columns already exist on the live table (created by the Node side's
    # Sequelize `timestamps: true`) as NOT NULL with no SQL-level default —
    # Sequelize supplies the value itself on every write, so these use
    # SQLAlchemy's `default` (computed here and sent in the INSERT), not
    # `server_default`. Same fix as model/transcribe.py.
    createdAt = Column(DateTime, nullable=False, default=func.now())
    updatedAt = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())

    video = relationship("Video", back_populates="quiz")

def get_next_transcript_for_quiz(db: Session):
    from model.transcribe import Transcribe
    from model.status import get_processing_video_ids

    return (
        db.query(Transcribe)
        .outerjoin(Quiz, Quiz.video_id == Transcribe.video_id)
        .filter(Transcribe.summary.isnot(None), Quiz.id.is_(None))
        .filter(~Transcribe.video_id.in_(get_processing_video_ids(db)))
        .order_by(Transcribe.id.asc())
        .first()
    )
