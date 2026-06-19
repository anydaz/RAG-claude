from typing import Optional

from app.repositories.calendar_repository import CalendarRepository


class CalendarService:
    def __init__(self):
        self._repo = CalendarRepository()

    def list_events(self, max_results: int = 10, time_min: Optional[str] = None) -> list:
        return self._repo.list_events(max_results=max_results, time_min=time_min)
