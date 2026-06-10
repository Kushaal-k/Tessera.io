import type { ReactNode } from "react";

export interface SidePanelProps {
  readonly open: boolean;
  readonly title: string;
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly description?: string;
  readonly footer?: ReactNode;
  readonly className?: string;
}

export function SidePanel({
  open,
  title,
  children,
  onClose,
  description,
  footer,
  className = "",
}: SidePanelProps) {
  return (
    <aside
      aria-hidden={!open}
      aria-label={title}
      inert={!open ? true : undefined}
      className={`fixed inset-y-0 right-0 z-40 flex w-full max-w-md transform flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl shadow-black/40 transition-transform duration-200 ease-out ${
        open ? "translate-x-0" : "pointer-events-none translate-x-full"
      } ${className}`}
    >
      <header className="flex min-h-14 items-start justify-between gap-4 border-b border-[var(--color-border)] px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-white">{title}</h2>
          {description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={`Close ${title}`}
          onClick={onClose}
          className="grid h-8 w-8 shrink-0 place-items-center rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-lg leading-none text-slate-300 transition hover:border-tessera-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-tessera-500"
        >
          ×
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>

      {footer ? (
        <footer className="border-t border-[var(--color-border)] px-4 py-3">
          {footer}
        </footer>
      ) : null}
    </aside>
  );
}
