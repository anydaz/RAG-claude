"""Unit tests for VectorRepository."""
import os
import pytest

from app.repositories.vector_repository import VectorRepository


@pytest.fixture()
def repo(tmp_path, monkeypatch):
    """Return a VectorRepository backed by a temp ChromaDB directory."""
    monkeypatch.setenv("CHROMA_DB_PATH", str(tmp_path))
    return VectorRepository()


# ---------------------------------------------------------------------------
# count()
# ---------------------------------------------------------------------------

class TestCount:
    def test_count_empty(self, repo):
        assert repo.count() == 0

    def test_count_after_add_single(self, repo):
        repo.add_documents(
            texts=["Python developer with 5 years of experience."],
            metadatas=[{"source": "resume.pdf"}],
            ids=["doc-001"],
        )
        assert repo.count() == 1

    def test_count_after_add_multiple(self, repo):
        texts = [f"Document number {i}." for i in range(5)]
        metadatas = [{"source": f"file_{i}.pdf"} for i in range(5)]
        ids = [f"doc-{i:03d}" for i in range(5)]
        repo.add_documents(texts=texts, metadatas=metadatas, ids=ids)
        assert repo.count() == 5


# ---------------------------------------------------------------------------
# add_documents() + query()
# ---------------------------------------------------------------------------

class TestAddAndQuery:
    def test_add_and_query_returns_result(self, repo):
        repo.add_documents(
            texts=["Experienced software engineer skilled in Python and FastAPI."],
            metadatas=[{"source": "resume.pdf"}],
            ids=["chunk-001"],
        )
        results = repo.query("software engineer Python", n_results=1)
        assert len(results) == 1

    def test_query_result_structure(self, repo):
        repo.add_documents(
            texts=["Built a RAG pipeline using LangChain and ChromaDB."],
            metadatas=[{"source": "project.pdf"}],
            ids=["chunk-002"],
        )
        results = repo.query("RAG pipeline LangChain", n_results=1)
        result = results[0]
        assert "text" in result
        assert "metadata" in result
        assert "distance" in result

    def test_query_returns_added_text(self, repo):
        content = "Led a team of five engineers building microservices on AWS."
        repo.add_documents(
            texts=[content],
            metadatas=[{"source": "experience.pdf"}],
            ids=["chunk-003"],
        )
        results = repo.query("team lead microservices AWS", n_results=1)
        assert results[0]["text"] == content

    def test_query_metadata_preserved(self, repo):
        repo.add_documents(
            texts=["Proficient in TypeScript and React."],
            metadatas=[{"source": "skills.pdf"}],
            ids=["chunk-004"],
        )
        results = repo.query("TypeScript React frontend", n_results=1)
        assert results[0]["metadata"]["source"] == "skills.pdf"

    def test_query_distance_is_numeric(self, repo):
        repo.add_documents(
            texts=["Worked on machine learning projects using PyTorch."],
            metadatas=[{"source": "ml.pdf"}],
            ids=["chunk-005"],
        )
        results = repo.query("machine learning PyTorch", n_results=1)
        assert isinstance(results[0]["distance"], (int, float))

    def test_query_n_results_respected(self, repo):
        texts = [f"Skill number {i} in the candidate's profile." for i in range(10)]
        metadatas = [{"source": "skills.pdf"} for _ in range(10)]
        ids = [f"skill-{i:03d}" for i in range(10)]
        repo.add_documents(texts=texts, metadatas=metadatas, ids=ids)
        results = repo.query("candidate skill profile", n_results=3)
        assert len(results) == 3


# ---------------------------------------------------------------------------
# Isolation: each test uses its own tmp_path
# ---------------------------------------------------------------------------

class TestIsolation:
    def test_separate_instances_are_independent(self, tmp_path, monkeypatch):
        path_a = tmp_path / "db_a"
        path_b = tmp_path / "db_b"
        path_a.mkdir()
        path_b.mkdir()

        monkeypatch.setenv("CHROMA_DB_PATH", str(path_a))
        repo_a = VectorRepository()

        monkeypatch.setenv("CHROMA_DB_PATH", str(path_b))
        repo_b = VectorRepository()

        repo_a.add_documents(
            texts=["Doc in repo A."],
            metadatas=[{"source": "a.pdf"}],
            ids=["a-001"],
        )

        assert repo_a.count() == 1
        assert repo_b.count() == 0
