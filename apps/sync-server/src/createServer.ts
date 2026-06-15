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

const CORS_ORIGIN = process.env["CORS_ORIGIN"] ?? "http://localhost:3000";
const REDIS_HOST = process.env["REDIS_HOST"] ?? "127.0.0.1";
const REDIS_PORT = Number(process.env["REDIS_PORT"] ?? 6379);

// Factory function used by production startup and integration tests.
// Separating server construction from server.listen() allows tests
// to create isolated server instances without binding immediately.

export function createSyncServer() {
    const rooms = new Map<string, RoomState>();

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

    app.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });

    const server = http.createServer(app);

    const io = new SocketIOServer<
        SyncClientToServerEvents,
        SyncServerToClientEvents
    >(server, {
        cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
        maxHttpBufferSize: 1e8,
    });

    const connectionOptions = {
        host: REDIS_HOST,
        port: REDIS_PORT,
        maxRetriesPerRequest: null,
    };

    const QUEUE_NAME = "code-execution";

    // BullMQ resources are created lazily so collaboration-only
    // integration tests can run without requiring Redis.
    //
    // These instances are shared by the entire sync-server and
    // reused across all execute-code requests instead of creating
    // new Redis connections per request.

    // Queue and QueueEvents are initialized synchronously before any await
    // points are reached in this handler. Since Node.js executes JavaScript
    // on a single event loop, concurrent execute-code requests cannot
    // interleave within this initialization block and create duplicate
    // instances.
    let executionQueue: Queue<ExecutionTask> | null = null;
    let queueEvents: QueueEvents | null = null;
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

            if (!executionQueue) {
                executionQueue = new Queue<ExecutionTask>(
                    QUEUE_NAME,
                    { connection: connectionOptions }
                );
            }

            if (!queueEvents) {
                queueEvents = new QueueEvents(
                    QUEUE_NAME,
                    { connection: connectionOptions }
                );
            }

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

                const job = await executionQueue.add(
                    "execute",
                    task,
                    { jobId: taskId }
                );

                const result = await job.waitUntilFinished(queueEvents);

                socket.emit("execution-result", result as ExecutionResult);
            } catch (err: unknown) {
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
                removeAwarenessStates(
                    room.awareness,
                    [room.awareness.clientID],
                    socket
                );
            }

            if (room.participants.size === 0) {
                room.doc.destroy();
                rooms.delete(currentRoomId);
            }
        });
    });

    async function gracefulShutdown() {
        console.log("shutting down sync-server…");

        try {
            if (executionQueue) {
                await executionQueue.close();
            }

            if (queueEvents) {
                await queueEvents.close();
            }
        } catch (err) {
            console.error("error closing bullmq handles:", err);
        }

        io.close();

        server.close();
    }

    return {
        app,
        server,
        io,
        gracefulShutdown,
    };
}
