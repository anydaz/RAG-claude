import os
from typing import Generator

from app.repositories.vector_repository import VectorRepository
from app.services.rag_service import RAGService
from app.agents.chat_agent import ChatAgent


class ChatService:
    def __init__(self):
        self._vector_repo = VectorRepository()
        self._rag_service = RAGService(self._vector_repo)
        self._chat_agent = ChatAgent(self._rag_service)

        if self._vector_repo.count() == 0:
            data_path = os.getenv("DATA_PATH", "../data")
            if os.path.isdir(data_path):
                self._rag_service.ingest_from_path(data_path)

    def chat(self, message: str) -> str:
        return self._chat_agent.run(message)

    def stream_chat(self, message: str) -> Generator[str, None, None]:
        return self._chat_agent.stream_run(message)

    def ingest(self) -> int:
        data_path = os.getenv("DATA_PATH", "../data")
        return self._rag_service.ingest_from_path(data_path)
