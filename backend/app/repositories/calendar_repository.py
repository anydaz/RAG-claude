import os
from datetime import datetime
from typing import Optional

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar"]

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TOKEN_PATH = os.path.join(_BACKEND_DIR, "token.json")


class CalendarRepository:
    def __init__(self):
        self._service = None

    def _get_service(self):
        if self._service is None:
            self._service = self._build_service()
        return self._service

    def _build_service(self):
        if not os.path.exists(TOKEN_PATH):
            raise FileNotFoundError(
                f"token.json not found at {TOKEN_PATH}. "
                "Run the OAuth flow to generate it."
            )

        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

        if creds.expired and creds.refresh_token:
            creds.refresh(Request())

        if not creds.valid:
            raise ValueError(
                f"Credentials in {TOKEN_PATH} are invalid or expired with no refresh token."
            )

        return build("calendar", "v3", credentials=creds)

    def list_events(self, max_results: int = 10, time_min: Optional[str] = None) -> list:
        now = datetime.utcnow().isoformat() + "Z"
        result = (
            self._get_service()
            .events()
            .list(
                calendarId="primary",
                timeMin=time_min or now,
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        return result.get("items", [])
