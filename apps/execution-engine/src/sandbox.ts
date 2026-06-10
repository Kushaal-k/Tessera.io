import Dockerode from "dockerode";
import type { ExecutionTask, ExecutionResult, SandboxConfig, SupportedLanguage } from "@tessera/shared-types";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

const LANGUAGE_IMAGES: Record<SupportedLanguage, string> = {
  typescript: "node:20-slim",
  python: "python:3.12-slim",
  cpp: "gcc:14",
};

const LANGUAGE_COMMANDS: Record<SupportedLanguage, (code: string) => string[]> = {
  typescript: (code) => ["node", "--input-type=module", "-e", code],
  python: (code) => ["python3", "-c", code],
  cpp: (code) => ["sh", "-c", `echo '${code.replace(/'/g, "'\\''")}' > /tmp/main.cpp && g++ -o /tmp/main /tmp/main.cpp && /tmp/main`],
};

const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  runtime: "runc",
  memoryLimitMb: 256,
  cpuQuota: 100000,
  networkDisabled: true,
};

function detectRuntime(): SandboxConfig["runtime"] {
  return process.env["SANDBOX_RUNTIME"] === "runsc" ? "runsc" : "runc";
}

async function ensureImageExists(image: string): Promise<void> {
  try {
    await docker.getImage(image).inspect();
  } catch {
    console.log(`[sandbox] pulling docker image: ${image} (this might take a moment)...`);
    const stream = await docker.pull(image);
    await new Promise<void>((resolve, reject) => {
      docker.modem.followProgress(stream, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log(`[sandbox] successfully pulled image: ${image}`);
  }
}

function demuxDockerLogs(logs: Buffer | string): { stdout: string; stderr: string } {
  const buffer = typeof logs === "string" ? Buffer.from(logs, "binary") : logs;
  let stdout = "";
  let stderr = "";
  let offset = 0;

  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) {
      break;
    }
    const type = buffer.readUInt8(offset);
    const size = buffer.readUInt32BE(offset + 4);
    offset += 8;

    if (offset + size > buffer.length) {
      const chunk = buffer.toString("utf8", offset, buffer.length);
      if (type === 1) stdout += chunk;
      else if (type === 2) stderr += chunk;
      break;
    }

    const chunk = buffer.toString("utf8", offset, offset + size);
    if (type === 1) {
      stdout += chunk;
    } else if (type === 2) {
      stderr += chunk;
    }
    offset += size;
  }

  return { stdout, stderr };
}

export async function executeInSandbox(task: ExecutionTask): Promise<ExecutionResult> {
  const startTime = performance.now();
  const config: SandboxConfig = { ...DEFAULT_SANDBOX_CONFIG, runtime: detectRuntime() };
  const image = LANGUAGE_IMAGES[task.language];
  const cmd = LANGUAGE_COMMANDS[task.language](task.code);

  let container: Dockerode.Container | undefined;

  try {
    await ensureImageExists(image);

    container = await docker.createContainer({
      Image: image,
      Cmd: cmd,
      HostConfig: {
        Runtime: config.runtime,
        Memory: config.memoryLimitMb * 1024 * 1024,
        CpuQuota: config.cpuQuota,
        NetworkMode: config.networkDisabled ? "none" : "bridge",
        AutoRemove: false,
      },
      NetworkDisabled: config.networkDisabled,
      StopTimeout: Math.ceil(task.timeoutMs / 1000),
    });

    await container.start();

    const timeoutPromise = new Promise<"timeout">((resolve) => {
      setTimeout(() => resolve("timeout"), task.timeoutMs);
    });

    const waitPromise = container.wait();
    const race = await Promise.race([waitPromise, timeoutPromise]);

    if (race === "timeout") {
      try { await container.stop({ t: 1 }); } catch { /* already stopped */ }
      return {
        taskId: task.id,
        status: "timeout",
        stdout: "",
        stderr: `Execution timed out after ${String(task.timeoutMs)}ms`,
        exitCode: null,
        durationMs: performance.now() - startTime,
      };
    }

    const logs = await container.logs({ stdout: true, stderr: true, follow: false });
    const { stdout, stderr } = demuxDockerLogs(logs as unknown as Buffer | string);

    const inspectInfo = await container.inspect();
    const exitCode = inspectInfo.State.ExitCode as number;

    return {
      taskId: task.id,
      status: exitCode === 0 ? "completed" : "failed",
      stdout,
      stderr,
      exitCode,
      durationMs: performance.now() - startTime,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      taskId: task.id,
      status: "failed",
      stdout: "",
      stderr: message,
      exitCode: null,
      durationMs: performance.now() - startTime,
    };
  } finally {
    if (container) {
      try { await container.remove({ force: true }); } catch { /* already removed */ }
    }
  }
}

