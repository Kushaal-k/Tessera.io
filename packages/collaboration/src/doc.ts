// ──────────────────────────────────────────────────────────────
// @tessera/collaboration — Yjs document factory
// ──────────────────────────────────────────────────────────────

import * as Y from "yjs";
import type { CollaborationRoom, WorkspaceFile, WorkspaceFolder } from "@tessera/shared-types";

/**
 * Configuration for creating a collaborative document instance.
 */
export interface CollaborationDocOptions {
  /** Room metadata to associate with this document. */
  readonly room: CollaborationRoom;
  /** Initial file to seed the workspace with (defaults to main.ts). */
  readonly initialFile?: Pick<WorkspaceFile, "id" | "name" | "language">;
}

/**
 * Wrapper around a Yjs Doc that provides typed access to the shared
 * workspace: a metadata map for the file tree plus named Y.Text instances
 * per file, all bound to the Monaco editor via y-monaco.
 */
export interface CollaborationDoc {
  /** The underlying Yjs document. */
  readonly ydoc: Y.Doc;
  /**
   * Legacy single-file text reference — always points to the initial
   * (first) file's Y.Text. Kept for backwards compatibility.
   * Prefer `getFileText(fileId)` for multi-file workflows.
   */
  readonly ytext: Y.Text;
  /**
   * Shared Y.Map that stores workspace metadata.
   * Structure: { files: WorkspaceFile[], folders: WorkspaceFolder[] }
   * serialised as JSON strings keyed by "files" and "folders".
   */
  readonly yworkspace: Y.Map<string>;
  /** Room metadata. */
  readonly room: CollaborationRoom;
  /**
   * Returns the Y.Text for a given file ID.
   * Creates one lazily if it does not yet exist in the document.
   */
  getFileText(fileId: string): Y.Text;
  /** Tear down the document and free resources. */
  destroy(): void;
}

const DEFAULT_INITIAL_FILE: Pick<WorkspaceFile, "id" | "name" | "language"> = {
  id: crypto.randomUUID(),
  name: "main.ts",
  language: "typescript",
};

/**
 * Creates a new Yjs document instance bound to a collaboration room.
 *
 * The document contains:
 * - `yworkspace` Y.Map: serialised workspace tree (files + folders arrays).
 * - Per-file `Y.Text` instances keyed by file ID (via `doc.getText(fileId)`).
 *
 * On first creation the workspace is seeded with one root-level file
 * (defaults to `main.ts`). On subsequent joins the existing Yjs state
 * is replayed from the server so the seed is a no-op.
 */
export function createCollaborationDoc(
  options: CollaborationDocOptions,
): CollaborationDoc {
  const ydoc = new Y.Doc();
  const yworkspace = ydoc.getMap<string>("workspace");
  const initial = options.initialFile ?? DEFAULT_INITIAL_FILE;

  // Seed the workspace tree only when the map is empty (first creator).
  // Subsequent joins will receive the existing state from the sync-server.
  if (yworkspace.size === 0) {
    const initialFiles: WorkspaceFile[] = [
      {
        id: initial.id,
        name: initial.name,
        language: initial.language,
        parentFolderId: null,
      },
    ];
    const initialFolders: WorkspaceFolder[] = [];
    yworkspace.set("files", JSON.stringify(initialFiles));
    yworkspace.set("folders", JSON.stringify(initialFolders));
  }

  // Legacy ytext: the text for the very first file in the workspace.
  // After the sync-step-2 exchange the actual first file ID may differ,
  // so consumers should use getFileText() once they know the active file.
  const ytext = ydoc.getText(initial.id);

  function getFileText(fileId: string): Y.Text {
    return ydoc.getText(fileId);
  }

  return {
    ydoc,
    ytext,
    yworkspace,
    room: options.room,
    getFileText,
    destroy() {
      ydoc.destroy();
    },
  };
}
