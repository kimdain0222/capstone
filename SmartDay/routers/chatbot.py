"""
챗봇 대시보드 UI 렌더링 및 채팅 API 라우터를 정의합니다.
사용자 메시지에서 날짜/지역을 분석하여 날씨 API를 우선 호출하는 로직이 포함됩니다.
"""
import re
import json
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from services.chatbot_service import Chatbot, system_role, instruction
from services.function_calling import FunctionCalling, tools
from common.model import model
from constants.constants import seoul_keywords, gyeonggi_keywords, global_lat_lon
from utils.date_parser import parse_natural_date
import os

router = APIRouter()
templates = Jinja2Templates(directory="templates")

# 챗봇 및 함수 호출 관리 인스턴스 생성
smartbot = Chatbot(model=model.basic, system_role=system_role, instruction=instruction)
func_calling = FunctionCalling(model=model.basic)

@router.get("/")
async def get_dashboard_page(request: Request):
    """
    로그인 후 보여줄 메인 대시보드 UI 페이지를 렌더링합니다.
    """
    return templates.TemplateResponse("chatbot.html", {"request": request})

@router.post("/chat-api")
async def chat_api(request: Request):
    """
    사용자 메시지를 받아 챗봇 응답을 반환합니다.
    """
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OpenAI API 키가 설정되지 않았습니다.")

    try:
        data = await request.json()
        request_message = data["request_message"]
        
        # 지역 및 날짜 키워드 추출
        location_keywords = list(global_lat_lon.keys()) + seoul_keywords + gyeonggi_keywords
        date_patterns = [r"이번 주말", r"내일", r"모레", r"다음주\s*[월화수목금토일]", r"\d{4}-\d{2}-\d{2}", r"오늘"]
        
        location = next((loc for loc in location_keywords if loc in request_message), None)
        date_text = next((m.group(0) for pat in date_patterns if (m := re.search(pat, request_message))), None)

        response = {} # 응답 변수 초기화

        # 날짜와 지역이 모두 있을 경우 날씨 예보를 직접 호출
        if location and date_text:
            date = parse_natural_date(date_text)
            # 'get_weather_forecast' 함수를 직접 호출
            result = func_calling.available_functions["get_weather_forecast"](location=location, date=date)
            
            weather_str = f"{date} {location}의 날씨는 최고 {result.get('max_temperature')}도, {result.get('weather')}입니다. "
            
            # 날씨 정보와 함께 일정 추천을 요청
            smartbot.add_user_message(request_message)
            response = smartbot.send_request() # OpenAI API 호출
            smartbot.add_response(response)
            
            course_str = smartbot.get_response_content()
            response_message = f"{weather_str}{course_str}"
        else:
            # 날짜/지역이 없으면 일반적인 챗봇 로직을 따름
            smartbot.add_user_message(request_message)
            analyzed, analyzed_dict = func_calling.analyze(request_message, tools)
            
            if analyzed_dict.get("tool_calls"):
                # 함수 호출이 필요하다고 판단되면 실행
                response = func_calling.run(analyzed, analyzed_dict, smartbot.context[:])
                smartbot.add_response(response)
                response_message = smartbot.get_response_content()
            else:
                # 일반 대화로 판단되면 바로 응답을 요청
                response = smartbot.send_request()
                smartbot.add_response(response)
                response_message = smartbot.get_response_content()

        # 토큰 관리 및 컨텍스트 정리
        smartbot.handle_token_limit(response)
        smartbot.clean_context()
        
        return JSONResponse(content={"response_message": response_message})

    except Exception as e:
        print(f"Chat API error: {e}")
        raise HTTPException(status_code=500, detail="챗봇 응답 생성 중 오류가 발생했습니다.")