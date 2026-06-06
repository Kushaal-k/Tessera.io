import { describe, expect, it, vi } from "vitest";
import {
  AiServiceError,
  getAiServiceHealth,
  ingestRagDocument,
  searchRagChunks,
} from "./aiService.js";

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("aiService", () => {
  it("calls the health endpoint with a normalized base URL", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({ status: "ok" }),
    );

    await expect(
      getAiServiceHealth({
        baseUrl: "http://localhost:8000/",
        fetcher,
      }),
    ).resolves.toEqual({ status: "ok" });

    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:8000/health",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("posts typed RAG ingest payloads", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({ chunks_stored: 2 }),
    );

    await expect(
      ingestRagDocument(
        {
          file_path: "src/App.tsx",
          content: "const app = true;",
          chunk_size: 128,
        },
        {
          baseUrl: "http://localhost:8000",
          fetcher,
        },
      ),
    ).resolves.toEqual({ chunks_stored: 2 });

    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:8000/rag/ingest",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          file_path: "src/App.tsx",
          content: "const app = true;",
          chunk_size: 128,
        }),
      }),
    );
  });

  it("posts typed RAG search payloads", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        results: [
          {
            file_path: "src/App.tsx",
            content: "const app = true;",
            score: 0.98,
          },
        ],
      }),
    );

    await expect(
      searchRagChunks(
        {
          query_vector: [0.1, 0.2, 0.3],
          top_k: 3,
        },
        {
          baseUrl: "http://localhost:8000",
          fetcher,
        },
      ),
    ).resolves.toEqual({
      results: [
        {
          file_path: "src/App.tsx",
          content: "const app = true;",
          score: 0.98,
        },
      ],
    });

    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:8000/rag/search",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          query_vector: [0.1, 0.2, 0.3],
          top_k: 3,
        }),
      }),
    );
  });

  it("throws a typed error for non-2xx responses", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("missing collection", {
        status: 503,
        statusText: "Service Unavailable",
      }),
    );

    const request = getAiServiceHealth({
      baseUrl: "http://localhost:8000",
      fetcher,
    });

    await expect(request).rejects.toBeInstanceOf(AiServiceError);
    await expect(request).rejects.toMatchObject({
      name: "AiServiceError",
      status: 503,
      responseBody: "missing collection",
    });
  });
});
