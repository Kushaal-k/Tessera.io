import Dockerode from "dockerode";
import type {
  ExecutionTask,
  ExecutionResult,
  SandboxConfig,
  SupportedLanguage,
} from "@tessera/shared-types";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

const LANGUAGE_IMAGES: Record<SupportedLanguage, string> = {
  typescript: "node:20-slim",
  python: "python:3.12-slim",
  cpp: "gcc:14",
  java: "eclipse-temurin:21-jdk-alpine",
  rust: "rust:1.75-slim",
};

const LANGUAGE_COMMANDS: Record
  SupportedLanguage,
  (code: string) => string[]
> = {
  typescript: (code) => ["node", "--input-type=module", "-e", code],
  python: (code) => ["python3", "-c", code],
  cpp: (code) => ["sh", "-c", `echo '${code.replace(/'/g, "'\\''")}' > /tmp/main.cpp && g++ -o /tmp/main /tmp/main.cpp && /tmp/main`],
  java: (code) => ["sh", "-c", `echo '${code.replace(/'/g, "'\\''")}' > /tmp/Main.java && javac /tmp/Main.java -d /tmp && java -cp /tmp Main`],
  rust: (code) => ["sh", "-c", `echo '${code.replace(/'/g, "'\\''")}' > /tmp/main.rs && rustc /tmp/main.rs -o /tmp/main && /tmp/main`],
};

const DEFAULT_MEMORY_LIMIT_MB = 256;

const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  runtime: "runc",
  memoryLimitMb: DEFAULT_MEMORY_LIMIT_MB,
  cpuQuota: 100000,
  networkDisabled: true,
};

function detectRuntime(): SandboxConfig["runtime"] {
  return process.env["SANDBOX_RUNTIME"] === "runsc" ? "runsc" : "runc";
}

function detectMemoryLimit(): number {
  const value = process.env["SANDBOX_MEMORY_LIMIT"];
  if (!value) return DEFAULT_MEMORY_LIMIT_MB;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MEMORY_LIMIT_MB;
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

export async function executeInSandbox(
  task: ExecutionTask
): Promise<ExecutionResult> {
  const startTime = performance.now();

  const config: SandboxConfig = {
    ...DEFAULT_SANDBOX_CONFIG,
    runtime: detectRuntime(),
    memoryLimitMb: detectMemoryLimit(),
  };

  const image = LANGUAGE_IMAGES[task.language];
  const cmd = LANGUAGE_COMMANDS[task.language](task.code);

  let container: Dockerode.Container | undefined;

  try {
    await ensureImageExists(image);

    container = await docker.createContainer({
      Image: image,
      Cmd: cmd,
      User: "sandbox",
      WorkingDir: "/tmp",
      HostConfig: {
        Runtime: config.runtime,
        Memory: config.memoryLimitMb * 1024 * 1024,
        CpuQuota: config.cpuQuota,
        NetworkMode: config.networkDisabled ? "none" : "bridge",
        CapDrop: ["ALL"],
        ReadonlyRootfs: true,
        SecurityOpt: ["no-new-privileges:true"],
        Tmpfs: { "/tmp": "size=64M,nosuid" },
        AutoRemove: false,
      },
      NetworkDisabled: config.networkDisabled,
      StopTimeout: Math.ceil(task.timeoutMs / 1000),
    });
    console.log(`[sandbox] container created: ${container.id} | language: ${task.language} | taskId: ${task.id}`);

    await container.start();
    console.log(`[sandbox] container started: ${container.id} | timeout: ${task.timeoutMs}ms`);

    const timeoutPromise = new Promise<"timeout">((resolve) => {
      setTimeout(() => resolve("timeout"), task.timeoutMs);
    });

    const waitPromise = container.wait();
    const race = await Promise.race([waitPromise, timeoutPromise]);

    if (race === "timeout") {
      console.log(`[sandbox] container timed out: ${container.id} | taskId: ${task.id}`);
      try {
        await container.stop({ t: 1 });
      } catch {
        // already stopped
      }
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
    console.log(`[sandbox] container completed: ${container.id} | exitCode: ${exitCode} | duration: ${(performance.now() - startTime).toFixed(2)}ms`);

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
      try {
        console.log(`[sandbox] removing container: ${container.id}`);
        await container.remove({ force: true });
        console.log(`[sandbox] container removed: ${container.id}`);
      } catch {
        console.log(`[sandbox] container already removed: ${container.id}`);
      }
    }
  }
}