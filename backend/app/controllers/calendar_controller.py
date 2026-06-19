from typing import Optional
from fastapi import APIRouter, Query
from app.models.schemas import CalendarEvent, CalendarEventsResponse
from app.services.calendar_service import CalendarService

router = APIRouter(prefix="/calendar", tags=["calendar"])

_calendar_service = CalendarService()


@router.get("/events", response_model=CalendarEventsResponse)
def list_events(
    max_results: int = Query(default=10, ge=1, le=100),
    time_min: Optional[str] = Query(default=None, description="ISO-8601 datetime; defaults to now"),
) -> CalendarEventsResponse:
    items = _calendar_service.list_events(max_results=max_results, time_min=time_min)
    events = [CalendarEvent(**item) for item in items]
    return CalendarEventsResponse(events=events)
