"""Embedding service for converting text queries to vector representations."""

import asyncio
from functools import lru_cache

from .config import settings


@lru_cache(maxsize=1)
def _load_model(model_name: str):
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(model_name)


class EmbeddingService:
    """Generates vector embeddings from text using the configured model."""

    def __init__(self, model_name: str = settings.EMBEDDING_MODEL) -> None:
        self.model_name = model_name

    async def embed_query(self, text: str) -> list[float]:
        return (await self.embed_documents([text]))[0]

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        loop = asyncio.get_running_loop()
        model = _load_model(self.model_name)
        vectors = await loop.run_in_executor(None, model.encode, texts)
        return [
            vector.tolist() if hasattr(vector, "tolist") else list(vector)
            for vector in vectors
        ]
