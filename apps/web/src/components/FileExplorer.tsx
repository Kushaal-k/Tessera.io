import { useState, useRef, useEffect, useCallback } from "react";
import type { WorkspaceFile, WorkspaceFolder } from "@tessera/shared-types";
import { FileIcon } from "./FileIcon.js";

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────

function IconFile({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M9 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5l-5-4zm-1 4V2l4 4H8V5z" />
    </svg>
  );
}

function IconFolder({ open, className }: { open?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      {open ? (
        <path d="M1.5 3h4.44l1.56 1.5H14.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V3.5a.5.5 0 0 1 .5-.5z" />
      ) : (
        <path d="M1.5 3h4.44l1.56 1.5H14.5a.5.5 0 0 1 .5.5v7.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9A.5.5 0 0 1 1.5 3z" />
      )}
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 2l3 3-8 8H3v-3l8-8z" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" />
    </svg>
  );
}

function IconChevron({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      className={`${className ?? ""} transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path d="M6 4l4 4-4 4V4z" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" d="M8 3v10M3 8h10" />
    </svg>
  );
}

// File icons are loaded from FileIcon.tsx

// ─────────────────────────────────────────────────────────────
// Inline rename input
// ─────────────────────────────────────────────────────────────

interface RenameInputProps {
  initialValue: string;
  onCommit(name: string): void;
  onCancel(): void;
}

function RenameInput({ initialValue, onCommit, onCancel }: RenameInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.select();
  }, []);

  return (
    <input
      ref={ref}
      defaultValue={initialValue}
      className="flex-1 min-w-0 bg-[var(--color-bg)] border border-tessera-500 rounded px-1 text-xs text-white outline-none"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const v = ref.current?.value.trim();
          if (v) onCommit(v);
        } else if (e.key === "Escape") {
          onCancel();
        }
      }}
      onBlur={() => {
        const v = ref.current?.value.trim();
        if (v) onCommit(v);
        else onCancel();
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// New-item input (inline at the bottom of a section)
// ─────────────────────────────────────────────────────────────

interface NewItemInputProps {
  placeholder: string;
  onCommit(name: string): void;
  onCancel(): void;
}

function NewItemInput({ placeholder, onCommit, onCancel }: NewItemInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <input
        ref={ref}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-[var(--color-bg)] border border-tessera-500/70 rounded px-1.5 py-0.5 text-xs text-white outline-none placeholder-slate-600 focus:border-tessera-500"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const v = ref.current?.value.trim();
            if (v) onCommit(v);
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
        onBlur={() => {
          const v = ref.current?.value.trim();
          if (v) onCommit(v);
          else onCancel();
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FileRow
// ─────────────────────────────────────────────────────────────

interface FileRowProps {
  file: WorkspaceFile;
  isActive: boolean;
  indent?: boolean;
  onSelect(): void;
  onRename(newName: string): void;
  onDelete(): void;
}

function FileRow({ file, isActive, indent, onSelect, onRename, onDelete }: FileRowProps) {
  const [renaming, setRenaming] = useState(false);

  return (
    <div
      className={`group flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-xs transition-colors select-none
        ${isActive
          ? "bg-tessera-500/15 text-tessera-300 border border-tessera-500/25"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
        }
        ${indent ? "ml-4" : ""}`}
      onClick={() => { if (!renaming) onSelect(); }}
      onDoubleClick={() => setRenaming(true)}
    >
      <FileIcon filename={file.name} className="h-3.5 w-3.5 flex-shrink-0" />

      {renaming ? (
        <RenameInput
          initialValue={file.name}
          onCommit={(n) => { onRename(n); setRenaming(false); }}
          onCancel={() => setRenaming(false)}
        />
      ) : (
        <span className="flex-1 truncate font-medium">{file.name}</span>
      )}

      {!renaming && (
        <span className="hidden group-hover:flex items-center gap-1 ml-auto flex-shrink-0">
          <button
            className="p-0.5 rounded hover:text-tessera-400 transition-colors"
            title="Rename"
            onClick={(e) => { e.stopPropagation(); setRenaming(true); }}
          >
            <IconPencil className="h-3 w-3" />
          </button>
          <button
            className="p-0.5 rounded hover:text-rose-400 transition-colors"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <IconTrash className="h-3 w-3" />
          </button>
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FolderRow
// ─────────────────────────────────────────────────────────────

interface FolderRowProps {
  folder: WorkspaceFolder;
  isOpen: boolean;
  onToggle(): void;
  onRename(newName: string): void;
  onDelete(): void;
}

function FolderRow({ folder, isOpen, onToggle, onRename, onDelete }: FolderRowProps) {
  const [renaming, setRenaming] = useState(false);

  return (
    <div
      className="group flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-xs text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-colors select-none border border-transparent"
      onClick={() => { if (!renaming) onToggle(); }}
      onDoubleClick={() => setRenaming(true)}
    >
      <IconChevron open={isOpen} className="h-3 w-3 flex-shrink-0 opacity-60" />
      <IconFolder open={isOpen} className="h-3.5 w-3.5 flex-shrink-0 text-yellow-400/80" />

      {renaming ? (
        <RenameInput
          initialValue={folder.name}
          onCommit={(n) => { onRename(n); setRenaming(false); }}
          onCancel={() => setRenaming(false)}
        />
      ) : (
        <span className="flex-1 truncate font-medium">{folder.name}</span>
      )}

      {!renaming && (
        <span className="hidden group-hover:flex items-center gap-1 ml-auto flex-shrink-0">
          <button
            className="p-0.5 rounded hover:text-tessera-400 transition-colors"
            title="Rename"
            onClick={(e) => { e.stopPropagation(); setRenaming(true); }}
          >
            <IconPencil className="h-3 w-3" />
          </button>
          <button
            className="p-0.5 rounded hover:text-rose-400 transition-colors"
            title="Delete folder and its files"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <IconTrash className="h-3 w-3" />
          </button>
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FileExplorer
// ─────────────────────────────────────────────────────────────

export interface FileExplorerProps {
  files: readonly WorkspaceFile[];
  folders: readonly WorkspaceFolder[];
  activeFileId: string | null;
  onSelectFile(id: string): void;
  onCreateFile(name: string, parentFolderId?: string | null): void;
  onCreateFolder(name: string): void;
  onRenameFile(id: string, newName: string): void;
  onRenameFolder(id: string, newName: string): void;
  onDeleteFile(id: string): void;
  onDeleteFolder(id: string): void;
}

type CreatingState =
  | { type: "file"; parentFolderId: string | null }
  | { type: "folder" }
  | null;

export function FileExplorer({
  files,
  folders,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRenameFile,
  onRenameFolder,
  onDeleteFile,
  onDeleteFolder,
}: FileExplorerProps) {
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState<CreatingState>(null);

  const toggleFolder = useCallback((id: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const rootFiles = files.filter((f) => f.parentFolderId === null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2 pb-2 border-b border-[var(--color-border)] mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Explorer
        </p>
        <div className="flex items-center gap-1">
          <button
            id="new-file-btn"
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="New File"
            onClick={() => setCreating({ type: "file", parentFolderId: null })}
          >
            <IconFile className="h-3.5 w-3.5" />
          </button>
          <button
            id="new-folder-btn"
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="New Folder"
            onClick={() => setCreating({ type: "folder" })}
          >
            <IconFolder className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
        {/* Root-level files */}
        {rootFiles.map((file) => (
          <FileRow
            key={file.id}
            file={file}
            isActive={file.id === activeFileId}
            onSelect={() => onSelectFile(file.id)}
            onRename={(n) => onRenameFile(file.id, n)}
            onDelete={() => onDeleteFile(file.id)}
          />
        ))}

        {/* New root file input */}
        {creating?.type === "file" && creating.parentFolderId === null && (
          <NewItemInput
            placeholder="filename.py"
            onCommit={(n) => { onCreateFile(n, null); setCreating(null); }}
            onCancel={() => setCreating(null)}
          />
        )}

        {/* Folders */}
        {folders.map((folder) => {
          const isOpen = openFolders.has(folder.id);
          const folderFiles = files.filter((f) => f.parentFolderId === folder.id);

          return (
            <div key={folder.id}>
              <FolderRow
                folder={folder}
                isOpen={isOpen}
                onToggle={() => toggleFolder(folder.id)}
                onRename={(n) => onRenameFolder(folder.id, n)}
                onDelete={() => onDeleteFolder(folder.id)}
              />

              {/* Folder contents */}
              {isOpen && (
                <div className="mt-0.5 space-y-0.5">
                  {folderFiles.map((file) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      isActive={file.id === activeFileId}
                      indent
                      onSelect={() => onSelectFile(file.id)}
                      onRename={(n) => onRenameFile(file.id, n)}
                      onDelete={() => onDeleteFile(file.id)}
                    />
                  ))}

                  {/* New file inside folder */}
                  {creating?.type === "file" &&
                    creating.parentFolderId === folder.id && (
                      <NewItemInput
                        placeholder="filename.py"
                        onCommit={(n) => { onCreateFile(n, folder.id); setCreating(null); }}
                        onCancel={() => setCreating(null)}
                      />
                    )}

                  {/* Add file to folder button */}
                  <button
                    className="ml-4 flex items-center gap-1 px-2 py-0.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
                    onClick={() => setCreating({ type: "file", parentFolderId: folder.id })}
                  >
                    <IconPlus className="h-2.5 w-2.5" /> Add file
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* New folder input */}
        {creating?.type === "folder" && (
          <NewItemInput
            placeholder="folder-name"
            onCommit={(n) => { onCreateFolder(n); setCreating(null); }}
            onCancel={() => setCreating(null)}
          />
        )}

        {/* Empty state */}
        {files.length === 0 && folders.length === 0 && !creating && (
          <div className="px-2 py-4 text-center text-xs text-slate-600">
            No files yet.
            <br />
            Click the icons above to get started.
          </div>
        )}
      </div>
    </div>
  );
}
