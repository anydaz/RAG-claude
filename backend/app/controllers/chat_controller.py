import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse, IngestResponse
from app.services.chat_service import ChatService

router = APIRouter(prefix="", tags=["chat"])

_chat_service = ChatService()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    response = _chat_service.chat(request.message)
    return ChatResponse(response=response)


@router.post("/chat/stream")
def chat_stream(request: ChatRequest) -> StreamingResponse:
    def generate():
        for chunk in _chat_service.stream_chat(request.message):
            yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/ingest", response_model=IngestResponse)
def ingest() -> IngestResponse:
    count = _chat_service.ingest()
    return IngestResponse(
        message=f"Ingestion complete. {count} chunks stored.",
        documents_loaded=count,
    )


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}
