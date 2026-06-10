// ─────────────────────────────────────────────────────────────
// @tessera/shared-types — Common TypeScript definitions & DTOs
// ─────────────────────────────────────────────────────────────

/**
 * Supported programming languages for code execution.
 */
export type SupportedLanguage = "typescript" | "python" | "cpp" | "java";

/**
 * Status lifecycle of a code execution job.
 */
export type ExecutionStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "timeout";

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
