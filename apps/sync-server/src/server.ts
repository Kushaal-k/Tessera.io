import http from "node:http";
import crypto from "node:crypto";
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import * as Y from "yjs";
import { Awareness, applyAwarenessUpdate, removeAwarenessStates } from "y-protocols/awareness";
import { Queue, QueueEvents } from "bullmq";
import type {
  Participant,
  SyncClientToServerEvents,
  SyncServerToClientEvents,
  ExecutionTask,
  ExecutionResult,
} from "@tessera/shared-types";

interface RoomState {
  readonly doc: Y.Doc;
  readonly awareness: Awareness;
  readonly participants: Map<string, Participant>;
}

const PORT = Number(process.env["PORT"] ?? 4000);
const CORS_ORIGIN = process.env["CORS_ORIGIN"] ?? "http://localhost:3000";
const REDIS_HOST = process.env["REDIS_HOST"] ?? "127.0.0.1";
const REDIS_PORT = Number(process.env["REDIS_PORT"] ?? 6379);

const rooms = new Map<string, RoomState>();

// Tracks whether the server has fully started and is ready to accept connections.
let serverReady = false;
const startTime = Date.now();

function getOrCreateRoom(roomId: string): RoomState {
  const existing = rooms.get(roomId);
  if (existing) return existing;

  const doc = new Y.Doc();
  const awareness = new Awareness(doc);
  const room: RoomState = { doc, awareness, participants: new Map() };
  rooms.set(roomId, room);
  return room;
}

const app = express();
app.use(express.json());

/**
 * GET /health
 * Lightweight liveness probe. Returns HTTP 200 when the process is running.
 * Safe to call at any time — does not depend on readiness state.
 */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "sync-server",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /ready
 * Readiness probe. Returns HTTP 200 only after the HTTP server has fully
 * started and is capable of accepting collaboration connections.
 * Returns HTTP 503 if the server is still initializing.
 */
app.get("/ready", (_req, res) => {
  if (!serverReady) {
    res.status(503).json({ ready: false });
    return;
  }
  res.json({
    ready: true,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});

const server = http.createServer(app);

const io = new SocketIOServer<SyncClientToServerEvents, SyncServerToClientEvents>(server, {
  cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
  maxHttpBufferSize: 1e8,
});

const connectionOptions = { host: REDIS_HOST, port: REDIS_PORT, maxRetriesPerRequest: null };
const QUEUE_NAME = "code-execution";

const executionQueue = new Queue<ExecutionTask>(QUEUE_NAME, { connection: connectionOptions });
const queueEvents = new QueueEvents(QUEUE_NAME, { connection: connectionOptions });

// Prevent unhandled Redis connection errors from crashing the process in dev
// environments where Redis may not be running. The collaboration layer continues
// to work; code execution jobs will fail gracefully per-request.
executionQueue.on("error", (err) => {
  console.warn("[sync-server] BullMQ Queue connection error (Redis unavailable?):", err.message);
});
queueEvents.on("error", (err) => {
  console.warn("[sync-server] BullMQ QueueEvents error (Redis unavailable?):", err.message);
});

io.on("connection", (socket) => {
  let currentRoomId: string | null = null;
  let currentParticipant: Participant | null = null;

  socket.on("join-room", (payload) => {
    const { roomId, participant } = payload;
    const room = getOrCreateRoom(roomId);

    currentRoomId = roomId;
    currentParticipant = participant;
    room.participants.set(socket.id, participant);

    void socket.join(roomId);

    socket.emit("room-joined", {
      roomId,
      participants: Array.from(room.participants.values()),
    });

    const stateVector = Y.encodeStateVector(room.doc);
    socket.emit("sync-step-1", stateVector);
  });

  socket.on("sync-step-1", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    try {
      const update = Y.encodeStateAsUpdate(room.doc, new Uint8Array(data));
      socket.emit("sync-step-2", update);
    } catch (err: unknown) {
      console.error(`sync-step-1 error [room=${currentRoomId}]:`, err);
    }
  });

  socket.on("sync-step-2", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    try {
      Y.applyUpdate(room.doc, new Uint8Array(data), socket);
    } catch (err: unknown) {
      console.error(`sync-step-2 error [room=${currentRoomId}]:`, err);
    }
  });

  socket.on("sync-update", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    try {
      Y.applyUpdate(room.doc, new Uint8Array(data), socket);
      socket.to(currentRoomId).emit("sync-update", data);
    } catch (err: unknown) {
      console.error(`sync-update error [room=${currentRoomId}]:`, err);
    }
  });

  socket.on("awareness-update", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    try {
      applyAwarenessUpdate(room.awareness, new Uint8Array(data), socket);
      socket.to(currentRoomId).emit("awareness-update", data);
    } catch (err: unknown) {
      console.error(`awareness-update error [room=${currentRoomId}]:`, err);
    }
  });

  socket.on("execute-code", async (payload) => {
    if (!currentRoomId) return;

    const taskId = crypto.randomUUID();
    try {
      const task: ExecutionTask = {
        id: taskId,
        code: payload.code,
        language: payload.language,
        timeoutMs: 5000,
        roomId: currentRoomId,
        createdAt: new Date().toISOString(),
      };

      console.log(`[sync-server] enqueuing code execution ${taskId} [lang=${payload.language}]`);
      const job = await executionQueue.add("execute", task, { jobId: taskId });

      const result = await job.waitUntilFinished(queueEvents);
      console.log(`[sync-server] execution ${taskId} finished`);
      socket.emit("execution-result", result as ExecutionResult);
    } catch (err: unknown) {
      console.error(`[sync-server] execution ${taskId} failed:`, err);
      socket.emit("execution-result", {
        taskId,
        status: "failed",
        stdout: "",
        stderr: err instanceof Error ? err.message : String(err),
        exitCode: 1,
        durationMs: 0,
      });
    }
  });

  socket.on("disconnect", () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    room.participants.delete(socket.id);

    if (currentParticipant) {
      removeAwarenessStates(room.awareness, [room.awareness.clientID], socket);
    }

    if (room.participants.size === 0) {
      room.doc.destroy();
      rooms.delete(currentRoomId);
    }
  });
});

server.listen(PORT, () => {
  serverReady = true;
  console.log(`sync-server listening on :${String(PORT)}`);
  console.log(`  → health:  http://localhost:${String(PORT)}/health`);
  console.log(`  → ready:   http://localhost:${String(PORT)}/ready`);
});

async function gracefulShutdown() {
  console.log("shutting down sync-server…");
  try {
    await executionQueue.close();
    await queueEvents.close();
  } catch (err) {
    console.error("error closing bullmq handles:", err);
  }
  io.close();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", () => {
  void gracefulShutdown();
});
process.on("SIGINT", () => {
  void gracefulShutdown();
});
