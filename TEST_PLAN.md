# Test Plan — RAG-Powered Professional Chatbot

## 1. Overview

The application is a RAG-powered professional chatbot that answers questions about a job candidate's background. The system ingests PDF/DOCX documents into a ChromaDB vector store, retrieves relevant chunks using semantic search, and generates answers via Claude (claude-sonnet-4-6). A guardrail layer blocks off-topic queries before any retrieval or generation occurs.

**Stack under test:**

| Layer | Technology |
|---|---|
| Backend API | FastAPI |
| Agent / Workflow | LangGraph StateGraph |
| Vector store | ChromaDB + SentenceTransformer embeddings |
| LLM | Anthropic Claude claude-sonnet-4-6 |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |

**What is being tested:**

- Correctness of document chunking logic (size and overlap)
- Guardrail keyword detection (in-scope vs out-of-scope classification)
- Vector repository CRUD operations (add, query, count)
- API endpoint contract (request/response shapes, status codes, validation)
- Frontend component rendering and interaction behaviour

---

## 2. Backend Unit Tests

### 2.1 `ingestion_service.py`

| Function | Cases |
|---|---|
| `chunk_documents()` | Basic: produces chunks whose text length does not exceed `chunk_size` (1000) |
| | Overlap: consecutive chunk starts differ by `chunk_size - chunk_overlap` (800) |
| | Empty input list → returns `[]` |
| | Single document shorter than chunk_size → produces exactly one chunk |
| `load_documents()` | Non-existent path raises `FileNotFoundError` (OS-level) |
| | Empty directory → returns `[]` |
| | PDF file → parses pages and returns dicts with `text`, `source`, `type` |
| | DOCX file → parses and returns dicts with correct fields |

### 2.2 `chat_agent.py` — guardrail node

The `_guardrail_node` is a method on `ChatAgent`, but its logic only uses the `query` field of the state dict and the `OUT_OF_SCOPE_KEYWORDS` list. Tests call it by constructing a minimal `ChatAgent` with a mocked `RAGService` and invoking `_guardrail_node` directly.

| Case | Input | Expected `is_in_scope` |
|---|---|---|
| Work-experience question | "Tell me about your work experience" | `True` |
| Skills question | "What programming languages do you know?" | `True` |
| Projects question | "What projects have you worked on?" | `True` |
| Politics | "What do you think about the election?" | `False` |
| Recipe | "How do I make pasta?" | `False` |
| Personal life | "What's your favorite movie?" | `False` |

### 2.3 `vector_repository.py` — `VectorRepository`

Tests use a temp ChromaDB path (`tmp_path` pytest fixture + `monkeypatch`) to avoid polluting the real store and to allow parallel test runs.

| Method | Case |
|---|---|
| `count()` | Fresh collection → returns `0` |
| `add_documents()` + `count()` | After adding N documents → count returns N |
| `add_documents()` + `query()` | Added document text is returned as a query result for a semantically similar query |

---

## 3. Backend Integration Tests

Endpoint base path: `http://testserver` via FastAPI `TestClient`. `ChatService.__init__` and `ChatService.chat` are mocked to eliminate ChromaDB initialisation and LLM calls.

| Endpoint | Method | Case | Expected Status | Expected Body |
|---|---|---|---|---|
| `/health` | GET | Normal | 200 | `{"status": "ok"}` |
| `/chat` | POST | Valid in-scope message | 200 | JSON with `response` key |
| `/chat` | POST | Out-of-scope message (mocked decline) | 200 | `response` contains polite decline text |
| `/chat` | POST | Missing `message` field | 422 | FastAPI validation error |
| `/ingest` | POST | Normal (mocked) | 200 | JSON with `message` and `documents_loaded` keys |

---

## 4. Frontend Component Tests

Tests use `@testing-library/react` with `jest` + `jsdom`.

### 4.1 `ChatInput`

| Test | Description |
|---|---|
| `renders send button` | Send button is present in the DOM |
| `send button disabled when empty` | Empty textarea → button has `disabled` attribute |
| `send button enabled when input provided` | Typed text → button is enabled |
| `calls onSend with correct message` | Type text + press Enter → `onSend` called with trimmed text |
| `clears input after send` | After sending, textarea value is empty |
| `shift+enter does not submit` | Shift+Enter → `onSend` is NOT called |
| `disabled prop disables button` | `disabled=true` prop → button has `disabled` attribute |

### 4.2 `ChatMessage`

| Test | Description |
|---|---|
| `renders user message on right` | User message wrapper has `items-end` class |
| `renders assistant message on left` | Assistant message wrapper has `items-start` class |
| `renders message content` | Message text appears in the DOM |
| `renders timestamp` | A formatted time string is present |

### 4.3 `LoadingIndicator`

| Test | Description |
|---|---|
| `renders three dots` | Three `span` elements with `animate-bounce` class are in the DOM |

### 4.4 `ThemeToggle`

| Test | Description |
|---|---|
| `renders toggle button` | A button element is present |
| `toggles dark class on html element` | Clicking button removes `dark` from `document.documentElement` (starting dark); clicking again re-adds it |

---

## 5. End-to-End Test Scenarios

These are described as manual / Playwright scenarios (not automated in this plan iteration).

### Scenario 1 — Happy path: professional question
1. Open `http://localhost:3000`
2. Type "Tell me about your work experience" and press Enter
3. **Expected:** Loading indicator appears, then an assistant message with relevant experience details appears.

### Scenario 2 — Out-of-scope question
1. Type "What do you think about the election?"
2. **Expected:** Assistant responds with a polite decline referencing professional topics only.

### Scenario 3 — Error resilience
1. Stop the backend server.
2. Type any message and send.
3. **Expected:** An error message appears in the chat bubble without a crash.

### Scenario 4 — Multi-turn conversation
1. Ask "What is your educational background?"
2. Follow up with "What skills did you use in your last role?"
3. **Expected:** Both answers appear and the chat scrolls to the bottom after each response.

### Scenario 5 — Theme toggle
1. Click the theme toggle.
2. **Expected:** The page switches from dark to light mode; clicking again restores dark mode.

---

## 6. Guardrail Tests

### In-scope queries (should pass through to retrieval + generation)

- "Tell me about your work experience"
- "What programming languages do you know?"
- "What projects have you worked on?"
- "Can you describe your most recent role?"
- "What is your educational background?"
- "Do you have experience with cloud platforms?"

### Out-of-scope queries (should be blocked with polite decline)

| Query | Triggering keyword |
|---|---|
| "What do you think about the election?" | `election` |
| "How do I make pasta?" | `recipe` / `cooking` |
| "What's your favorite movie?" | `movie` |
| "Tell me about your personal life" | `personal life` |
| "What are the latest sports scores?" | `sports score` |
| "What do you think about the current president?" | `president` |
| "Who is the most popular celebrity right now?" | `celebrity` |
| "What music do you listen to?" | `music` |
