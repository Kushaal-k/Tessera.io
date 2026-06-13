import { useMemo, useState, useEffect } from "react";
import { SidePanel } from "@tessera/ui-components";
import { CollaborativeEditor } from "./components/CollaborativeEditor.js";
import {
  useCollaboration,
  createDefaultParticipant,
} from "./hooks/useCollaboration.js";
import type { SyncConnectionConfig, SupportedLanguage, ExecutionResult } from "@tessera/shared-types";
import { downloadTextFile } from "./utils/downloadUtils.js";

const SYNC_SERVER_URL = "http://localhost:4000";
const DEFAULT_ROOM = "default-room";

const FILE_NAMES: Record<SupportedLanguage, string> = {
  typescript: "main.ts",
  python: "main.py",
  cpp: "main.cpp",
  java: "Main.java",
  rust: "main.rs"
};

export function App() {
  const participant = useMemo(() => createDefaultParticipant(), []);
  const [language, setLanguage] = useState<SupportedLanguage>("typescript");
  const [isRunning, setIsRunning] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  
  // Display name state with localStorage persistence
  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem('displayName') || `User-${Math.floor(Math.random() * 1000)}`;
  });
  const [isNameFocused, setIsNameFocused] = useState(false);

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

  // Update awareness when display name changes
  useEffect(() => {
    if (awareness) {
      // Get current user data
      const localState = awareness.getLocalState();
      awareness.setLocalState({
        ...localState,
        user: {
          ...localState?.user,
          name: displayName,
        },
      });
      // Save to localStorage
      localStorage.setItem('displayName', displayName);
    }
  }, [displayName, awareness]);

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
    downloadTextFile(ytext.toString(), FILE_NAMES[language]);
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
              <option value="java">Java</option>
              <option value="rust">Rust</option>
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
          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!ytext}
            className="flex items-center justify-center p-1.5 text-slate-400 hover:text-white hover:bg-[var(--color-bg)] rounded transition"
            title={`Download ${FILE_NAMES[language]}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
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
        <aside className="w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-3 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Explorer
            </p>
            <div className="mt-3 space-y-1">
              <div className="rounded px-2 py-1 text-sm font-medium text-tessera-400 bg-tessera-500/10 border border-tessera-500/20">
                📄 {FILE_NAMES[language]}
              </div>
            </div>
          </div>

          {/* ENHANCED DISPLAY NAME SECTION */}
          <div className="border-t border-[var(--color-border)] pt-4">
            {/* Header with icon and badge */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-tessera-500 to-tessera-600 flex items-center justify-center shadow-lg">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-tessera-400 to-tessera-300 bg-clip-text text-transparent">
                Your Identity
              </p>
              <span className="text-[10px] text-slate-500 ml-auto bg-slate-800/50 px-1.5 py-0.5 rounded-full">
                ✏️ editable
              </span>
            </div>
            
            {/* Name input with clear button */}
            <div className="relative group">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
                placeholder="Enter your display name"
                maxLength={30}
                className={`w-full bg-gradient-to-r from-[var(--color-bg)] to-[var(--color-surface)] text-sm text-white rounded-lg px-3 py-2 transition-all duration-200 outline-none ${
                  isNameFocused 
                    ? "border-2 border-tessera-500 ring-2 ring-tessera-500/20" 
                    : "border border-[var(--color-border)] hover:border-tessera-500/50"
                }`}
              />
              {displayName && displayName !== "User-" && (
                <button
                  onClick={() => setDisplayName('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110"
                  title="Clear name"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Live preview and status */}
            <div className="mt-3 space-y-2">
              {/* Preview badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-[var(--color-bg)] rounded-full px-2 py-0.5 border border-[var(--color-border)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[10px] font-mono text-slate-400">live preview</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {displayName.length}/30
                </div>
              </div>
              
              {/* Current display name preview */}
              <div className="bg-gradient-to-r from-tessera-500/5 to-tessera-600/5 rounded-lg p-2 border border-tessera-500/20">
                <p className="text-[10px] text-slate-400 mb-1">others see you as</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-tessera-400 to-tessera-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white truncate flex-1">
                    {displayName || "Anonymous"}
                  </p>
                  {displayName && (
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Editor Settings Section */}
          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Editor Settings
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label htmlFor="minimap-toggle" className="text-xs font-medium text-slate-300 cursor-pointer select-none">
                  Show Minimap
                </label>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    id="minimap-toggle"
                    checked={showMinimap}
                    onChange={(e) => setShowMinimap(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-tessera-600 cursor-pointer"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Font Size</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFontSize((prev) => Math.max(10, prev - 1))}
                    disabled={fontSize <= 10}
                    className="w-6 h-6 flex items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-slate-300 hover:text-white hover:border-tessera-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)] disabled:hover:text-slate-300 select-none transition-all active:scale-95"
                  >
                    A-
                  </button>
                  <span className="text-xs font-mono font-medium text-slate-200 min-w-[28px] text-center">
                    {fontSize}px
                  </span>
                  <button
                    onClick={() => setFontSize((prev) => Math.min(24, prev + 1))}
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
          {ytext && awareness ? (
            <CollaborativeEditor
              ytext={ytext}
              awareness={awareness}
              language={language}
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
                <span className={output.exitCode === 0 ? "text-emerald-400" : "text-rose-400"}>
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