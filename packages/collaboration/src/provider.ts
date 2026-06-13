import * as Y from "yjs";
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from "y-protocols/awareness";
import type { Socket } from "socket.io-client";
import type { ConnectionStatus } from "@tessera/shared-types";

export type StatusChangeCallback = (status: ConnectionStatus) => void;

export interface TesseraProviderOptions {
  readonly socket: Socket;
  readonly ydoc: Y.Doc;
  readonly awareness: Awareness;
  /** Called whenever the socket reconnection lifecycle changes state. */
  readonly onStatusChange?: StatusChangeCallback;
}

export class TesseraSocketProvider {
  readonly ydoc: Y.Doc;
  readonly awareness: Awareness;
  private readonly socket: Socket;
  private readonly onStatusChange?: StatusChangeCallback;
  private synced = false;
  private destroyed = false;

  constructor(options: TesseraProviderOptions) {
    this.socket = options.socket;
    this.ydoc = options.ydoc;
    this.awareness = options.awareness;
    this.onStatusChange = options.onStatusChange;

    this.bindSocketListeners();
    this.bindDocListeners();
    this.sendSyncStep1();
  }

  get isSynced(): boolean {
    return this.synced;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this.ydoc.off("update", this.handleDocUpdate);
    this.awareness.off("update", this.handleAwarenessLocalUpdate);

    this.socket.off("sync-step-1", this.handleSyncStep1);
    this.socket.off("sync-step-2", this.handleSyncStep2);
    this.socket.off("sync-update", this.handleSyncUpdate);
    this.socket.off("awareness-update", this.handleAwarenessRemoteUpdate);

    // Manager-level events — must use socket.io.off(), not socket.off()
    this.socket.io.off("reconnect_attempt", this.handleReconnectAttempt);
    this.socket.io.off("reconnect_error", this.handleReconnectError);
    this.socket.io.off("reconnect_failed", this.handleReconnectFailed);
  }

  private sendSyncStep1(): void {
    const stateVector = Y.encodeStateVector(this.ydoc);
    this.socket.emit("sync-step-1", stateVector);
  }

  private bindSocketListeners(): void {
    // Yjs sync events — socket-level
    this.socket.on("sync-step-1", this.handleSyncStep1);
    this.socket.on("sync-step-2", this.handleSyncStep2);
    this.socket.on("sync-update", this.handleSyncUpdate);
    this.socket.on("awareness-update", this.handleAwarenessRemoteUpdate);

    // Reconnect events are Manager-level in socket.io-client v4
    this.socket.io.on("reconnect_attempt", this.handleReconnectAttempt);
    this.socket.io.on("reconnect_error", this.handleReconnectError);
    this.socket.io.on("reconnect_failed", this.handleReconnectFailed);
  }

  private bindDocListeners(): void {
    this.ydoc.on("update", this.handleDocUpdate);
    this.awareness.on("update", this.handleAwarenessLocalUpdate);
  }

  // ── Sync handlers ─────────────────────────────────────────────────────────

  private readonly handleSyncStep1 = (data: Uint8Array): void => {
    try {
      const update = Y.encodeStateAsUpdate(this.ydoc, new Uint8Array(data));
      this.socket.emit("sync-step-2", update);
    } catch (err: unknown) {
      console.error("[TesseraProvider] sync-step-1 error:", err);
    }
  };

  private readonly handleSyncStep2 = (data: Uint8Array): void => {
    try {
      Y.applyUpdate(this.ydoc, new Uint8Array(data), this);
      this.synced = true;
    } catch (err: unknown) {
      console.error("[TesseraProvider] sync-step-2 error:", err);
    }
  };

  private readonly handleSyncUpdate = (data: Uint8Array): void => {
    try {
      Y.applyUpdate(this.ydoc, new Uint8Array(data), this);
    } catch (err: unknown) {
      console.error("[TesseraProvider] sync-update error:", err);
    }
  };

  private readonly handleDocUpdate = (
    update: Uint8Array,
    origin: unknown,
  ): void => {
    if (origin === this) return;
    this.socket.emit("sync-update", update);
  };

  // ── Awareness handlers ────────────────────────────────────────────────────

  private readonly handleAwarenessLocalUpdate = ({
    added,
    updated,
    removed,
  }: {
    added: number[];
    updated: number[];
    removed: number[];
  }): void => {
    const changedClients = [...added, ...updated, ...removed];
    const encoded = encodeAwarenessUpdate(this.awareness, changedClients);
    this.socket.emit("awareness-update", encoded);
  };

  private readonly handleAwarenessRemoteUpdate = (data: Uint8Array): void => {
    try {
      applyAwarenessUpdate(this.awareness, new Uint8Array(data), this);
    } catch (err: unknown) {
      console.error("[TesseraProvider] awareness-update error:", err);
    }
  };

  // ── Reconnection handlers ─────────────────────────────────────────────────

  private readonly handleReconnectAttempt = (attemptNumber: number): void => {
    console.warn(`[TesseraProvider] Reconnect attempt #${attemptNumber}`);
    this.onStatusChange?.("reconnecting");
  };

  private readonly handleReconnectError = (err: Error): void => {
    // Per-attempt failure; socket.io will keep retrying until reconnectionAttempts
    console.error("[TesseraProvider] Reconnect error:", err);
    this.onStatusChange?.("reconnecting");
  };

  private readonly handleReconnectFailed = (): void => {
    // All attempts exhausted — user must reload to restore the session
    console.error("[TesseraProvider] Reconnect failed — all attempts exhausted.");
    this.onStatusChange?.("failed");
  };
}