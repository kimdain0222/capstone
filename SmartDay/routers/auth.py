"""
로그인, 회원가입 등 인증 관련 UI 페이지를 제공하는 라우터입니다.
"""
from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get("/login", tags=["Authentication UI"])
async def get_login_page(request: Request):
    """로그인 UI 페이지를 렌더링합니다."""
    return templates.TemplateResponse("login.html", {"request": request})

@router.get("/signup")
async def get_signup_page(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

@router.get("/main", tags=["Authentication UI"])
async def get_main_page(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})