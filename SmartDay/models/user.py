"""
User 테이블에 대한 SQLAlchemy 모델을 정의합니다.
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base 

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=False)
    # 카카오 로그인 사용자는 비밀번호가 없으므로 NULL을 허용
    hashed_password = Column(String(255), nullable=True) 
    # 카카오 사용자의 고유 ID를 저장할 컬럼을 추가
    kakao_id = Column(String, unique=True, index=True, nullable=True)

    # 기존에 정의된 관계는 그대로 유지
    preference = relationship("Preference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    events = relationship("CalendarEvent", back_populates="user", cascade="all, delete-orphan")
