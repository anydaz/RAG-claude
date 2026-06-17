from app.repositories.vector_repository import VectorRepository
from app.services import ingestion_service


class RAGService:
    def __init__(self, vector_repo: VectorRepository):
        self._vector_repo = vector_repo

    def ingest_from_path(self, data_path: str) -> int:
        documents = ingestion_service.load_documents(data_path)
        chunks = ingestion_service.chunk_documents(documents)
        if not chunks:
            return 0
        texts = [c["text"] for c in chunks]
        metadatas = [{"source": c["source"]} for c in chunks]
        ids = [c["chunk_id"] for c in chunks]
        self._vector_repo.add_documents(texts, metadatas, ids)
        return len(chunks)

    def retrieve(self, query: str, n_results: int = 5) -> list[str]:
        results = self._vector_repo.query(query, n_results=n_results)
        return [r["text"] for r in results]
