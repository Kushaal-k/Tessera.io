import { Worker } from "bullmq";
import type { Job } from "bullmq";
import type { ExecutionTask, ExecutionResult } from "@tessera/shared-types";
import { executeInSandbox } from "./sandbox.js";
import { QUEUE_NAME, createRedisConnectionOptions } from "./queue.js";

const connection = createRedisConnectionOptions();

const worker = new Worker<ExecutionTask, ExecutionResult>(
  QUEUE_NAME,
  async (job: Job<ExecutionTask>): Promise<ExecutionResult> => {
    console.log(`processing job ${job.id ?? "unknown"} [lang=${job.data.language}]`);
    try {
      return await executeInSandbox(job.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await job.moveToFailed(error, job.id ?? "", true);
      throw error;
    }
  },
  {
    connection,
    concurrency: Number(process.env["WORKER_CONCURRENCY"] ?? 3),
    lockDuration: 60000,
    stalledInterval: 30000,
    maxStalledCount: 3,
  },
);

worker.on("completed", (job, result) => {
  console.log(`job ${job.id ?? "unknown"} completed [status=${result.status}, duration=${String(result.durationMs)}ms]`);
});

worker.on("failed", (job, err) => {
  console.error(`job ${job?.id ?? "unknown"} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("worker error:", err.message);
});

console.log(`worker listening on queue: ${QUEUE_NAME}`);

function gracefulShutdown() {
  console.log("shutting down worker…");
  void worker.close().then(() => process.exit(0));
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
