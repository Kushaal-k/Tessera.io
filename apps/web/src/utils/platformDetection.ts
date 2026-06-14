export function isMacOS(): boolean {
  return navigator.platform.toUpperCase().includes("MAC");
}

export function getExecutionShortcutText(): string {
  return isMacOS() ? "⌘+Enter" : "Ctrl+Enter";
}