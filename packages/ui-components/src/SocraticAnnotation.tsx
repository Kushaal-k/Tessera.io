

export interface SocraticAnnotationProps {
  readonly title?: string;
  readonly message: string;
  readonly suggestions?: string[];
  readonly onClose?: () => void;
  readonly onSuggestionClick?: (suggestion: string) => void;
}

export function SocraticAnnotation({
  title = "Socratic Mentor",
  message,
  suggestions = [],
  onClose,
  onSuggestionClick,
}: SocraticAnnotationProps) {
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
    </div>
  );
}
