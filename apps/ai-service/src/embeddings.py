"""Embedding service for converting text queries to vector representations."""
from .config import settings


class EmbeddingService:
    """Generates vector embeddings from text using the configured model.

    The actual model inference can be plugged in when a real embedding model
    is added as a dependency. For now, a deterministic placeholder is returned
    so that the MCP tool contract works end-to-end.
    """

    def __init__(self, model_name: str = settings.EMBEDDING_MODEL) -> None:
        self.model_name = model_name

    async def embed_query(self, text: str) -> list[float]:
        """Convert a text query into a vector embedding.

        Replace the placeholder below with a real model call, e.g.::

            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer(self.model_name)
            return model.encode(text).tolist()
        """
        _ = text  # consumed by real model
        return [0.0] * settings.EMBEDDING_DIMENSIONS
