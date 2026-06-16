import type { ReactNode } from "react";

export interface SocraticAnnotationProps {
  readonly children?: ReactNode;
  readonly onClose: () => void;
  readonly className?: string;
  readonly title?: string;
}

export function SocraticAnnotation({
  children,
  onClose,
  className = "",
  title = "Socratic Mentor",
}: SocraticAnnotationProps) {
  return (
    <div className={`flex w-full flex-col rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg ${className}`}>
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2 bg-black/20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Close annotation"
        >
          ×
        </button>
      </div>
      <div className="p-3 text-sm text-slate-300">
        {children || (
          <div className="flex flex-col gap-2">
            <p>🤔 Let's think about this selected code.</p>
            <ul className="list-disc pl-5 text-slate-400 space-y-1 mt-2">
              <li>What is the primary goal of this snippet?</li>
              <li>Are there any edge cases we might be missing?</li>
              <li>How does this fit into the broader architecture?</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
