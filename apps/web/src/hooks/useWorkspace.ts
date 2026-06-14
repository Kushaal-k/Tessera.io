import { useState, useEffect, useCallback, useRef } from "react";
import * as Y from "yjs";
import type {
  WorkspaceFile,
  WorkspaceFolder,
  SupportedLanguage,
} from "@tessera/shared-types";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const EXTENSION_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  ts: "typescript",
  tsx: "typescript",
  js: "typescript",
  py: "python",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  java: "java",
  rs: "rust",
};

/** Derive the SupportedLanguage from a filename extension. */
export function languageFromFilename(name: string): SupportedLanguage {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_LANGUAGE[ext] ?? "typescript";
}

function parseFiles(raw: string | undefined): WorkspaceFile[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WorkspaceFile[];
  } catch {
    return [];
  }
}

function parseFolders(raw: string | undefined): WorkspaceFolder[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WorkspaceFolder[];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface UseWorkspaceReturn {
  /** Current list of files in the workspace. */
  readonly files: readonly WorkspaceFile[];
  /** Current list of folders in the workspace. */
  readonly folders: readonly WorkspaceFolder[];
  /** ID of the currently open file. */
  readonly activeFileId: string | null;
  /** Switch the editor to a different file. */
  setActiveFileId(id: string): void;
  /** Y.Text for the active file (to bind to Monaco). */
  readonly activeYText: Y.Text | null;
  /**
   * Create a new file. Returns the new file's ID.
   * @param name  e.g. "reader.py"
   * @param parentFolderId  folder ID, or null for root level
   */
  createFile(name: string, parentFolderId?: string | null): string;
  /** Create a new folder. Returns the new folder's ID. */
  createFolder(name: string): string;
  /** Rename a file by ID. */
  renameFile(id: string, newName: string): void;
  /** Rename a folder by ID. */
  renameFolder(id: string, newName: string): void;
  /**
   * Delete a file by ID.
   * If the deleted file is active, the hook automatically selects another.
   */
  deleteFile(id: string): void;
  /**
   * Delete a folder and all files inside it.
   */
  deleteFolder(id: string): void;
  /** Get the Y.Text for any file by its ID (for execution collection). */
  getYText(fileId: string): Y.Text | null;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

/**
 * Manages the multi-file workspace backed by a shared Yjs Y.Map.
 * All mutations are synchronised to every collaborator automatically.
 *
 * @param ydoc     The shared Yjs document (from useCollaboration).
 * @param yworkspace  The Y.Map("workspace") from the collaboration doc.
 */
export function useWorkspace(
  ydoc: Y.Doc | null,
  yworkspace: Y.Map<string> | null,
): UseWorkspaceReturn {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeYText, setActiveYText] = useState<Y.Text | null>(null);

  // Keep track of the initial file ID so we can set it as active on first load.
  const initialised = useRef(false);

  // ── Sync from Yjs ──────────────────────────────────────────
  useEffect(() => {
    if (!yworkspace) return;

    const sync = () => {
      const newFiles = parseFiles(yworkspace.get("files"));
      const newFolders = parseFolders(yworkspace.get("folders"));
      setFiles(newFiles);
      setFolders(newFolders);

      // Auto-select the first file on initial load.
      if (!initialised.current && newFiles.length > 0) {
        initialised.current = true;
        setActiveFileId(newFiles[0]!.id);
      }
    };

    sync(); // Run once immediately in case the map is already populated.
    yworkspace.observe(sync);

    return () => {
      yworkspace.unobserve(sync);
    };
  }, [yworkspace]);

  // ── Sync active Y.Text ─────────────────────────────────────
  useEffect(() => {
    if (!ydoc || !activeFileId) {
      setActiveYText(null);
      return;
    }
    setActiveYText(ydoc.getText(activeFileId));
  }, [ydoc, activeFileId]);

  // ── Helpers ────────────────────────────────────────────────

  const saveFiles = useCallback(
    (updated: WorkspaceFile[]) => {
      yworkspace?.set("files", JSON.stringify(updated));
    },
    [yworkspace],
  );

  const saveFolders = useCallback(
    (updated: WorkspaceFolder[]) => {
      yworkspace?.set("folders", JSON.stringify(updated));
    },
    [yworkspace],
  );

  // ── Mutations ──────────────────────────────────────────────

  const createFile = useCallback(
    (name: string, parentFolderId: string | null = null): string => {
      const id = crypto.randomUUID();
      const file: WorkspaceFile = {
        id,
        name,
        language: languageFromFilename(name),
        parentFolderId,
      };
      const current = parseFiles(yworkspace?.get("files"));
      saveFiles([...current, file]);
      setActiveFileId(id);
      return id;
    },
    [yworkspace, saveFiles],
  );

  const createFolder = useCallback(
    (name: string): string => {
      const id = crypto.randomUUID();
      const folder: WorkspaceFolder = { id, name };
      const current = parseFolders(yworkspace?.get("folders"));
      saveFolders([...current, folder]);
      return id;
    },
    [yworkspace, saveFolders],
  );

  const renameFile = useCallback(
    (id: string, newName: string) => {
      const current = parseFiles(yworkspace?.get("files"));
      saveFiles(
        current.map((f) =>
          f.id === id
            ? { ...f, name: newName, language: languageFromFilename(newName) }
            : f,
        ),
      );
    },
    [yworkspace, saveFiles],
  );

  const renameFolder = useCallback(
    (id: string, newName: string) => {
      const current = parseFolders(yworkspace?.get("folders"));
      saveFolders(current.map((f) => (f.id === id ? { ...f, name: newName } : f)));
    },
    [yworkspace, saveFolders],
  );

  const deleteFile = useCallback(
    (id: string) => {
      const current = parseFiles(yworkspace?.get("files"));
      const updated = current.filter((f) => f.id !== id);
      saveFiles(updated);
      // If the deleted file was active, select another.
      setActiveFileId((prev) => {
        if (prev !== id) return prev;
        return updated[0]?.id ?? null;
      });
    },
    [yworkspace, saveFiles],
  );

  const deleteFolder = useCallback(
    (id: string) => {
      const currentFiles = parseFiles(yworkspace?.get("files"));
      const currentFolders = parseFolders(yworkspace?.get("folders"));
      const updatedFiles = currentFiles.filter((f) => f.parentFolderId !== id);
      const updatedFolders = currentFolders.filter((f) => f.id !== id);
      saveFiles(updatedFiles);
      saveFolders(updatedFolders);
      // If active file was inside this folder, select another.
      setActiveFileId((prev) => {
        const wasInFolder = currentFiles.some(
          (f) => f.id === prev && f.parentFolderId === id,
        );
        if (!wasInFolder) return prev;
        return updatedFiles[0]?.id ?? null;
      });
    },
    [yworkspace, saveFiles, saveFolders],
  );

  const getYText = useCallback(
    (fileId: string): Y.Text | null => {
      if (!ydoc) return null;
      return ydoc.getText(fileId);
    },
    [ydoc],
  );

  return {
    files,
    folders,
    activeFileId,
    setActiveFileId,
    activeYText,
    createFile,
    createFolder,
    renameFile,
    renameFolder,
    deleteFile,
    deleteFolder,
    getYText,
  };
}
