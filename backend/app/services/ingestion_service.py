import os
import uuid
import pypdf
import docx2txt


def load_documents(data_path: str) -> list[dict]:
    documents = []
    for filename in os.listdir(data_path):
        filepath = os.path.join(data_path, filename)
        if filename.lower().endswith(".pdf"):
            reader = pypdf.PdfReader(filepath)
            for page in reader.pages:
                text = page.extract_text() or ""
                if text.strip():
                    documents.append(
                        {"text": text, "source": filename, "type": "pdf"}
                    )
        elif filename.lower().endswith(".docx"):
            text = docx2txt.process(filepath)
            if text and text.strip():
                documents.append(
                    {"text": text, "source": filename, "type": "docx"}
                )
    return documents


def chunk_documents(documents: list[dict]) -> list[dict]:
    chunk_size = 1000
    chunk_overlap = 200
    chunks = []

    for doc in documents:
        text = doc["text"]
        source = doc["source"]
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]
            if chunk_text.strip():
                chunk_id = f"{source}-{uuid.uuid4().hex[:8]}"
                chunks.append(
                    {"text": chunk_text, "source": source, "chunk_id": chunk_id}
                )
            start = end - chunk_overlap
            if start >= len(text):
                break

    return chunks
