import { useMemo, useState, useEffect } from "react";
import { SidePanel } from "@tessera/ui-components";
import { CollaborativeEditor } from "./components/CollaborativeEditor.js";
import {
  useCollaboration,
  createDefaultParticipant,
} from "./hooks/useCollaboration.js";
import { isMacOS, getExecutionShortcutText } from "./utils/platformDetection.js";
import { setLocalParticipant, onPeersChanged, getRemotePeers } from "@tessera/collaboration";
import type { PeerState } from "@tessera/collaboration";
import type { SyncConnectionConfig, SupportedLanguage, ExecutionResult } from "@tessera/shared-types";
import { useDebouncedValue } from "./hooks/useDebouncedValue.js";
import { downloadTextFile } from "./utils/downloadUtils.js";

const SYNC_SERVER_URL = "http://localhost:4000";
const DEFAULT_ROOM = "default-room";

const FILE_NAMES: Record<SupportedLanguage, string> = {
  typescript: "main.ts",
  python: "main.py",
  cpp: "main.cpp",
  java: "Main.java",
  rust: "main.rs",
  go: "main.go",
};

export function App() {
  const participant = useMemo(() => createDefaultParticipant(), []);
  const [displayName, setDisplayName] = useState(participant.displayName);
  const debouncedName = useDebouncedValue(displayName, 250);
  const [language, setLanguage] = useState<SupportedLanguage>("typescript");
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

  const { ytext, awareness, connected, socket } = useCollaboration(config);

  const [knownUsers, setKnownUsers] = useState<Map<string, { id: string; displayName: string; cursorColor: string; online: boolean }>>(new Map());

  // Synchronize remote peers and maintain a local registry of seen collaborators (online / offline)
  useEffect(() => {
    if (!awareness) return;

    const updatePeers = (currentPeers: readonly PeerState[]) => {
      setKnownUsers((prev) => {
        const next = new Map(prev);

        // Mark all previously seen remote users as offline first
        for (const [id, user] of next.entries()) {
          if (id !== participant.id) {
            next.set(id, { ...user, online: false });
          }
        }

        // Add or update current online remote peers
        currentPeers.forEach((peer) => {
          if (peer.participant) {
            next.set(peer.participant.id, {
              id: peer.participant.id,
              displayName: peer.participant.displayName || "Anonymous",
              cursorColor: peer.participant.cursorColor || "#64748b",
              online: true,
            });
          }
        });

        // Ensure local user is always represented as online
        next.set(participant.id, {
          id: participant.id,
          displayName: displayName.trim() || "Anonymous",
          cursorColor: participant.cursorColor,
          online: true,
        });

        return next;
      });
    };

    // Set initial peers list
    updatePeers(getRemotePeers(awareness));

    // Listen to changes in the awareness state
    return onPeersChanged(awareness, (newPeers) => {
      updatePeers(newPeers);
    });
  }, [awareness, participant, displayName]);

  // Sync displayName into the shared awareness state whenever it changes.
  // TesseraSocketProvider is already subscribed to awareness "update" events,
  // so it will automatically propagate this to all connected peers.
  useEffect(() => {
    if (!awareness) return;
    setLocalParticipant(awareness, {
      ...participant,
      displayName: debouncedName.trim() || "Anonymous",
    });
  }, [awareness, participant, debouncedName]);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isExecutionShortcut = isMacOS() ? event.metaKey : event.ctrlKey;
      if (isExecutionShortcut && event.key === "Enter") {
        event.preventDefault();
        if (!isRunning && connected) {
          handleRunCode();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [socket, ytext, isRunning, connected]);

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
              <option value="go">Go</option>
            </select>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunCode}
            disabled={!connected || isRunning}
            title={`Run code (${getExecutionShortcutText()})`}
            className={`flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded transition shadow-sm ${isRunning
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

          {/* Collaborator Avatars */}
          {Array.from(knownUsers.values()).filter((u) => u.online).length > 1 && (
            <div className="flex items-center -space-x-1.5 overflow-hidden mr-2">
              {Array.from(knownUsers.values())
                .filter((u) => u.online)
                .map((u) => {
                  const initial = u.displayName.trim().substring(0, 1).toUpperCase() || "A";
                  const isLocal = u.id === participant.id;
                  return (
                    <div
                      key={u.id}
                      style={{ borderColor: u.cursorColor }}
                      className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 bg-slate-800 text-[10px] font-bold text-white shadow-sm ring-1 ring-slate-900 transition-transform duration-200 hover:scale-110 hover:z-10 cursor-pointer"
                      title={u.displayName + (isLocal ? " (You)" : "")}
                    >
                      {initial}
                    </div>
                  );
                })}
            </div>
          )}

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
        <aside className="w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-3 flex flex-col gap-4">
          {/* Explorer section */}
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

          {/* Display name section */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              You
            </p>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: participant.cursorColor }}
                aria-hidden="true"
              />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={32}
                placeholder="Display name"
                aria-label="Your display name"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-tessera-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Collaborators section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Collaborators
              </p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-tessera-500/15 text-tessera-400 border border-tessera-500/10">
                {Array.from(knownUsers.values()).filter(u => u.online).length} online
              </span>
            </div>
            
            <div className="mt-1 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {Array.from(knownUsers.values()).map((user) => {
                const isLocal = user.id === participant.id;
                return (
                  <div
                    key={user.id}
                    className="group flex items-center justify-between rounded-md p-1.5 transition-all duration-150 hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Online Status Dot */}
                      <span className="relative flex h-2 w-2 shrink-0">
                        {user.online ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                          </>
                        ) : (
                          <span className="relative inline-block h-2 w-2 rounded-full bg-slate-600"></span>
                        )}
                      </span>
                      
                      {/* Color indicator and display name */}
                      <span
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: user.cursorColor }}
                      />
                      <span
                        className={`text-xs truncate font-medium ${
                          user.online ? "text-slate-200" : "text-slate-500 line-through decoration-slate-600/50"
                        }`}
                        title={user.displayName}
                      >
                        {user.displayName}
                        {isLocal && <span className="text-[10px] text-slate-400 font-normal ml-1">(you)</span>}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[9px] font-semibold uppercase px-1 rounded-sm ${
                      user.online 
                        ? "text-emerald-400 bg-emerald-500/10" 
                        : "text-slate-500 bg-slate-500/10"
                    }`}>
                      {user.online ? "online" : "offline"}
                    </span>
                  </div>
                );
              })}
              
              {knownUsers.size === 0 && (
                <div className="text-xs text-slate-500 italic py-2">
                  No collaborators detected.
                </div>
              )}
            </div>
          </div>

          {/* Editor Settings section */}
          <div className="mt-auto border-t border-[var(--color-border)] pt-4">
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
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-tessera-600"></div>
                </label>

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
