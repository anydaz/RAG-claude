# Development Guidelines

## Frontend Development Rules

- **Component Organization**: Do not put all code in one file. Split functionality into components and pages.
- **Component Types**:
  - Use functional components and hooks where appropriate
  - Reusable components: place in `components/` folder at root directory
  - Page-specific components: place in the same folder as the page
- **Styling**:
  - Use only TailwindCSS for styling
  - Do not use other CSS frameworks or custom CSS
  - Modify TailwindCSS configuration if needed
- **Linting**: Use the following ESLint rules if possible:
  ```json
  {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-undef": "off",
    "no-unused-vars": "off",
    "no-console": ["error", { "allow": ["error"] }],
    "react/react-in-jsx-scope": "off",
    "react/jsx-key": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    "react/no-children-prop": "error",
    "react/no-danger-with-children": "error",
    "react/no-deprecated": "warn",
    "react/no-direct-mutation-state": "error",
    "react/no-unescaped-entities": "error",
    "react/no-unknown-property": "error",
    "react/prop-types": "off",
    "react/self-closing-comp": "error",
    "prefer-const": "error",
    "no-nested-ternary": "error",
    "complexity": "error",
    "no-else-return": "error",
    "max-params": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "sonarjs/cognitive-complexity": ["error", 15]
  }
  ```
- **Code Quality**: Always apply the simplest and most efficient solution. Avoid overcomplicated code or unnecessary libraries/tools.

## Backend Development Rules

- **Architecture**: Use a controller, service, and repository (CSR) structure.
- **Controller Responsibilities**:
  - Handle incoming requests
  - Parse parameters if needed
  - Call appropriate service
  - Modify output if needed
  - Return response
- **Service Responsibilities**:
  - Contain business logic
  - Call repository if needed
  - Return processed data
- **Repository Responsibilities**:
  - Handle database operations
  - Return data to service

## Backend Structure

### Directory Layout (`backend/app/`)

```
app/
├── main.py                        # FastAPI app, CORS middleware, router registration
├── controllers/
│   └── chat_controller.py         # HTTP routes: POST /chat, POST /ingest, GET /health
├── services/
│   ├── chat_service.py            # Orchestrates RAGService + ChatAgent; auto-ingests on startup
│   ├── rag_service.py             # ingest_from_path(), retrieve() — bridges ingestion and vector store
│   └── ingestion_service.py       # load_documents() (PDF/DOCX), chunk_documents()
├── repositories/
│   └── vector_repository.py       # ChromaDB PersistentClient; add_documents(), query(), count()
├── agents/
│   └── chat_agent.py              # LangGraph StateGraph agent (see flow below)
└── models/
    └── schemas.py                 # Pydantic models: ChatRequest, ChatResponse, IngestResponse
```

### LangGraph Agent Flow (`chat_agent.py`)

```
START
  │
  ▼
guardrail_node   — keyword-based scope check (blocks politics, entertainment, recipes, etc.)
  │
  ├─ out of scope ──► END  (returns polite decline, skips retrieval and generation)
  │
  └─ in scope
        │
        ▼
  retrieval_node  — calls RAGService.retrieve(), populates retrieved_docs in state
        │
        ▼
  generation_node — calls Claude API (claude-sonnet-4-6) with system prompt + context + query
        │
        ▼
       END
```

**AgentState fields:** `query`, `retrieved_docs`, `is_in_scope`, `response`

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | — | Required. Claude API key. |
| `CHROMA_DB_PATH` | `./chroma_db` | Path for ChromaDB persistent storage. |
| `DATA_PATH` | `../data` | Directory containing PDF/DOCX source documents. |

## Frontend Structure

### Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** (configured via `@custom-variant` in `globals.css` — no `tailwind.config.ts`)
- **ESLint 9** flat config (`eslint.config.mjs`)

### Directory Layout (`ui/src/`)

```
src/
├── app/
│   ├── globals.css          # Tailwind import + dark mode variant (@custom-variant dark)
│   ├── layout.tsx           # Root layout: Inter font, dark class default, metadata
│   └── page.tsx             # Main chat page (client component, all chat state lives here)
└── components/
    ├── ChatContainer.tsx    # Scrollable message list; exports Message type; auto-scrolls to bottom
    ├── ChatInput.tsx        # Auto-resizing textarea; Enter to send, Shift+Enter for newline
    ├── ChatMessage.tsx      # Single message bubble — right-aligned (user) / left-aligned (assistant)
    ├── LoadingIndicator.tsx # Three-dot animated typing indicator (Tailwind animate-bounce)
    └── ThemeToggle.tsx      # Toggles .dark class on <html>; sun/moon SVG icons
```

### Data Flow

1. User types in `ChatInput` and submits
2. `page.tsx` `handleSend` appends the user `Message` to state and sets `isLoading = true`
3. `POST http://localhost:8000/chat` is called with `{ message: string }`
4. On success, the assistant response is appended; on failure, an error message is shown in chat
5. `isLoading` is cleared in the `finally` block

### Message Type

```ts
export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
```

### Dark / Light Mode

Dark mode defaults to on (`<html class="dark">`). `ThemeToggle` adds/removes the `dark` class on `document.documentElement`. Tailwind v4 resolves `dark:` utilities via the `@custom-variant dark (&:where(.dark, .dark *))` declaration in `globals.css`.

## Testing

### Running backend tests

```bash
cd backend
pip install -r requirements-dev.txt   # first time only
pytest
```

Tests live in `backend/tests/`. Configuration is in `backend/pytest.ini`.

| File | What it covers |
|---|---|
| `tests/test_ingestion_service.py` | `chunk_documents()` and `load_documents()` unit tests |
| `tests/test_guardrail.py` | `_guardrail_node` keyword detection (in-scope and out-of-scope) |
| `tests/test_vector_repository.py` | ChromaDB `add_documents`, `query`, and `count` (uses temp path) |
| `tests/test_api.py` | FastAPI endpoint integration tests (ChatService fully mocked) |
| `tests/conftest.py` | Shared fixtures (`mock_chat_service`, `test_client`) |

### Running frontend tests

```bash
cd ui
npm install    # first time only — installs jest, ts-jest, @testing-library/* etc.
npm test
```

Tests live in `ui/src/__tests__/`. Configuration is in `ui/jest.config.ts`; the jest DOM matchers setup file is `ui/jest.setup.ts`.

| File | What it covers |
|---|---|
| `src/__tests__/ChatInput.test.tsx` | Send button state, Enter/Shift+Enter, input clearing, disabled prop |
| `src/__tests__/ChatMessage.test.tsx` | User/assistant alignment, content rendering, timestamp display |
| `src/__tests__/LoadingIndicator.test.tsx` | Three animated dots rendered |
| `src/__tests__/ThemeToggle.test.tsx` | Dark class toggling on `document.documentElement` |
