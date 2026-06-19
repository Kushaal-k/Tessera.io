// ─────────────────────────────────────────────────────────────
// @tessera/shared-types — Common TypeScript definitions & DTOs
// ─────────────────────────────────────────────────────────────

/**
 * Supported programming languages for code execution.
 */
export type SupportedLanguage = "typescript" | "python" | "cpp" | "go" | "java" | "rust";

/**
 * Status lifecycle of a code execution job.
 *
 * "stale" — the result arrived after the CRDT document had advanced past
 * the epoch that originally triggered the execution.  The output must be
 * surfaced in a read-only "Stale Execution Log" and must NOT mutate shared
 * document state.
 */
export type ExecutionStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "timeout"
  | "stale";

/**
 * Payload submitted by a client to request code execution.
 */
export interface ExecutionTask {
  /** Unique identifier for this execution job. */
  readonly id: string;
  /** Source code to execute inside the sandbox. */
  readonly code: string;
  /** Language runtime to use. */
  readonly language: SupportedLanguage;
  /** Maximum execution duration in milliseconds. */
  readonly timeoutMs: number;
  /** ID of the collaboration room that initiated the task. */
  readonly roomId: string;
  /** ISO-8601 timestamp of when the task was submitted. */
  readonly createdAt: string;
  /**
   * SHA-256 hex digest of the Yjs state vector at the moment execution was
   * triggered.  Used by the sync-server fencing mechanism to detect whether
   * the document has diverged while the sandbox was running.
   */
  readonly epochId: string;
}

/**
 * Result returned after a code execution job completes.
 */
export interface ExecutionResult {
  /** Matches the originating ExecutionTask.id. */
  readonly taskId: string;
  /** Final status of the execution. */
  readonly status: ExecutionStatus;
  /** Captured standard output. */
  readonly stdout: string;
  /** Captured standard error. */
  readonly stderr: string;
  /** Process exit code, if available. */
  readonly exitCode: number | null;
  /** Wall-clock execution duration in milliseconds. */
  readonly durationMs: number;
  /**
   * The epochId from the originating ExecutionTask.
   * Echoed back so clients can cross-check against current doc state.
   */
  readonly epochId: string;
}

/**
 * Metadata for a collaborative editing room.
 */
export interface CollaborationRoom {
  /** Unique room identifier. */
  readonly roomId: string;
  /** Human-readable room label. */
  readonly name: string;
  /** Currently connected participant IDs. */
  readonly participants: readonly string[];
  /** ISO-8601 creation timestamp. */
  readonly createdAt: string;
}

/**
 * Represents a participant in a collaboration session.
 */
export interface Participant {
  /** Unique participant identifier. */
  readonly id: string;
  /** Display name. */
  readonly displayName: string;
  /** Whether this participant is an AI agent. */
  readonly isAI: boolean;
  /** Hex color assigned for cursor/selection rendering. */
  readonly cursorColor: string;
}

export interface SyncClientToServerEvents {
  readonly "join-room": (payload: {
    readonly roomId: string;
    readonly participant: Participant;
  }) => void;
  readonly "sync-step-1": (stateVector: Uint8Array) => void;
  readonly "sync-step-2": (diff: Uint8Array) => void;
  readonly "sync-update": (update: Uint8Array) => void;
  readonly "awareness-update": (update: Uint8Array) => void;
  readonly "execute-code": (payload: {
    readonly code: string;
    readonly language: SupportedLanguage;
    /** SHA-256 hex digest of the Yjs state vector at trigger time. */
    readonly epochId: string;
  }) => void;
}

export interface SyncServerToClientEvents {
  readonly "sync-step-1": (stateVector: Uint8Array) => void;
  readonly "sync-step-2": (diff: Uint8Array) => void;
  readonly "sync-update": (update: Uint8Array) => void;
  readonly "awareness-update": (update: Uint8Array) => void;
  readonly "room-joined": (payload: {
    readonly roomId: string;
    readonly participants: readonly Participant[];
  }) => void;
  readonly "execution-result": (result: ExecutionResult) => void;
}

export interface SyncConnectionConfig {
  readonly serverUrl: string;
  readonly roomId: string;
  readonly participant: Participant;
}

export type SandboxRuntime = "runc" | "runsc";

export interface SandboxConfig {
  readonly runtime: SandboxRuntime;
  readonly memoryLimitMb: number;
  readonly cpuQuota: number;
  readonly networkDisabled: boolean;
}