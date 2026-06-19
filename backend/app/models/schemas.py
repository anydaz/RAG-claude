from typing import Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    thread_id: str


class CalendarEventTime(BaseModel):
    dateTime: Optional[str] = None
    date: Optional[str] = None
    timeZone: Optional[str] = None


class CalendarEvent(BaseModel):
    id: str
    summary: Optional[str] = None
    description: Optional[str] = None
    start: CalendarEventTime
    end: CalendarEventTime
    htmlLink: Optional[str] = None
    status: Optional[str] = None


class CalendarEventsResponse(BaseModel):
    events: list[CalendarEvent]


class ChatResponse(BaseModel):
    response: str


class IngestResponse(BaseModel):
    message: str
    documents_loaded: int
