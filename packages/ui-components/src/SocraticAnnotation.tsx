

import React, { useState } from "react";

export interface SocraticAnnotationProps {
  readonly title?: string;
  readonly message: string;
  readonly suggestions?: string[];
  readonly onClose?: () => void;
  readonly onSuggestionClick?: (suggestion: string) => void;
  readonly onSubmit?: (text: string) => void;
}

export function SocraticAnnotation({
  title = "Socratic Mentor",
  message,
  suggestions = [],
  onClose,
  onSuggestionClick,
  onSubmit,
}: SocraticAnnotationProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onSubmit) {
      onSubmit(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="flex w-full flex-col rounded-md border border-tessera-500/30 bg-[var(--color-surface)] shadow-lg" style={{ boxSizing: 'border-box' }}>
      <div className="mb-2 flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-tessera-500/20 text-xs">
            💡
          </span>
          <h3 className="text-sm font-semibold text-tessera-400">{title}</h3>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        ) : null}
      </div>
      <div className="px-4 py-3 text-sm text-slate-200 leading-relaxed">
        <p>{message}</p>
      </div>
      {suggestions && suggestions.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-2 px-4 pb-4">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSuggestionClick?.(suggestion)}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-tessera-500 hover:text-tessera-300 cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
      
      <div className="border-t border-[var(--color-border)] bg-slate-900/30 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue((e.target as any).value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:border-tessera-500 focus:outline-none focus:ring-1 focus:ring-tessera-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="rounded-md bg-tessera-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-tessera-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
