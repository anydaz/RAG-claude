import os
from typing import List

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langchain_google_community.calendar.toolkit import CalendarToolkit
from langchain_google_community.calendar.utils import build_calendar_service

MODEL = "claude-sonnet-4-6"

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_TOKEN_PATH = os.path.join(_BACKEND_DIR, "token.json")
_CALENDAR_SCOPES = ["https://www.googleapis.com/auth/calendar"]


class CalendarAgent:
    def __init__(self):
        self._llm = None
        self._tool_map: dict = {}

    def _build_llm(self) -> ChatAnthropic:
        creds = None
        if os.path.exists(_TOKEN_PATH):
            creds = Credentials.from_authorized_user_file(_TOKEN_PATH, _CALENDAR_SCOPES)
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())

        api_resource = build_calendar_service(credentials=creds)
        toolkit = CalendarToolkit(api_resource=api_resource)
        tools = toolkit.get_tools()
        self._tool_map = {t.name: t for t in tools}
        return ChatAnthropic(model=MODEL).bind_tools(tools)

    def _get_llm(self) -> ChatAnthropic:
        if self._llm is None:
            self._llm = self._build_llm()
        return self._llm

    def run(self, messages: List[dict]) -> str:
        llm = self._get_llm()

        lc_messages = []
        for m in messages:
            if m["role"] == "user":
                lc_messages.append(HumanMessage(content=m["content"]))
            else:
                lc_messages.append(AIMessage(content=m["content"]))

        while True:
            response = llm.invoke(lc_messages)
            lc_messages.append(response)

            if not response.tool_calls:
                break

            for tc in response.tool_calls:
                tool = self._tool_map[tc["name"]]
                result = tool.invoke(tc["args"])
                lc_messages.append(ToolMessage(content=str(result), tool_call_id=tc["id"]))

        content = response.content
        if isinstance(content, list):
            return next(
                (b["text"] for b in content if isinstance(b, dict) and b.get("type") == "text"),
                "",
            )
        return str(content)
