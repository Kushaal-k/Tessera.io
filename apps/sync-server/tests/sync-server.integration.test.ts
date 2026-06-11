// Integration tests for core collaboration room lifecycle behavior.
// Collaboration tests intentionally avoid Redis/BullMQ execution flows
// so they can run in isolation during CI.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { io as Client } from "socket.io-client";

import { createSyncServer } from "../src/createServer";

describe("Sync Server Integration Tests", () => {
    let serverInstance: ReturnType<typeof createSyncServer>;
    let port: number;

    beforeAll(async () => {
        // Create an isolated sync-server instance for testing.
        serverInstance = createSyncServer();

        await new Promise<void>((resolve) => {
            serverInstance.server.listen(0, () => {
                const address = serverInstance.server.address();

                if (
                    address &&
                    typeof address === "object" &&
                    "port" in address
                ) {
                    port = address.port;
                }

                resolve();
            });
        });
    });

    afterAll(async () => {
        // Clean up server resources after all tests finish.
        await serverInstance.gracefulShutdown();
    });

    it("should allow a client to join a room", async () => {
        // Verify that a client receives the room-joined event
        // after joining a collaboration room.

        const client = Client(`http://localhost:${port}`);

        await new Promise<void>((resolve, reject) => {
            client.on("connect", () => {
                client.emit("join-room", {
                    roomId: "test-room",
                    participant: {
                        id: "user-1",
                        displayName: "Sujal",
                        isAI: false,
                        cursorColor: "#3B82F6",
                    },
                });
            });

            client.on("room-joined", (payload) => {
                try {
                    expect(payload.roomId).toBe("test-room");
                    expect(payload.participants.length).toBe(1);

                    client.disconnect();
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    });
    // Verify that multiple users can join the same room and
    // participant state is tracked correctly.

    it("should track multiple participants in the same room", async () => {
        const client1 = Client(`http://localhost:${port}`);
        const client2 = Client(`http://localhost:${port}`);

        await new Promise<void>((resolve, reject) => {
            let joins = 0;

            const onJoined = () => {
                joins++;

                if (joins === 2) {
                    client1.disconnect();
                    client2.disconnect();
                    resolve();
                }
            };

            client1.on("room-joined", onJoined);
            client2.on("room-joined", onJoined);

            client1.on("connect", () => {
                client1.emit("join-room", {
                    roomId: "shared-room",
                    participant: {
                        id: "user-1",
                        displayName: "Alice",
                        isAI: false,
                        cursorColor: "#ff0000",
                    },
                });
            });

            client2.on("connect", () => {
                client2.emit("join-room", {
                    roomId: "shared-room",
                    participant: {
                        id: "user-2",
                        displayName: "Bob",
                        isAI: false,
                        cursorColor: "#00ff00",
                    },
                });
            });
        });
    });
   

   
});

