"""
CalendarEvent 테이블에 대한 SQLAlchemy 모델을 정의합니다.
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    date = Column(String(10), nullable=False)  # YYYY-MM-DD
    title = Column(String(255), nullable=False) # 메모 내용
    
    # 시작 시간과 종료 시간 필드 추가
    start_time = Column(String(5), nullable=False) # HH:MM 형식
    end_time = Column(String(5), nullable=False)   # HH:MM 형식

    user = relationship("User", back_populates="events")
