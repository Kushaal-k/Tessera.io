import { useMemo, useState, useEffect } from "react";
import { SidePanel } from "@tessera/ui-components";
import { CollaborativeEditor } from "./components/CollaborativeEditor.js";
import { FileExplorer } from "./components/FileExplorer.js";
import { FileIcon } from "./components/FileIcon.js";
import {
  useCollaboration,
  createDefaultParticipant,
} from "./hooks/useCollaboration.js";
import { useWorkspace } from "./hooks/useWorkspace.js";
import type { SyncConnectionConfig, ExecutionResult, ExecutionFile } from "@tessera/shared-types";
import { downloadTextFile } from "./utils/downloadUtils.js";

const SYNC_SERVER_URL = "http://localhost:4000";
const DEFAULT_ROOM = "default-room";

export function App() {
  const participant = useMemo(() => createDefaultParticipant(), []);
  const [isRunning, setIsRunning] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);
  const [fontSize, setFontSize] = useState(14);

  const config = useMemo<SyncConnectionConfig>(
    () => ({
      serverUrl: SYNC_SERVER_URL,
      roomId: DEFAULT_ROOM,
      participant,
    }),
    [participant],
  );

  const { ydoc, yworkspace, awareness, connected, socket } = useCollaboration(config);

  const {
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
  } = useWorkspace(ydoc, yworkspace);

  // Derive language from the active file's extension.
  const activeFile = files.find((f) => f.id === activeFileId) ?? null;
  const activeLanguage = activeFile?.language ?? "typescript";

  // Derive Monaco editor language from file name to support plaintext/json/csv
  const editorLanguage = useMemo(() => {
    if (!activeFile) return "plaintext";
    const ext = activeFile.name.split(".").pop()?.toLowerCase() ?? "";
    switch (ext) {
      case "ts":
      case "tsx":
      case "js":
      case "jsx":
        return "typescript";
      case "py":
        return "python";
      case "cpp":
      case "cc":
      case "cxx":
      case "h":
      case "hpp":
        return "cpp";
      case "java":
        return "java";
      case "rs":
        return "rust";
      case "json":
        return "json";
      case "md":
        return "markdown";
      case "csv":
      case "txt":
      case "log":
        return "plaintext";
      default:
        return "plaintext";
    }
  }, [activeFile]);

  // ── Execution result handler ────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handleResult = (result: ExecutionResult) => {
      setOutput(result);
      setIsRunning(false);
    };
    socket.on("execution-result", handleResult);
    return () => { socket.off("execution-result", handleResult); };
  }, [socket]);

  // ── Run code ───────────────────────────────────────────────

  const handleRunCode = () => {
    if (!socket || !activeYText || !activeFile || isRunning) return;
    setIsRunning(true);
    setOutput(null);

    // Collect all workspace files for the sandbox.
    const allFiles: ExecutionFile[] = files.map((f) => ({
      name: f.name,
      content: getYText(f.id)?.toString() ?? "",
    }));

    socket.emit("execute-code", {
      code: activeYText.toString(),
      language: activeLanguage,
      files: allFiles,
    });
  };

  // ── Download active file ───────────────────────────────────
  const handleDownload = () => {
    if (!activeYText || !activeFile) return;
    downloadTextFile(activeYText.toString(), activeFile.name);
  };

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg)]">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2 bg-[var(--color-surface)]">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Tessera<span className="text-tessera-500">.io</span>
          </h1>
          {/* Active file breadcrumb */}
          {activeFile && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              /
              <FileIcon filename={activeFile.name} className="h-3.5 w-3.5" />
              <span className="text-slate-300">{activeFile.name}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Run Button */}
          <button
            id="run-code-btn"
            onClick={handleRunCode}
            disabled={!connected || isRunning || !activeFile}
            className={`flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded transition shadow-sm ${
              isRunning
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : !connected || !activeFile
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-tessera-600 hover:bg-tessera-500 text-white cursor-pointer active:scale-95"
              }`}
          >
            {isRunning ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running…
              </>
            ) : (
              <>
                <span className="text-xs">▶</span> Run
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            id="download-btn"
            onClick={handleDownload}
            disabled={!activeYText}
            className="flex items-center justify-center p-1.5 text-slate-400 hover:text-white hover:bg-[var(--color-bg)] rounded transition"
            title={`Download ${activeFile?.name ?? "file"}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* AI Panel */}
          <button
            id="ai-panel-btn"
            type="button"
            onClick={() => setIsAiPanelOpen(true)}
            className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-sm font-semibold text-slate-200 transition hover:border-tessera-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-tessera-500"
          >
            AI Panel
          </button>

          {/* Connection Indicator */}
          <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-3">
            <span
              className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400 animate-pulse"}`}
            />
            <span className="text-xs text-slate-400 font-medium">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — File Explorer */}
        <aside className="w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col overflow-hidden">
          {/* Explorer tree */}
          <div className="flex-1 overflow-hidden p-2">
            <FileExplorer
              files={files}
              folders={folders}
              activeFileId={activeFileId}
              onSelectFile={setActiveFileId}
              onCreateFile={createFile}
              onCreateFolder={createFolder}
              onRenameFile={renameFile}
              onRenameFolder={renameFolder}
              onDeleteFile={deleteFile}
              onDeleteFolder={deleteFolder}
            />
          </div>

          {/* Editor Settings — pinned to bottom */}
          <div className="border-t border-[var(--color-border)] p-3 flex-shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Editor Settings
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label htmlFor="minimap-toggle" className="text-xs font-medium text-slate-300 cursor-pointer select-none">
                  Show Minimap
                </label>
                <label
                  htmlFor="minimap-toggle"
                  className="relative inline-flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id="minimap-toggle"
                    checked={showMinimap}
                    onChange={(e) => setShowMinimap(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-tessera-600 cursor-pointer" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Font Size</span>
                <div className="flex items-center gap-1.5">
                  <button
                    id="font-decrease-btn"
                    onClick={() => setFontSize((p) => Math.max(10, p - 1))}
                    disabled={fontSize <= 10}
                    className="w-6 h-6 flex items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-slate-300 hover:text-white hover:border-tessera-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)] disabled:hover:text-slate-300 select-none transition-all active:scale-95"
                  >
                    A-
                  </button>
                  <span className="text-xs font-mono font-medium text-slate-200 min-w-[28px] text-center">
                    {fontSize}px
                  </span>
                  <button
                    id="font-increase-btn"
                    onClick={() => setFontSize((p) => Math.min(24, p + 1))}
                    disabled={fontSize >= 24}
                    className="w-6 h-6 flex items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-slate-300 hover:text-white hover:border-tessera-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)] disabled:hover:text-slate-300 select-none transition-all active:scale-95"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Editor */}
        <main className="flex-1 overflow-hidden">
          {activeYText && awareness ? (
            <CollaborativeEditor
              ytext={activeYText}
              awareness={awareness}
              language={editorLanguage}
              showMinimap={showMinimap}
              fontSize={fontSize}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 font-medium bg-[var(--color-bg)]">
              <svg className="animate-spin h-8 w-8 text-tessera-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connecting to collaboration server…
            </div>
          )}
        </main>
      </div>

      {/* ── Output panel ───────────────────────────────────────── */}
      <div className="h-56 shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col p-3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Execution Output
          </p>
          {output && (
            <div className="flex gap-4 text-xs font-medium">
              <span className={output.status === "completed" ? "text-emerald-400" : "text-rose-400"}>
                Status: {output.status}
              </span>
              <span className="text-slate-400">Duration: {output.durationMs}ms</span>
              {output.exitCode !== null && (
                <span className={output.exitCode === 0 ? "text-emerald-400" : "text-rose-400"}>
                  Exit Code: {output.exitCode}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto font-mono text-xs p-2 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
          {isRunning ? (
            <span className="text-tessera-400 animate-pulse">Running execution sandbox…</span>
          ) : output ? (
            <div className="space-y-1 whitespace-pre-wrap">
              {output.stdout && <div className="text-emerald-300">{output.stdout}</div>}
              {output.stderr && <div className="text-rose-400 font-semibold">{output.stderr}</div>}
              {!output.stdout && !output.stderr && (
                <div className="text-slate-500 italic">
                  No output returned (Process completed with exit code {output.exitCode}).
                </div>
              )}
            </div>
          ) : (
            <span className="text-slate-500">Ready to execute. Open a file and click "Run".</span>
          )}
        </div>
      </div>

      {/* ── AI Side Panel ──────────────────────────────────────── */}
      <SidePanel
        open={isAiPanelOpen}
        title="AI Chat"
        description={`Context: ${activeFile?.name ?? "no file"}`}
        onClose={() => setIsAiPanelOpen(false)}
      >
        <div className="rounded border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-sm text-slate-400">
          Ready for editor context.
        </div>
      </SidePanel>
    </div>
  );
}
