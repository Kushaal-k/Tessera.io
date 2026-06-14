import Dockerode from "dockerode";
import type {
  ExecutionTask,
  ExecutionResult,
  SandboxConfig,
  SupportedLanguage,
  ExecutionFile,
} from "@tessera/shared-types";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

const LANGUAGE_IMAGES: Record<SupportedLanguage, string> = {
  typescript: "node:20-slim",
  python: "python:3.12-slim",
  cpp: "gcc:14",
  java: "eclipse-temurin:21-jdk-alpine",
  rust: "rust:1.75-slim",
};

// ─────────────────────────────────────────────────────────────
// Shell-safe encoding
// ─────────────────────────────────────────────────────────────

/**
 * Encode arbitrary text as a base64 string that can be safely
 * embedded in a shell command and decoded with `base64 -d`.
 * This sidesteps all quoting/escaping issues for file contents.
 */
function toBase64(text: string): string {
  return Buffer.from(text, "utf-8").toString("base64");
}

/**
 * Build a shell snippet that writes a single file into /tmp.
 * Uses base64 to avoid any quoting issues with file contents.
 */
function writeFileSnippet(name: string, content: string): string {
  const b64 = toBase64(content);
  // Sanitise the filename: strip path traversal and keep only safe chars.
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `echo '${b64}' | base64 -d > /tmp/${safeName}`;
}

// ─────────────────────────────────────────────────────────────
// Language command builders
// ─────────────────────────────────────────────────────────────

type CommandBuilder = (task: ExecutionTask) => string[];

/**
 * Build a shell command that:
 *  1. Writes every workspace file into /tmp (including the entry-point).
 *  2. Executes the entry-point with the appropriate runtime.
 *
 * All commands are joined with " && " so any write failure aborts early.
 */
function buildMultiFileCommand(
  entrySnippet: string,
  files: readonly ExecutionFile[],
): string {
  const writeSnippets = files.map((f) => writeFileSnippet(f.name, f.content));
  const allSteps = [...writeSnippets, entrySnippet];
  return allSteps.join(" && ");
}

const LANGUAGE_COMMANDS: Record<SupportedLanguage, CommandBuilder> = {
  typescript: (task) => {
    if (task.files.length <= 1) {
      // Fast path: single-file, pass code directly.
      return ["node", "--input-type=module", "-e", task.code];
    }
    const entry = task.files.find((f) => f.content === task.code)?.name ?? "main.ts";
    const safeName = entry.replace(/[^a-zA-Z0-9._-]/g, "_");
    const runSnippet = `node --input-type=module /tmp/${safeName}`;
    return ["sh", "-c", buildMultiFileCommand(runSnippet, task.files)];
  },

  python: (task) => {
    if (task.files.length <= 1) {
      return ["python3", "-c", task.code];
    }
    const entry = task.files.find((f) => f.content === task.code)?.name ?? "main.py";
    const safeName = entry.replace(/[^a-zA-Z0-9._-]/g, "_");
    const runSnippet = `python3 /tmp/${safeName}`;
    return ["sh", "-c", buildMultiFileCommand(runSnippet, task.files)];
  },

  cpp: (task) => {
    if (task.files.length <= 1) {
      const safe = task.code.replace(/'/g, "'\\''");
      return ["sh", "-c", `echo '${safe}' > /tmp/main.cpp && g++ -o /tmp/main /tmp/main.cpp && /tmp/main`];
    }
    // Write all files, compile the entry, run.
    const entry = task.files.find((f) => f.content === task.code)?.name ?? "main.cpp";
    const safeName = entry.replace(/[^a-zA-Z0-9._-]/g, "_");
    const runSnippet = `g++ -o /tmp/main /tmp/${safeName} && /tmp/main`;
    return ["sh", "-c", buildMultiFileCommand(runSnippet, task.files)];
  },

  java: (task) => {
    if (task.files.length <= 1) {
      const safe = task.code.replace(/'/g, "'\\''");
      return ["sh", "-c", `echo '${safe}' > /tmp/Main.java && javac /tmp/Main.java -d /tmp && java -cp /tmp Main`];
    }
    const entry = task.files.find((f) => f.content === task.code)?.name ?? "Main.java";
    const safeName = entry.replace(/[^a-zA-Z0-9._-]/g, "_");
    const className = safeName.replace(/\.java$/, "");
    const runSnippet = `javac /tmp/${safeName} -d /tmp && java -cp /tmp ${className}`;
    return ["sh", "-c", buildMultiFileCommand(runSnippet, task.files)];
  },

  rust: (task) => {
    if (task.files.length <= 1) {
      const safe = task.code.replace(/'/g, "'\\''");
      return ["sh", "-c", `echo '${safe}' > /tmp/main.rs && rustc /tmp/main.rs -o /tmp/main && /tmp/main`];
    }
    const entry = task.files.find((f) => f.content === task.code)?.name ?? "main.rs";
    const safeName = entry.replace(/[^a-zA-Z0-9._-]/g, "_");
    const runSnippet = `rustc /tmp/${safeName} -o /tmp/main && /tmp/main`;
    return ["sh", "-c", buildMultiFileCommand(runSnippet, task.files)];
  },
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
  const cmd = LANGUAGE_COMMANDS[task.language](task);

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