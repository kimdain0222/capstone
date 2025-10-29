"""
FastAPI 애플리케이션의 메인 진입점입니다.
라우터를 포함하고, 정적 파일 및 템플릿을 설정합니다.
"""
import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

# 데이터베이스 관련 모듈
from database import engine, Base
# 모든 데이터베이스 모델
from models import user, preference, calendar

# 데이터베이스 테이블 생성
# Base에 연결된 모든 테이블(User, Preference, CalendarEvent 등)을 생성
Base.metadata.create_all(bind=engine)

# 라우터 임포트 
from routers import auth, user, preference, calendar, chatbot, map as map_router

# FastAPI 앱 인스턴스 생성
app = FastAPI()

# CORS 미들웨어 설정 추가
# 웹 브라우저(프론트엔드)가 백엔드 API와 통신할 수 있도록 허용하는 설정
origins = [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # 모든 HTTP 메소드 허용
    allow_headers=["*"], # 모든 HTTP 헤더 허용
)

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

# 라우터 등록
app.include_router(auth.router, tags=["Authentication"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(preference.router, prefix="/preferences", tags=["Preferences"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(map_router.router, prefix="/map", tags=["Map"])
app.include_router(calendar.router, prefix="/calendar", tags=["Calendar"])

@app.get("/", response_class=HTMLResponse, tags=["Root"])
async def read_root(request: Request):
    """
    API 루트 엔드포인트.
    login.html 템플릿을 렌더링하여 반환합니다.
    """
    return templates.TemplateResponse("login.html", {"request": request})
