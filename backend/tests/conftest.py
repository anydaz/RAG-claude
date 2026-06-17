"""Shared pytest fixtures for backend tests."""
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture()
def mock_chat_service():
    """A MagicMock that replaces ChatService for API tests."""
    service = MagicMock()
    service.chat.return_value = "I have 5 years of experience as a software engineer."
    service.ingest.return_value = 10
    return service


@pytest.fixture()
def test_client(mock_chat_service):
    """FastAPI TestClient with ChatService fully mocked out.

    The controller module instantiates ``_chat_service = ChatService()`` at
    import time, so we patch the class *before* the app is imported and then
    force a re-import to pick up the mock.
    """
    with patch(
        "app.controllers.chat_controller.ChatService",
        return_value=mock_chat_service,
    ):
        # Re-import so the module-level ``_chat_service`` uses our mock.
        import importlib
        import app.controllers.chat_controller as ctrl_module

        importlib.reload(ctrl_module)

        from app.main import app

        # Re-register the reloaded router (it was registered once at startup).
        app.router.routes.clear()
        app.include_router(ctrl_module.router)

        client = TestClient(app, raise_server_exceptions=True)
        yield client

        # Restore the original router after the test.
        importlib.reload(ctrl_module)
