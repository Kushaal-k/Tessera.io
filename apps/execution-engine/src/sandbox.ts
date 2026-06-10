import Dockerode from "dockerode";
import type { ExecutionTask, ExecutionResult, SandboxConfig, SupportedLanguage } from "@tessera/shared-types";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

const LANGUAGE_IMAGES: Record<SupportedLanguage, string> = {
  typescript: "node:20-slim",
  python: "python:3.12-slim",
  cpp: "gcc:14",
  java: "openjdk:17-slim"
};

const LANGUAGE_COMMANDS: Record<SupportedLanguage, (code: string) => string[]> = {
  typescript: (code) => ["node", "--input-type=module", "-e", code],
  python: (code) => ["python3", "-c", code],
  cpp: (code) => ["sh", "-c", `echo '${code.replace(/'/g, "'\\''")}' > /tmp/main.cpp && g++ -o /tmp/main /tmp/main.cpp && /tmp/main`],
  java: (code) => ["sh", "-c", `echo '${code.replace(/'/g, "'\\''")}' > /tmp/Main.java && javac /tmp/Main.java && java -cp /tmp Main`],
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
    const logOutput = typeof logs === "string" ? logs : logs.toString("utf-8");

    const inspectInfo = await container.inspect();
    const exitCode = inspectInfo.State.ExitCode as number;

    return {
      taskId: task.id,
      status: exitCode === 0 ? "completed" : "failed",
      stdout: logOutput,
      stderr: "",
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
