import asyncio

from src import rag


class _FakeCollection:
    def __init__(self) -> None:
        self.inserted_documents = []

    async def insert_many(self, documents):
        self.inserted_documents.extend(documents)


class _FakeEmbeddingService:
    def __init__(self) -> None:
        self.texts = []

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        self.texts = texts
        return [[float(index + 1), float(index + 2)] for index, _ in enumerate(texts)]


def test_ingest_embeds_chunks_before_storing(monkeypatch):
    collection = _FakeCollection()
    embedding_service = _FakeEmbeddingService()

    monkeypatch.setattr(rag, "get_collection", lambda: collection)
    monkeypatch.setattr(rag, "embedding_service", embedding_service)

    response = asyncio.run(
        rag.ingest(
            rag.IngestRequest(
                file_path="src/example.ts",
                content="alpha beta gamma delta",
                chunk_size=64,
            )
        )
    )

    assert response.chunks_stored == 1
    assert embedding_service.texts == ["alpha beta gamma delta"]
    assert collection.inserted_documents == [
        {
            "file_path": "src/example.ts",
            "content": "alpha beta gamma delta",
            "embedding": [1.0, 2.0],
            "chunk_index": 0,
        }
    ]


def test_ingest_skips_embedding_when_no_chunks(monkeypatch):
    collection = _FakeCollection()
    embedding_service = _FakeEmbeddingService()

    monkeypatch.setattr(rag, "get_collection", lambda: collection)
    monkeypatch.setattr(rag, "embedding_service", embedding_service)

    response = asyncio.run(
        rag.ingest(rag.IngestRequest(file_path="empty.py", content="", chunk_size=64))
    )

    assert response.chunks_stored == 0
    assert embedding_service.texts == []
    assert collection.inserted_documents == []
