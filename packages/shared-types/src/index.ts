// ─────────────────────────────────────────────────────────────
// @tessera/shared-types — Common TypeScript definitions & DTOs
// ─────────────────────────────────────────────────────────────

/**
 * Supported programming languages for code execution.
 */
export type SupportedLanguage = "typescript" | "python" | "cpp" | "java" | "rust";

/**
 * Status lifecycle of a code execution job.
 */
export type ExecutionStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "timeout";

// ─────────────────────────────────────────────────────────────
// Workspace types (multi-file support)
// ─────────────────────────────────────────────────────────────

/**
 * A single file in the multi-file workspace.
 */
export interface WorkspaceFile {
  /** Unique stable identifier for this file (UUID). */
  readonly id: string;
  /** Display name including extension, e.g. "reader.py". */
  name: string;
  /** Programming language derived from the file extension. */
  language: SupportedLanguage;
  /**
   * ID of the parent folder, or null if the file lives at the workspace root.
   * MVP: single-level folders only (no nested subfolders).
   */
  parentFolderId: string | null;
}

/**
 * A folder in the multi-file workspace.
 * MVP: folders may only exist at the workspace root level.
 */
export interface WorkspaceFolder {
  /** Unique stable identifier for this folder (UUID). */
  readonly id: string;
  /** Display name of the folder. */
  name: string;
}

/**
 * Full snapshot of the workspace tree.
 */
export interface WorkspaceTree {
  readonly files: readonly WorkspaceFile[];
  readonly folders: readonly WorkspaceFolder[];
}

/**
 * A single file payload sent to the execution sandbox.
 */
export interface ExecutionFile {
  /** Filename (used as path inside /tmp, e.g. "data.csv"). */
  readonly name: string;
  /** Full text content of the file. */
  readonly content: string;
}

// ─────────────────────────────────────────────────────────────
// Execution types
// ─────────────────────────────────────────────────────────────

/**
 * Payload submitted by a client to request code execution.
 */
export interface ExecutionTask {
  /** Unique identifier for this execution job. */
  readonly id: string;
  /** Source code of the active (entry-point) file to execute inside the sandbox. */
  readonly code: string;
  /** Language runtime to use for the entry-point file. */
  readonly language: SupportedLanguage;
  /** Maximum execution duration in milliseconds. */
  readonly timeoutMs: number;
  /** ID of the collaboration room that initiated the task. */
  readonly roomId: string;
  /** ISO-8601 timestamp of when the task was submitted. */
  readonly createdAt: string;
  /**
   * All workspace files to write into the sandbox /tmp directory
   * before executing the entry-point. Includes the entry-point file itself.
   */
  readonly files: readonly ExecutionFile[];
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

// ─────────────────────────────────────────────────────────────
// Collaboration types
// ─────────────────────────────────────────────────────────────

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
    /** All workspace files to write into the sandbox before execution. */
    readonly files: readonly ExecutionFile[];
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
