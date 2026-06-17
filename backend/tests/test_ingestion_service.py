"""Unit tests for ingestion_service.py."""
import os
import pytest
from unittest.mock import patch, MagicMock

from app.services.ingestion_service import chunk_documents, load_documents


# ---------------------------------------------------------------------------
# chunk_documents
# ---------------------------------------------------------------------------

class TestChunkDocumentsBasic:
    def test_produces_chunks(self):
        doc = [{"text": "A" * 2500, "source": "test.pdf", "type": "pdf"}]
        chunks = chunk_documents(doc)
        assert len(chunks) > 0

    def test_chunk_max_length(self):
        doc = [{"text": "A" * 2500, "source": "test.pdf", "type": "pdf"}]
        chunks = chunk_documents(doc)
        for chunk in chunks:
            assert len(chunk["text"]) <= 1000

    def test_chunk_has_required_keys(self):
        doc = [{"text": "Hello world " * 100, "source": "resume.pdf", "type": "pdf"}]
        chunks = chunk_documents(doc)
        for chunk in chunks:
            assert "text" in chunk
            assert "source" in chunk
            assert "chunk_id" in chunk

    def test_chunk_source_preserved(self):
        doc = [{"text": "X" * 1500, "source": "myfile.docx", "type": "docx"}]
        chunks = chunk_documents(doc)
        for chunk in chunks:
            assert chunk["source"] == "myfile.docx"

    def test_short_document_yields_one_chunk(self):
        doc = [{"text": "Short text.", "source": "small.pdf", "type": "pdf"}]
        chunks = chunk_documents(doc)
        assert len(chunks) == 1
        assert chunks[0]["text"] == "Short text."


class TestChunkDocumentsOverlap:
    def test_overlap_between_consecutive_chunks(self):
        # Text is exactly 2 * chunk_size so we get at least 2 chunks.
        # chunk_size=1000, chunk_overlap=200 → second chunk starts at index 800.
        text = "B" * 2000
        doc = [{"text": text, "source": "overlap_test.pdf", "type": "pdf"}]
        chunks = chunk_documents(doc)
        assert len(chunks) >= 2
        # The first chunk covers [0, 1000].
        # The second chunk starts at 1000 - 200 = 800.
        assert chunks[1]["text"] == text[800:1800]

    def test_overlap_content_matches(self):
        # Construct text so overlapping region is identifiable.
        text = "START" + ("X" * 795) + "OVERLAP_REGION" + ("Y" * 186)
        doc = [{"text": text, "source": "o.pdf", "type": "pdf"}]
        chunks = chunk_documents(doc)
        # The overlap region should appear in both the first and second chunk.
        assert "OVERLAP_REGION" in chunks[0]["text"]
        assert "OVERLAP_REGION" in chunks[1]["text"]


class TestChunkDocumentsEmpty:
    def test_empty_list(self):
        assert chunk_documents([]) == []

    def test_document_with_only_whitespace(self):
        doc = [{"text": "   \n\t  ", "source": "blank.pdf", "type": "pdf"}]
        chunks = chunk_documents(doc)
        assert chunks == []


# ---------------------------------------------------------------------------
# load_documents
# ---------------------------------------------------------------------------

class TestLoadDocumentsNonexistentPath:
    def test_nonexistent_path_raises(self):
        with pytest.raises((FileNotFoundError, OSError)):
            load_documents("/nonexistent/path/that/does/not/exist")

    def test_empty_directory_returns_empty_list(self, tmp_path):
        result = load_documents(str(tmp_path))
        assert result == []


class TestLoadDocumentsMockedIO:
    def test_pdf_file_returns_documents(self, tmp_path):
        # Create a fake PDF file path so os.listdir picks it up.
        fake_pdf = tmp_path / "resume.pdf"
        fake_pdf.write_bytes(b"%PDF-1.4 fake")

        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Python developer with 5 years experience."

        mock_reader = MagicMock()
        mock_reader.pages = [mock_page]

        with patch("app.services.ingestion_service.pypdf.PdfReader", return_value=mock_reader):
            docs = load_documents(str(tmp_path))

        assert len(docs) == 1
        assert docs[0]["source"] == "resume.pdf"
        assert docs[0]["type"] == "pdf"
        assert "Python developer" in docs[0]["text"]

    def test_pdf_empty_page_skipped(self, tmp_path):
        fake_pdf = tmp_path / "empty.pdf"
        fake_pdf.write_bytes(b"%PDF-1.4 fake")

        mock_page = MagicMock()
        mock_page.extract_text.return_value = "   "  # whitespace only

        mock_reader = MagicMock()
        mock_reader.pages = [mock_page]

        with patch("app.services.ingestion_service.pypdf.PdfReader", return_value=mock_reader):
            docs = load_documents(str(tmp_path))

        assert docs == []

    def test_docx_file_returns_document(self, tmp_path):
        fake_docx = tmp_path / "coverletter.docx"
        fake_docx.write_bytes(b"PK fake docx bytes")

        with patch(
            "app.services.ingestion_service.docx2txt.process",
            return_value="I am a software engineer.",
        ):
            docs = load_documents(str(tmp_path))

        assert len(docs) == 1
        assert docs[0]["source"] == "coverletter.docx"
        assert docs[0]["type"] == "docx"
        assert "software engineer" in docs[0]["text"]

    def test_non_matching_file_ignored(self, tmp_path):
        (tmp_path / "notes.txt").write_text("ignore me")
        docs = load_documents(str(tmp_path))
        assert docs == []
