import json
import operator
from datetime import date
from typing import Annotated, Generator, List, TypedDict

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from app.agents.calendar_agent import CalendarAgent
from app.llm import build_llm, to_lc_messages
from app.services.rag_service import RAGService

RAG_SYSTEM_PROMPT = """You are a professional assistant representing a job candidate. Answer questions about their professional background, work experience, technical skills, past projects, and career based solely on the provided context.

If the answer is not in the context, say so honestly. Keep answers concise and professional.

Today's date: {today}. Use this date for any question about the current date, or about durations such as years or months of experience at a role.

Context:
{context}"""

CLASSIFY_PROMPT = """You classify the intent of a user message in a professional chatbot. The chatbot can:
1. Answer questions about a person's professional background, work experience, skills, projects, and questions about today's date ("rag")
2. Schedule, search, update, or manage calendar events / meetings ("calendar")
3. Reject off-topic requests ("out_of_scope")

IMPORTANT: If the conversation history shows the assistant was asking for calendar event details or managing calendar events, treat the current message as continuing that calendar flow — classify as "calendar".

Today's date: {today}

Conversation history (most recent last):
{history}

Current user message: {query}

Respond with ONLY a JSON object, no markdown:
{{"intent": "rag" | "calendar" | "out_of_scope"}}"""


class AgentState(TypedDict):
    messages: Annotated[List[dict], operator.add]
    query: str
    intent: str
    retrieved_docs: List[str]
    response: str


class ChatAgent:
    def __init__(self, rag_service: RAGService):
        self._rag = rag_service
        self._llm = build_llm()
        self._checkpointer = MemorySaver()
        self._calendar_agent = CalendarAgent()
        self._graph = self._build_graph()

    # ── helpers ───────────────────────────────────────────────────────────────

    def _thread_config(self, thread_id: str) -> dict:
        return {"configurable": {"thread_id": thread_id}}

    def _get_history(self, thread_id: str) -> List[dict]:
        snapshot = self._graph.get_state(self._thread_config(thread_id))
        if not snapshot or not snapshot.values:
            return []
        return snapshot.values.get("messages", [])

    def _save_turn(self, thread_id: str, user_content: str, assistant_content: str) -> None:
        self._graph.update_state(
            self._thread_config(thread_id),
            {"messages": [
                {"role": "user", "content": user_content},
                {"role": "assistant", "content": assistant_content},
            ]},
        )

    def _format_history(self, messages: List[dict]) -> str:
        if not messages:
            return "(no prior conversation)"
        return "\n".join(f"{m['role'].capitalize()}: {m['content']}" for m in messages)

    def _llm_json(self, prompt: str) -> dict:
        msg = self._llm.invoke(to_lc_messages([{"role": "user", "content": prompt}]))
        text = msg.content.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())

    # ── nodes ─────────────────────────────────────────────────────────────────

    def _classify_node(self, state: AgentState) -> AgentState:
        history = state["messages"][:-1]
        prompt = CLASSIFY_PROMPT.format(
            today=date.today().isoformat(),
            history=self._format_history(history),
            query=state["query"],
        )
        try:
            intent = self._llm_json(prompt).get("intent", "out_of_scope")
        except Exception:
            intent = "out_of_scope"

        response = ""
        if intent == "out_of_scope":
            response = (
                "I'm sorry, that topic is outside my scope. "
                "I can answer questions about professional background, work experience, "
                "skills, and projects — or help you manage your calendar."
            )
        return {**state, "intent": intent, "response": response}

    def _calendar_agent_node(self, state: AgentState) -> AgentState:
        text = self._calendar_agent.run(state["messages"])
        return {**state, "response": text}

    def _retrieval_node(self, state: AgentState) -> AgentState:
        docs = self._rag.retrieve(state["query"])
        return {**state, "retrieved_docs": docs}

    def _generation_node(self, state: AgentState) -> AgentState:
        context = "\n\n".join(state["retrieved_docs"]) if state["retrieved_docs"] else "No relevant context found."
        system = RAG_SYSTEM_PROMPT.format(context=context, today=date.today().isoformat())
        msg = self._llm.invoke(to_lc_messages(state["messages"], system=system))
        response = msg.content or "I could not generate a response."
        return {**state, "response": response}

    # ── routing ───────────────────────────────────────────────────────────────

    def _route_after_classify(self, state: AgentState) -> str:
        return {"rag": "retrieval_node", "calendar": "calendar_agent_node"}.get(
            state["intent"], END
        )

    # ── graph ─────────────────────────────────────────────────────────────────

    def _build_graph(self):
        g = StateGraph(AgentState)
        g.add_node("classify_node", self._classify_node)
        g.add_node("retrieval_node", self._retrieval_node)
        g.add_node("generation_node", self._generation_node)
        g.add_node("calendar_agent_node", self._calendar_agent_node)

        g.add_edge(START, "classify_node")
        g.add_conditional_edges(
            "classify_node",
            self._route_after_classify,
            {"retrieval_node": "retrieval_node", "calendar_agent_node": "calendar_agent_node", END: END},
        )
        g.add_edge("retrieval_node", "generation_node")
        g.add_edge("generation_node", END)
        g.add_edge("calendar_agent_node", END)

        return g.compile(checkpointer=self._checkpointer)

    # ── public API ────────────────────────────────────────────────────────────

    def get_graph_image(self) -> bytes:
        return self._graph.get_graph().draw_mermaid_png()

    def run(self, query: str, thread_id: str) -> str:
        history = self._get_history(thread_id)
        config = self._thread_config(thread_id)
        result = self._graph.invoke(
            {
                "messages": history + [{"role": "user", "content": query}],
                "query": query,
                "intent": "",
                "retrieved_docs": [],
                "response": "",
            },
            config=config,
        )
        return result["response"]

    def stream_run(self, query: str, thread_id: str) -> Generator[str, None, None]:
        history = self._get_history(thread_id)

        state: AgentState = {
            "messages": history + [{"role": "user", "content": query}],
            "query": query,
            "intent": "",
            "retrieved_docs": [],
            "response": "",
        }

        state = self._classify_node(state)

        if state["intent"] != "rag":
            if state["intent"] == "calendar":
                state = self._calendar_agent_node(state)

            response = state["response"]
            self._save_turn(thread_id, query, response)
            yield response
            return

        # RAG — stream tokens
        state = self._retrieval_node(state)
        context = "\n\n".join(state["retrieved_docs"]) if state["retrieved_docs"] else "No relevant context found."
        system = RAG_SYSTEM_PROMPT.format(context=context, today=date.today().isoformat())

        full_response = ""
        for chunk in self._llm.stream(to_lc_messages(state["messages"], system=system)):
            if chunk.content:
                full_response += chunk.content
                yield chunk.content

        self._save_turn(thread_id, query, full_response)
