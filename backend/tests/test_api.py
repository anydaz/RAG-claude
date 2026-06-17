"""Integration tests for FastAPI endpoints."""
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_client(chat_return: str = "Mocked response.", ingest_return: int = 5):
    """Build a TestClient with ChatService replaced by a mock."""
    mock_service = MagicMock()
    mock_service.chat.return_value = chat_return
    mock_service.ingest.return_value = ingest_return

    with patch("app.controllers.chat_controller.ChatService", return_value=mock_service):
        import importlib
        import app.controllers.chat_controller as ctrl

        importlib.reload(ctrl)

        from app.main import app

        app.router.routes.clear()
        app.include_router(ctrl.router)

        client = TestClient(app, raise_server_exceptions=True)
        return client, mock_service


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------

class TestHealthEndpoint:
    def test_health_check_returns_200(self):
        client, _ = make_client()
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_check_body(self):
        client, _ = make_client()
        response = client.get("/health")
        assert response.json() == {"status": "ok"}


# ---------------------------------------------------------------------------
# POST /chat
# ---------------------------------------------------------------------------

class TestChatEndpoint:
    def test_valid_message_returns_200(self):
        client, _ = make_client()
        response = client.post("/chat", json={"message": "Tell me about your experience"})
        assert response.status_code == 200

    def test_valid_message_returns_response_field(self):
        client, _ = make_client(chat_return="I have 5 years of experience.")
        response = client.post("/chat", json={"message": "Tell me about your experience"})
        data = response.json()
        assert "response" in data

    def test_valid_message_response_content(self):
        client, _ = make_client(chat_return="I have 5 years of experience.")
        response = client.post("/chat", json={"message": "Tell me about your experience"})
        assert response.json()["response"] == "I have 5 years of experience."

    def test_chat_service_chat_called_with_message(self):
        client, mock_service = make_client()
        client.post("/chat", json={"message": "What are your skills?"})
        mock_service.chat.assert_called_once_with("What are your skills?")

    def test_out_of_scope_message_returns_200(self):
        decline = (
            "I'm sorry, that topic is outside the scope of what I can help with. "
            "I'm here to answer questions about professional background, work experience, "
            "technical skills, and career-related topics."
        )
        client, _ = make_client(chat_return=decline)
        response = client.post("/chat", json={"message": "What do you think about the election?"})
        assert response.status_code == 200

    def test_out_of_scope_response_contains_decline(self):
        decline = (
            "I'm sorry, that topic is outside the scope of what I can help with."
        )
        client, _ = make_client(chat_return=decline)
        response = client.post("/chat", json={"message": "What do you think about the election?"})
        assert "scope" in response.json()["response"].lower()

    def test_missing_message_field_returns_422(self):
        client, _ = make_client()
        response = client.post("/chat", json={})
        assert response.status_code == 422

    def test_empty_body_returns_422(self):
        client, _ = make_client()
        response = client.post("/chat", content=b"", headers={"Content-Type": "application/json"})
        assert response.status_code == 422

    def test_wrong_field_name_returns_422(self):
        client, _ = make_client()
        response = client.post("/chat", json={"query": "hello"})
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# POST /ingest
# ---------------------------------------------------------------------------

class TestIngestEndpoint:
    def test_ingest_returns_200(self):
        client, _ = make_client(ingest_return=7)
        response = client.post("/ingest")
        assert response.status_code == 200

    def test_ingest_response_has_message(self):
        client, _ = make_client(ingest_return=7)
        response = client.post("/ingest")
        assert "message" in response.json()

    def test_ingest_response_has_documents_loaded(self):
        client, _ = make_client(ingest_return=7)
        response = client.post("/ingest")
        assert response.json()["documents_loaded"] == 7

    def test_ingest_calls_service_ingest(self):
        client, mock_service = make_client(ingest_return=3)
        client.post("/ingest")
        mock_service.ingest.assert_called_once()
