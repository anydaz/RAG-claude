from typing import Generator, TypedDict
import anthropic
from langgraph.graph import StateGraph, START, END

from app.services.rag_service import RAGService


class AgentState(TypedDict):
    query: str
    retrieved_docs: list[str]
    is_in_scope: bool
    response: str


OUT_OF_SCOPE_KEYWORDS = [
    "politics",
    "political",
    "election",
    "government",
    "president",
    "entertainment",
    "celebrity",
    "movie",
    "music",
    "recipe",
    "cooking",
    "food",
    "personal life",
    "relationship",
    "dating",
    "sports score",
    "gossip",
]

SYSTEM_PROMPT = """You are a professional assistant representing a job candidate. Answer questions about their professional background, work experience, technical skills, past projects, and career based solely on the provided context.

If the answer is not in the context, say so honestly. Keep answers concise and professional.

Context:
{context}"""


class ChatAgent:
    def __init__(self, rag_service: RAGService):
        self._rag_service = rag_service
        self._anthropic = anthropic.Anthropic()
        self._graph = self._build_graph()

    def _guardrail_node(self, state: AgentState) -> AgentState:
        query_lower = state["query"].lower()
        for keyword in OUT_OF_SCOPE_KEYWORDS:
            if keyword in query_lower:
                return {
                    **state,
                    "is_in_scope": False,
                    "response": (
                        "I'm sorry, that topic is outside the scope of what I can help with. "
                        "I'm here to answer questions about professional background, work experience, "
                        "technical skills, and career-related topics."
                    ),
                }
        return {**state, "is_in_scope": True}

    def _retrieval_node(self, state: AgentState) -> AgentState:
        docs = self._rag_service.retrieve(state["query"])
        return {**state, "retrieved_docs": docs}

    def _generation_node(self, state: AgentState) -> AgentState:
        context = "\n\n".join(state["retrieved_docs"]) if state["retrieved_docs"] else "No relevant context found."
        system = SYSTEM_PROMPT.format(context=context)
        message = self._anthropic.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=system,
            messages=[{"role": "user", "content": state["query"]}],
        )
        response_text = message.content[0].text if message.content else "I could not generate a response."
        return {**state, "response": response_text}

    def _route_after_guardrail(self, state: AgentState) -> str:
        if state["is_in_scope"]:
            return "retrieval_node"
        return END

    def _build_graph(self) -> StateGraph:
        graph = StateGraph(AgentState)
        graph.add_node("guardrail_node", self._guardrail_node)
        graph.add_node("retrieval_node", self._retrieval_node)
        graph.add_node("generation_node", self._generation_node)

        graph.add_edge(START, "guardrail_node")
        graph.add_conditional_edges(
            "guardrail_node",
            self._route_after_guardrail,
            {"retrieval_node": "retrieval_node", END: END},
        )
        graph.add_edge("retrieval_node", "generation_node")
        graph.add_edge("generation_node", END)

        return graph.compile()

    def run(self, query: str) -> str:
        initial_state: AgentState = {
            "query": query,
            "retrieved_docs": [],
            "is_in_scope": False,
            "response": "",
        }
        result = self._graph.invoke(initial_state)
        return result["response"]

    def stream_run(self, query: str) -> Generator[str, None, None]:
        state: AgentState = {
            "query": query,
            "retrieved_docs": [],
            "is_in_scope": False,
            "response": "",
        }
        state = self._guardrail_node(state)

        if not state["is_in_scope"]:
            yield state["response"]
            return

        state = self._retrieval_node(state)
        context = "\n\n".join(state["retrieved_docs"]) if state["retrieved_docs"] else "No relevant context found."
        system = SYSTEM_PROMPT.format(context=context)

        with self._anthropic.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=system,
            messages=[{"role": "user", "content": query}],
        ) as stream:
            for text in stream.text_stream:
                yield text
