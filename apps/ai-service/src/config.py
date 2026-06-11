from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "tessera"
    MONGODB_COLLECTION: str = "code_chunks"
    # Bound server selection so an unreachable database fails fast (e.g. in the
    # /health probe) instead of waiting out Motor's 30s default.
    MONGODB_TIMEOUT_MS: int = 3000
    EMBEDDING_DIMENSIONS: int = 1536
    MCP_SERVER_NAME: str = "tessera-ai"

    model_config = {"env_prefix": "TESSERA_", "env_file": ".env"}


settings = Settings()
