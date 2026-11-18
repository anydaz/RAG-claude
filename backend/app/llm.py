import os
from typing import List, Optional

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEFAULT_MODEL = "deepseek-v4-pro"


def build_llm(max_tokens: int = 1024) -> ChatOpenAI:
    return ChatOpenAI(
        model=os.getenv("DEEPSEEK_MODEL", DEFAULT_MODEL),
        base_url=DEEPSEEK_BASE_URL,
        api_key=os.getenv("DEEPSEEK_API_KEY"),
        max_tokens=max_tokens,
    )


def to_lc_messages(messages: List[dict], system: Optional[str] = None) -> List[BaseMessage]:
    lc_messages: List[BaseMessage] = [SystemMessage(content=system)] if system else []
    for m in messages:
        cls = HumanMessage if m["role"] == "user" else AIMessage
        lc_messages.append(cls(content=m["content"]))
    return lc_messages
