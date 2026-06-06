import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
from time import perf_counter

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .db import connect_db, close_db
from .rag import router as rag_router
from .mcp_server import mcp

logger = logging.getLogger("tessera.ai.timing")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None]:
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Tessera AI Service",
    version="0.1.0",
    description="RAG & Model Context Protocol service for Tessera.io",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_request_timing(request: Request, call_next):
    start = perf_counter()

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = (perf_counter() - start) * 1000
        logger.exception(
            "ai_service_request_failed method=%s path=%s duration_ms=%.2f",
            request.method,
            request.url.path,
            duration_ms,
        )
        raise

    duration_ms = (perf_counter() - start) * 1000
    response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"
    logger.info(
        "ai_service_request method=%s path=%s status_code=%s duration_ms=%.2f",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


app.include_router(rag_router)
app.mount("/mcp", mcp.sse_app())


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
