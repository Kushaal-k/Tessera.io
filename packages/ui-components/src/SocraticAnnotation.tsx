import type { ReactNode } from "react";

export interface SocraticAnnotationProps {
  readonly title?: string;
  readonly children: ReactNode;
  readonly onDismiss?: () => void;
  readonly className?: string;
}

export function SocraticAnnotation({
  title = "Socratic Mentor",
  children,
  onDismiss,
  className = "",
}: SocraticAnnotationProps) {
  return (
    <div className={`flex w-full flex-col overflow-hidden rounded-md border border-tessera-500/30 bg-[var(--color-bg)] shadow-lg ${className}`}>
      <div className="flex items-center justify-between border-b border-tessera-500/20 bg-tessera-500/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm leading-none">✨</span>
          <h3 className="text-sm font-medium text-tessera-400">{title}</h3>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="grid h-6 w-6 place-items-center rounded text-slate-400 transition-colors hover:bg-tessera-500/20 hover:text-white"
            aria-label="Dismiss mentor"
          >
            ×
          </button>
        ) : null}
      </div>
      <div className="p-3 text-sm text-slate-300">
        {children}
      </div>
    </div>
  );
}
