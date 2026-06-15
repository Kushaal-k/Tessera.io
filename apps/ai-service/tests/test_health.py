import asyncio

from fastapi.testclient import TestClient

from src import db, main
from src.main import app


class _FakeAdmin:
    def __init__(self, fail: bool = False) -> None:
        self._fail = fail

    async def command(self, name: str) -> dict[str, int]:
        if self._fail:
            raise RuntimeError("connection refused")
        return {"ok": 1}


class _FakeClient:
    """Minimal stand-in for AsyncIOMotorClient so tests need no real MongoDB."""

    def __init__(self, fail: bool = False) -> None:
        self.admin = _FakeAdmin(fail)


# --- db.check_connection (the new connectivity probe) ------------------------


def test_check_connection_no_client(monkeypatch):
    monkeypatch.setattr(db, "_client", None)
    result = asyncio.run(db.check_connection())
    assert result["connected"] is False
    assert result["latency_ms"] is None
    assert "error" in result
    assert result["database"] == db.settings.MONGODB_DB_NAME


def test_check_connection_success(monkeypatch):
    monkeypatch.setattr(db, "_client", _FakeClient(fail=False))
    result = asyncio.run(db.check_connection())
    assert result["connected"] is True
    assert isinstance(result["latency_ms"], float)
    assert "error" not in result


def test_check_connection_failure(monkeypatch):
    monkeypatch.setattr(db, "_client", _FakeClient(fail=True))
    result = asyncio.run(db.check_connection())
    assert result["connected"] is False
    assert "connection refused" in result["error"]


# --- GET /health (the endpoint behavior issue #39 asks for) ------------------


def test_health_returns_200_and_stats_when_db_up(monkeypatch):
    async def fake_check_connection():
        return {
            "connected": True,
            "database": "tessera",
            "collection": "code_chunks",
            "latency_ms": 1.23,
        }

    monkeypatch.setattr(main, "check_connection", fake_check_connection)
    response = TestClient(app).get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"]["connected"] is True
    assert body["database"]["latency_ms"] == 1.23
    assert body["models"]["mcp_server"] == main.settings.MCP_SERVER_NAME
    assert body["models"]["embedding_dimensions"] == main.settings.EMBEDDING_DIMENSIONS


def test_health_returns_503_when_db_down(monkeypatch):
    async def fake_check_connection():
        return {
            "connected": False,
            "database": "tessera",
            "collection": "code_chunks",
            "latency_ms": None,
            "error": "connection refused",
        }

    monkeypatch.setattr(main, "check_connection", fake_check_connection)
    response = TestClient(app).get("/health")

    assert response.status_code == 503
    body = response.json()
    assert body["status"] == "degraded"
    assert body["database"]["connected"] is False
    assert body["database"]["error"] == "connection refused"
