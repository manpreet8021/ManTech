from db import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

class Transcribe(Base):
    __tablename__ = "transcribe"

    transcribe_id = Column(Integer, primary_key=True)
    transcription = Column(Text)
    chunks = Column(Text)
    summary = Column(String(1000), nullable=True)
    video_id = Column(Integer, ForeignKey('video.video_id'))

    video = relationship("Video", back_populates="transcribe")