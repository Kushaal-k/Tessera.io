// Production entrypoint.
// Tests import createSyncServer() directly instead of starting
// a listening server process.
import { createSyncServer } from "./createServer";

const PORT = Number(process.env["PORT"] ?? 4000);

const { server, gracefulShutdown } = createSyncServer();

// Start the sync server only in the runtime entrypoint.
server.listen(PORT, () => {
  console.log(`sync-server listening on :${String(PORT)}`);
});

process.on("SIGTERM", () => {
  void gracefulShutdown();
});

process.on("SIGINT", () => {
  void gracefulShutdown();
});