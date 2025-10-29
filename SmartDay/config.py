"""
프로젝트의 설정을 관리합니다.
환경변수에서 데이터베이스 URL, API 키, 시크릿 키 등을 로드합니다.
"""
import os
from dotenv import load_dotenv

# .env 파일에서 환경변수 로드
load_dotenv()

# 데이터베이스 설정: 환경변수가 없으면 로컬 SQLite로 동작하도록 기본값 제공
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smartday.db")

# JWT 인증 설정
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# 외부 API 키
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")
KAKAO_REDIRECT_URI = os.getenv("KAKAO_REDIRECT_URI")
KAKAO_JAVASCRIPT_KEY = os.getenv("KAKAO_JAVASCRIPT_KEY")
KAKAO_USER_INFO_URL = os.getenv("KAKAO_USER_INFO_URL")
KAKAO_AUTH_TOKEN_URL = os.getenv("KAKAO_AUTH_TOKEN_URL")