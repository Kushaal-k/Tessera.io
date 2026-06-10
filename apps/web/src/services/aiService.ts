const DEFAULT_AI_SERVICE_URL = "http://127.0.0.1:8000";

export interface AiServiceClientOptions {
  readonly baseUrl?: string;
  readonly fetcher?: typeof fetch;
}

export interface HealthResponse {
  readonly status: string;
}

export interface RagIngestRequest {
  readonly file_path: string;
  readonly content: string;
  readonly chunk_size?: number;
}

export interface RagIngestResponse {
  readonly chunks_stored: number;
}

export interface RagSearchRequest {
  readonly query_vector: readonly number[];
  readonly top_k?: number;
}

export interface RagChunkResult {
  readonly file_path: string;
  readonly content: string;
  readonly score: number;
}

export interface RagSearchResponse {
  readonly results: readonly RagChunkResult[];
}

export class AiServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseBody: string,
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

function resolveBaseUrl(baseUrl?: string): string {
  const configuredUrl =
    baseUrl ?? import.meta.env.VITE_AI_SERVICE_URL ?? DEFAULT_AI_SERVICE_URL;
  return configuredUrl.replace(/\/+$/, "");
}

async function requestJson<TResponse>(
  path: string,
  init: RequestInit,
  options: AiServiceClientOptions = {},
): Promise<TResponse> {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(`${resolveBaseUrl(options.baseUrl)}${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new AiServiceError(
      `AI service request failed with ${response.status}`,
      response.status,
      responseBody,
    );
  }

  return response.json() as Promise<TResponse>;
}

export function getAiServiceHealth(
  options?: AiServiceClientOptions,
): Promise<HealthResponse> {
  return requestJson<HealthResponse>("/health", { method: "GET" }, options);
}

export function ingestRagDocument(
  request: RagIngestRequest,
  options?: AiServiceClientOptions,
): Promise<RagIngestResponse> {
  return requestJson<RagIngestResponse>(
    "/rag/ingest",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    options,
  );
}

export function searchRagChunks(
  request: RagSearchRequest,
  options?: AiServiceClientOptions,
): Promise<RagSearchResponse> {
  return requestJson<RagSearchResponse>(
    "/rag/search",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    options,
  );
}
