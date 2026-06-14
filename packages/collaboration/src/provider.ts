import * as Y from "yjs";
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from "y-protocols/awareness";
import type { Socket } from "socket.io-client";

export interface TesseraProviderOptions {
  readonly socket: Socket;
  readonly ydoc: Y.Doc;
  readonly awareness: Awareness;
}

/**
 * Connection diagnostics reported via console telemetry when a room
 * session is established and when it is torn down. Helps developers
 * spot slow handshakes or one-sided sync traffic during debugging.
 */
interface ConnectionTelemetry {
  readonly synced: boolean;
  readonly syncLatencyMs: number | null;
  readonly sessionDurationMs: number;
  readonly docUpdatesSent: number;
  readonly docUpdatesReceived: number;
  readonly awarenessUpdatesSent: number;
  readonly awarenessUpdatesReceived: number;
}

export class TesseraSocketProvider {
  readonly ydoc: Y.Doc;
  readonly awareness: Awareness;
  private readonly socket: Socket;
  private synced = false;
  private destroyed = false;

  private awarenessThrottleTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingAwarenessClients = new Set<number>();
  
  private static readonly AWARENESS_THROTTLE_MS = 50;

  // Connection telemetry: timestamps/counters used to report sync
  // latency and diagnostic stats when the session opens and closes.
  private readonly sessionStartedAt = performance.now();
  private syncLatencyMs: number | null = null;
  private docUpdatesSent = 0;
  private docUpdatesReceived = 0;
  private awarenessUpdatesSent = 0;
  private awarenessUpdatesReceived = 0;

  constructor(options: TesseraProviderOptions) {
    this.socket = options.socket;
    this.ydoc = options.ydoc;
    this.awareness = options.awareness;

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

    if (this.awarenessThrottleTimer) {
      clearTimeout(this.awarenessThrottleTimer);
      this.awarenessThrottleTimer = null;
    }

    this.ydoc.off("update", this.handleDocUpdate);
    this.awareness.off("update", this.handleAwarenessLocalUpdate);

    this.socket.off("sync-step-1", this.handleSyncStep1);
    this.socket.off("sync-step-2", this.handleSyncStep2);
    this.socket.off("sync-update", this.handleSyncUpdate);
    this.socket.off("awareness-update", this.handleAwarenessRemoteUpdate);

    console.info("[TesseraProvider] room session closed", this.getTelemetry());
  }

  /**
 * Deletes all content from the shared Monaco text in a single atomic
 * Yjs transaction, propagating the deletion to all synced clients via
 * the existing sync-update socket pipeline.
 */
  clearLocalDoc(): void {
    if (this.destroyed) return;
    const ytext = this.ydoc.getText("monaco");
    if (ytext.length === 0) return;
    this.ydoc.transact(() => {
      ytext.delete(0, ytext.length);
    });
  }

  private getTelemetry(): ConnectionTelemetry {
    return {
      synced: this.synced,
      syncLatencyMs: this.syncLatencyMs,
      sessionDurationMs: Math.round(performance.now() - this.sessionStartedAt),
      docUpdatesSent: this.docUpdatesSent,
      docUpdatesReceived: this.docUpdatesReceived,
      awarenessUpdatesSent: this.awarenessUpdatesSent,
      awarenessUpdatesReceived: this.awarenessUpdatesReceived,
    };
  }

  private sendSyncStep1(): void {
    const stateVector = Y.encodeStateVector(this.ydoc);
    this.socket.emit("sync-step-1", stateVector);
  }

  private bindSocketListeners(): void {
    this.socket.on("sync-step-1", this.handleSyncStep1);
    this.socket.on("sync-step-2", this.handleSyncStep2);
    this.socket.on("sync-update", this.handleSyncUpdate);
    this.socket.on("awareness-update", this.handleAwarenessRemoteUpdate);
  }

  private bindDocListeners(): void {
    this.ydoc.on("update", this.handleDocUpdate);
    this.awareness.on("update", this.handleAwarenessLocalUpdate);
  }

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

      if (!this.synced) {
        this.synced = true;
        this.syncLatencyMs = Math.round(performance.now() - this.sessionStartedAt);
        console.info("[TesseraProvider] room session established", this.getTelemetry());
      }
    } catch (err: unknown) {
      console.error("[TesseraProvider] sync-step-2 error:", err);
    }
  };

  private readonly handleSyncUpdate = (data: Uint8Array): void => {
    try {
      Y.applyUpdate(this.ydoc, new Uint8Array(data), this);
      this.docUpdatesReceived += 1;
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
    this.docUpdatesSent += 1;
  };

  private readonly handleAwarenessLocalUpdate = ({
    added,
    updated,
    removed,
  }: {
    added: number[];
    updated: number[];
    removed: number[];
  }): void => {
  [...added, ...updated, ...removed].forEach((clientId) => {
    this.pendingAwarenessClients.add(clientId);
  });

  if (this.awarenessThrottleTimer) {
    return;
  }

  this.awarenessThrottleTimer = setTimeout(() => {
    const changedClients = [...this.pendingAwarenessClients];

    if (changedClients.length > 0) {
      const encoded = encodeAwarenessUpdate(
        this.awareness,
        changedClients,
      );

      this.socket.emit("awareness-update", encoded);
      this.awarenessUpdatesSent += 1;
    }

    this.pendingAwarenessClients.clear();
    this.awarenessThrottleTimer = null;
  }, TesseraSocketProvider.AWARENESS_THROTTLE_MS);
};
  private readonly handleAwarenessRemoteUpdate = (data: Uint8Array): void => {
    try {
      applyAwarenessUpdate(this.awareness, new Uint8Array(data), this);
      this.awarenessUpdatesReceived += 1;
    } catch (err: unknown) {
      console.error("[TesseraProvider] awareness-update error:", err);
    }
  };
}
