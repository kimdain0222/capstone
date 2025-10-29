"""
일정관리(캘린더, 일정 추가, 일정 목록) UI API 라우터를 정의합니다.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.user import User
from models.calendar import CalendarEvent
from schemas.calendar import CalendarEventCreate, CalendarEventResponse
from utils.auth import verify_token
from sqlalchemy import asc

router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get("/", tags=["Calendar UI"])
async def get_calendar_page(request: Request):
    """Iframe에 들어갈 독립된 캘린더 UI 페이지를 렌더링합니다."""
    return templates.TemplateResponse("calendar.html", {"request": request})

@router.post("/", response_model=CalendarEventResponse, tags=["Calendar API"])
def create_event(event: CalendarEventCreate, token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == token_data.get("sub")).first()
    if not user: raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    
    new_event = CalendarEvent(
        user_id=user.id, 
        date=event.date, 
        title=event.title,
        start_time=event.start_time,
        end_time=event.end_time
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/daily/", response_model=List[CalendarEventResponse], tags=["Calendar API"])
def get_daily_events(date: str, token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == token_data.get("sub")).first()
    if not user: raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    
    return db.query(CalendarEvent).filter(
        CalendarEvent.user_id == user.id, 
        CalendarEvent.date == date
    ).order_by(asc(CalendarEvent.start_time)).all()

@router.delete("/{event_id}", status_code=204, tags=["Calendar API"])
def delete_event(event_id: int, token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == token_data.get("sub")).first()
    if not user: raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id, CalendarEvent.user_id == user.id).first()
    if not event: raise HTTPException(status_code=404, detail="일정을 찾을 수 없거나 삭제 권한이 없습니다.")
    
    db.delete(event)
    db.commit()
    return
