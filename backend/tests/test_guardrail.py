"""Unit tests for the guardrail node in chat_agent.py."""
import pytest
from unittest.mock import MagicMock

from app.agents.chat_agent import ChatAgent, AgentState


def make_agent() -> ChatAgent:
    """Create a ChatAgent with a mocked RAGService and mocked Anthropic client."""
    mock_rag = MagicMock()
    with __import__("unittest.mock", fromlist=["patch"]).patch(
        "app.agents.chat_agent.anthropic.Anthropic"
    ):
        agent = ChatAgent(rag_service=mock_rag)
    return agent


def make_state(query: str) -> AgentState:
    return AgentState(
        query=query,
        retrieved_docs=[],
        is_in_scope=False,
        response="",
    )


# ---------------------------------------------------------------------------
# Helper — call guardrail node directly
# ---------------------------------------------------------------------------

def run_guardrail(query: str) -> AgentState:
    agent = make_agent()
    state = make_state(query)
    return agent._guardrail_node(state)


# ---------------------------------------------------------------------------
# In-scope queries
# ---------------------------------------------------------------------------

class TestInScope:
    def test_in_scope_work_experience(self):
        result = run_guardrail("Tell me about your work experience")
        assert result["is_in_scope"] is True
        assert result["response"] == ""

    def test_in_scope_skills(self):
        result = run_guardrail("What programming languages do you know?")
        assert result["is_in_scope"] is True

    def test_in_scope_projects(self):
        result = run_guardrail("What projects have you worked on?")
        assert result["is_in_scope"] is True

    def test_in_scope_education(self):
        result = run_guardrail("What is your educational background?")
        assert result["is_in_scope"] is True

    def test_in_scope_career(self):
        result = run_guardrail("What are your career goals?")
        assert result["is_in_scope"] is True

    def test_in_scope_cloud_experience(self):
        result = run_guardrail("Do you have experience with AWS?")
        assert result["is_in_scope"] is True


# ---------------------------------------------------------------------------
# Out-of-scope queries
# ---------------------------------------------------------------------------

class TestOutOfScope:
    def test_out_of_scope_politics(self):
        result = run_guardrail("What do you think about the election?")
        assert result["is_in_scope"] is False
        assert "outside the scope" in result["response"].lower() or "scope" in result["response"].lower()

    def test_out_of_scope_recipe(self):
        result = run_guardrail("How do I make pasta?")
        assert result["is_in_scope"] is False

    def test_out_of_scope_personal(self):
        result = run_guardrail("What's your favorite movie?")
        assert result["is_in_scope"] is False

    def test_out_of_scope_president(self):
        result = run_guardrail("What do you think about the current president?")
        assert result["is_in_scope"] is False

    def test_out_of_scope_celebrity(self):
        result = run_guardrail("Who is the most popular celebrity right now?")
        assert result["is_in_scope"] is False

    def test_out_of_scope_sports_score(self):
        result = run_guardrail("What are the latest sports scores?")
        assert result["is_in_scope"] is False

    def test_out_of_scope_music(self):
        result = run_guardrail("What music do you listen to?")
        assert result["is_in_scope"] is False

    def test_out_of_scope_gossip(self):
        result = run_guardrail("Tell me the latest celebrity gossip")
        assert result["is_in_scope"] is False

    def test_out_of_scope_cooking(self):
        result = run_guardrail("Can you share a cooking tip?")
        assert result["is_in_scope"] is False

    def test_out_of_scope_personal_life(self):
        result = run_guardrail("Tell me about your personal life")
        assert result["is_in_scope"] is False


# ---------------------------------------------------------------------------
# Case insensitivity
# ---------------------------------------------------------------------------

class TestCaseInsensitivity:
    def test_uppercase_keyword_blocked(self):
        result = run_guardrail("What do you think about POLITICS?")
        assert result["is_in_scope"] is False

    def test_mixed_case_keyword_blocked(self):
        result = run_guardrail("Who won the Election last year?")
        assert result["is_in_scope"] is False


# ---------------------------------------------------------------------------
# State passthrough
# ---------------------------------------------------------------------------

class TestStatePassthrough:
    def test_out_of_scope_preserves_query(self):
        query = "What do you think about the election?"
        result = run_guardrail(query)
        assert result["query"] == query

    def test_in_scope_preserves_query(self):
        query = "Tell me about your work experience"
        result = run_guardrail(query)
        assert result["query"] == query

    def test_out_of_scope_sets_response(self):
        result = run_guardrail("What is your favorite recipe?")
        assert len(result["response"]) > 0

    def test_in_scope_leaves_response_empty(self):
        result = run_guardrail("What are your technical skills?")
        assert result["response"] == ""
