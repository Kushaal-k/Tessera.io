import { useEffect, useRef } from "react";

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  {
    category: "Editor",
    items: [
      { keys: ["Ctrl", "S"], action: "Format document" },
      { keys: ["Ctrl", "Z"], action: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], action: "Redo" },
      { keys: ["Ctrl", "/"], action: "Toggle line comment" },
      { keys: ["Ctrl", "F"], action: "Find in file" },
      { keys: ["Ctrl", "G"], action: "Go to line" },
    ],
  },
  {
    category: "Execution",
    items: [
      { keys: ["Ctrl", "Enter"], action: "Run code" },
      { keys: ["Ctrl", "Shift", "C"], action: "Clear output panel" },
    ],
  },
  {
    category: "Collaboration",
    items: [
      { keys: ["Ctrl", "Shift", "P"], action: "Toggle collaborators sidebar" },
    ],
  },
  {
    category: "General",
    items: [
      { keys: ["?"], action: "Open this shortcut panel" },
      { keys: ["Escape"], action: "Close panel / dismiss overlay" },
    ],
  },
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save and restore focus
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="text-base font-semibold text-white tracking-tight">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-7 w-7 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition"
            aria-label="Close shortcuts panel"
          >
            ✕
          </button>
        </div>

        {/* Shortcut groups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--color-border)]">
          {SHORTCUTS.map((group) => (
            <div
              key={group.category}
              className="bg-[var(--color-surface)] px-6 py-4"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-tessera-400">
                {group.category}
              </p>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item.action}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-slate-300">{item.action}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      {item.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <kbd className="inline-block rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 py-0.5 text-xs font-mono font-medium text-slate-200 shadow-sm">
                            {key}
                          </kbd>
                          {i < item.keys.length - 1 && (
                            <span className="text-slate-600 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-border)] px-6 py-3">
          <p className="text-xs text-slate-500 text-center">
            Press <kbd className="inline-block rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1 py-0.5 text-xs font-mono text-slate-300">Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
