from db import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class Video(Base):
    __tablename__ = "video"

    video_id = Column(Integer, primary_key=True)
    name = Column(String(100))
    url = Column(String(100))

    transcribe = relationship("Transcribe", back_populates="video")