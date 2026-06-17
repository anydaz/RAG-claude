# Professional Assistant API

FastAPI backend for the RAG-powered professional chatbot.

## Setup

1. Install dependencies:
   ```bash
   cd backend && pip install -r requirements.txt
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your `ANTHROPIC_API_KEY`.

3. Add documents (PDF or DOCX) to the `/data` folder at the project root.

4. Run the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. Ingest documents:
   ```bash
   curl -X POST http://localhost:8000/ingest
   ```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/chat` | Send a message, receive a professional response |
| `POST` | `/ingest` | Load and index documents from the data folder |
| `GET` | `/health` | Health check |
