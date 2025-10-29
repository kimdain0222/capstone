from pydantic import BaseModel

class CalendarEventCreate(BaseModel):
    date: str
    title: str # 메모 내용
    start_time: str
    end_time: str

class CalendarEventResponse(BaseModel):
    id: int
    date: str
    title: str
    start_time: str
    end_time: str

    class Config:
        from_attributes = True
