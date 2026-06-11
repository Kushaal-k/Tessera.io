import type { ConnectionStatus as ConnectionStatusType } from "../hooks/useCollaboration";

const statusConfig: Record<ConnectionStatusType, { color: string; text: string }> = {
  connected:    { color: "bg-green-500",  text: "Connected" },
  reconnecting: { color: "bg-yellow-400", text: "Reconnecting..." },
  disconnected: { color: "bg-red-500",    text: "Offline" },
};

export function ConnectionStatus({ status }: { status: ConnectionStatusType }) {
  const { color, text } = statusConfig[status];
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 text-sm text-white">
      <span className={`w-2 h-2 rounded-full animate-pulse ${color}`} />
      <span>{text}</span>
    </div>
  );
}