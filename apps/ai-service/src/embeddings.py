"""Embedding service for converting text queries to vector representations."""

import asyncio
from functools import lru_cache

from sentence_transformers import SentenceTransformer

from .config import settings


@lru_cache(maxsize=1)
def _load_model(model_name: str) -> SentenceTransformer:
    return SentenceTransformer(model_name)


class EmbeddingService:
    """Generates vector embeddings from text using the configured model."""

    def __init__(self, model_name: str = settings.EMBEDDING_MODEL) -> None:
        self.model_name = model_name

    async def embed_query(self, text: str) -> list[float]:
        loop = asyncio.get_running_loop()
        model = _load_model(self.model_name)
        vector = await loop.run_in_executor(None, model.encode, text)
        return vector.tolist()
