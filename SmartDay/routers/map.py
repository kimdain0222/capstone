"""
지도 페이지 렌더링 및 위치 데이터 API 라우터를 정의합니다.
"""
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from typing import List
from schemas.map import Location
from services import map_service
from config import KAKAO_JAVASCRIPT_KEY

router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get("/", response_class=HTMLResponse)
async def get_map_page(request: Request):
    """
    카카오맵 API를 활용한 지도 페이지를 렌더링합니다.
    """
    # 템플릿으로 전달할 데이터(context)에 키를 추가
    context = {
        "request": request,
        "kakao_key": KAKAO_JAVASCRIPT_KEY
    }
    return templates.TemplateResponse("map.html", context)

@router.get("/parks", response_model=List[Location])
async def get_parks_data():
    """
    도시공원 위치 데이터를 JSON으로 반환합니다.
    """
    return map_service.load_parks_data()

@router.get("/restaurants", response_model=List[Location])
async def get_restaurants_data():
    """
    모범음식점 위치 데이터를 JSON으로 반환합니다.
    """
    return map_service.load_restaurants_data()