from time import perf_counter

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from .config import settings

_client: AsyncIOMotorClient | None = None  # type: ignore[type-arg]


async def connect_db() -> None:
    global _client
    # serverSelectionTimeoutMS keeps the /health probe (and any first query)
    # fast when the database is unreachable, instead of Motor's 30s default.
    _client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_MS,
    )


async def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None


def get_collection() -> AsyncIOMotorCollection:  # type: ignore[type-arg]
    if _client is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    db = _client[settings.MONGODB_DB_NAME]
    return db[settings.MONGODB_COLLECTION]


async def check_connection() -> dict[str, object]:
    """Ping MongoDB and report connectivity statistics for the health check.

    Never raises: a failed or missing connection is reported as
    ``connected: False`` so the caller can degrade gracefully instead of
    returning a 500.
    """
    status: dict[str, object] = {
        "connected": False,
        "database": settings.MONGODB_DB_NAME,
        "collection": settings.MONGODB_COLLECTION,
        "latency_ms": None,
    }

    if _client is None:
        status["error"] = "Database client not initialized"
        return status

    start = perf_counter()
    try:
        await _client.admin.command("ping")
    except Exception as exc:
        status["error"] = str(exc)
        return status

    status["connected"] = True
    status["latency_ms"] = round((perf_counter() - start) * 1000, 2)
    return status
