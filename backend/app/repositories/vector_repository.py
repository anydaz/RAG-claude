import os
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction


class VectorRepository:
    def __init__(self):
        chroma_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
        self._client = chromadb.PersistentClient(path=chroma_path)
        self._embedding_fn = SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        self._collection = self._client.get_or_create_collection(
            name="professional_docs",
            embedding_function=self._embedding_fn,
        )

    def add_documents(
        self, texts: list[str], metadatas: list[dict], ids: list[str]
    ) -> None:
        self._collection.add(documents=texts, metadatas=metadatas, ids=ids)

    def query(self, query_text: str, n_results: int = 5) -> list[dict]:
        results = self._collection.query(
            query_texts=[query_text], n_results=n_results
        )
        output = []
        for text, metadata, distance in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            output.append({"text": text, "metadata": metadata, "distance": distance})
        return output

    def count(self) -> int:
        return self._collection.count()
