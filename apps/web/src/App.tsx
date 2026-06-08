import { useMemo, useState, useEffect } from "react";
import { SidePanel } from "@tessera/ui-components";
import { CollaborativeEditor } from "./components/CollaborativeEditor.js";
import {
  useCollaboration,
  createDefaultParticipant,
} from "./hooks/useCollaboration.js";
import type { SyncConnectionConfig, SupportedLanguage, ExecutionResult } from "@tessera/shared-types";

const SYNC_SERVER_URL = "http://localhost:4000";
const DEFAULT_ROOM = "default-room";

const FILE_NAMES: Record<SupportedLanguage, string> = {
  typescript: "main.ts",
  python: "main.py",
  cpp: "main.cpp",
};

export function App() {
  const participant = useMemo(() => createDefaultParticipant(), []);
  const [language, setLanguage] = useState<SupportedLanguage>("typescript");
  const [isRunning, setIsRunning] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [output, setOutput] = useState<ExecutionResult | null>(null);

  const config = useMemo<SyncConnectionConfig>(
    () => ({
      serverUrl: SYNC_SERVER_URL,
      roomId: DEFAULT_ROOM,
      participant,
    }),
    [participant],
  );

  const { ytext, awareness, connected, socket } = useCollaboration(config);

  useEffect(() => {
    if (!socket) return;

    const handleExecutionResult = (result: ExecutionResult) => {
      setOutput(result);
      setIsRunning(false);
    };

    socket.on("execution-result", handleExecutionResult);

    return () => {
      socket.off("execution-result", handleExecutionResult);
    };
  }, [socket]);

  const handleRunCode = () => {
    if (!socket || !ytext || isRunning) return;
    setIsRunning(true);
    setOutput(null);
    socket.emit("execute-code", {
      code: ytext.toString(),
      language,
    });
  };

  const handleDownload = () => {
    if (!ytext) return;
    const content = ytext.toString();
    const fileName = FILE_NAMES[language];
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2 bg-[var(--color-surface)]">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Tessera<span className="text-tessera-500">.io</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-[var(--color-bg)] text-sm text-white border border-[var(--color-border)] rounded px-2 py-1 focus:outline-none focus:border-tessera-500 font-medium"
            >
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunCode}
            disabled={!connected || isRunning}
            className={`flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded transition shadow-sm ${
              isRunning
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : !connected
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
                Running...
              </>
            ) : (
              <>
                <span className="text-xs">▶</span> Run
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAiPanelOpen(true)}
            className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-sm font-semibold text-slate-200 transition hover:border-tessera-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-tessera-500"
          >
            AI Panel
          </button>

          {/* Connection Indicator */}
          <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-4">
            <span
              className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400 animate-pulse"}`}
            />
            <span className="text-xs text-slate-400 font-medium">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Explorer
          </p>
          <div className="mt-3 space-y-1">
            <div className="rounded px-2 py-1 text-sm font-medium text-tessera-400 bg-tessera-500/10 border border-tessera-500/20">
              📄 {FILE_NAMES[language]}
            </div>
            <button
              onClick={handleDownload}
              disabled={!ytext}
              className="mt-2 flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-400 hover:text-white hover:bg-[var(--color-bg)] rounded transition w-full"
              title="Download file"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </aside>

        {/* Editor */}
        <main className="flex-1 overflow-hidden">
          {ytext && awareness ? (
            <CollaborativeEditor ytext={ytext} awareness={awareness} language={language} />
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

      {/* Output panel */}
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
              <span className="text-slate-400">
                Duration: {output.durationMs}ms
              </span>
              {output.exitCode !== null && (
                <span className="text-slate-400">
                  Exit Code: {output.exitCode}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto font-mono text-xs p-2 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
          {isRunning ? (
            <span className="text-tessera-400 animate-pulse">Running execution sandbox...</span>
          ) : output ? (
            <div className="space-y-1 whitespace-pre-wrap">
              {output.stdout && <div className="text-emerald-300">{output.stdout}</div>}
              {output.stderr && <div className="text-rose-400 font-semibold">{output.stderr}</div>}
              {!output.stdout && !output.stderr && <div className="text-slate-500 italic">No output returned (Process completed with exit code {output.exitCode}).</div>}
            </div>
          ) : (
            <span className="text-slate-500">Ready to execute. Write some code and click "Run".</span>
          )}
        </div>
      </div>

      <SidePanel
        open={isAiPanelOpen}
        title="AI Chat"
        description={`Context: ${FILE_NAMES[language]}`}
        onClose={() => setIsAiPanelOpen(false)}
      >
        <div className="rounded border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-sm text-slate-400">
          Ready for editor context.
        </div>
      </SidePanel>
    </div>
  );
}
