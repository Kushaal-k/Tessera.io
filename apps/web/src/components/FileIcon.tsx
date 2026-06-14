export interface FileIconProps {
  filename: string;
  className?: string;
}

export function FileIcon({ filename, className }: FileIconProps) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "ts":
    case "tsx":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={className ?? "h-3.5 w-3.5 flex-shrink-0"}>
          <rect width="16" height="16" rx="2.5" fill="#3178C6" />
          <text x="14.5" y="13" fill="white" fontSize="8" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" textAnchor="end">TS</text>
        </svg>
      );
    case "js":
    case "jsx":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={className ?? "h-3.5 w-3.5 flex-shrink-0"}>
          <rect width="16" height="16" rx="2.5" fill="#F7DF1E" />
          <text x="14.5" y="13" fill="black" fontSize="8" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" textAnchor="end">JS</text>
        </svg>
      );
    case "py":
      return (
        <svg viewBox="0 0 16 16" className={className ?? "h-3.5 w-3.5 flex-shrink-0"}>
          <path d="M8 0A4 4 0 0 0 4 4v1h4v1H3a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h1v-1a2 2 0 0 1 2-2h4a2 2 0 0 0 2-2V7a3 3 0 0 0-3-3H9V3a1 1 0 0 1 1-1h1V0H8z" fill="#3776AB" />
          <path d="M8 16a4 4 0 0 0 4-4v-1H8v-1h5a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3h-1v1a2 2 0 0 1-2 2H6a2 2 0 0 0-2 2v3a3 3 0 0 0 3 3h2v1a1 1 0 0 1-1 1H5v2h3z" fill="#FFD343" />
        </svg>
      );
    case "cpp":
    case "cc":
    case "cxx":
    case "h":
    case "hpp":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={className ?? "h-3.5 w-3.5 flex-shrink-0"}>
          <rect width="16" height="16" rx="2.5" fill="#00599C" />
          <text x="8" y="11" fill="white" fontSize="7" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" textAnchor="middle">C++</text>
        </svg>
      );
    case "java":
      return (
        <svg viewBox="0 0 16 16" className={className ?? "h-3.5 w-3.5 flex-shrink-0"} fill="currentColor" style={{ color: "#E76F51" }}>
          <path d="M4 1.5c.2-.5.6-1 1-1 .5 0 .8.5.8 1 0 .8-.8 1.5-.8 1.5s-.8-.7-.8-1.5zm3-.5c.2-.5.6-1 1-1 .5 0 .8.5.8 1 0 .8-.8 1.5-.8 1.5s-.8-.7-.8-1.5z" />
          <path d="M2 5h8v4.5C10 11.4 8.4 13 6.5 13H5.5C3.6 13 2 11.4 2 9.5V5zm9 1h1c1.1 0 2 .9 2 2s-.9 2-2 2h-1V6z" />
          <path d="M1 14h11v1H1v-1z" />
        </svg>
      );
    case "rs":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={className ?? "h-3.5 w-3.5 flex-shrink-0"}>
          <rect width="16" height="16" rx="2.5" fill="#E45649" />
          <text x="8" y="11" fill="white" fontSize="8" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" textAnchor="middle">RS</text>
        </svg>
      );
    case "csv":
      return (
        <svg viewBox="0 0 16 16" className={className ?? "h-3.5 w-3.5 flex-shrink-0"} fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#107C41" }}>
          <rect x="2" y="2" width="12" height="12" rx="1.5" />
          <line x1="2" y1="6" x2="14" y2="6" />
          <line x1="2" y1="10" x2="14" y2="10" />
          <line x1="7" y1="2" x2="7" y2="14" />
        </svg>
      );
    case "json":
      return (
        <svg viewBox="0 0 16 16" className={className ?? "h-3.5 w-3.5 flex-shrink-0"} fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#F7A800" }}>
          <rect x="2" y="2" width="12" height="12" rx="1.5" opacity="0.3" />
          <text x="8" y="11.5" fill="#F7A800" fontSize="10" fontFamily="Courier New, monospace" fontWeight="bold" stroke="none" textAnchor="middle">{"{}"}</text>
        </svg>
      );
    case "md":
      return (
        <svg viewBox="0 0 16 16" className={className ?? "h-3.5 w-3.5 flex-shrink-0"} fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#007ACC" }}>
          <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
          <path d="M4 6.5l2 2 2-2M11.5 5.5v5m-1.5-1.5l1.5 1.5 1.5-1.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" className={className ?? "h-3.5 w-3.5 flex-shrink-0"} fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#94A3B8" }}>
          <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" />
          <line x1="5.5" y1="5.5" x2="10.5" y2="5.5" strokeLinecap="round" />
          <line x1="5.5" y1="8.5" x2="10.5" y2="8.5" strokeLinecap="round" />
          <line x1="5.5" y1="11.5" x2="8.5" y2="11.5" strokeLinecap="round" />
        </svg>
      );
  }
}
