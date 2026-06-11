import Dockerode from "dockerode";
import type {
  ExecutionTask,
  ExecutionResult,
  SandboxConfig,
  SupportedLanguage
} from "@tessera/shared-types";
import * as tar from "tar-stream";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

const LANGUAGE_IMAGES: Record<SupportedLanguage, string> = {
  typescript: "node:20-slim",
  python: "python:3.12-slim",
  cpp: "gcc:14",
  java: "eclipse-temurin:21-jdk-alpine",
  rust: "rust:1.75-slim",
};

const LANGUAGE_COMMANDS: Record<
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
  return process.env["SANDBOX_RUNTIME"] === "runsc"
    ? "runsc"
    : "runc";
}

function detectMemoryLimit(): number {
  const value = process.env["SANDBOX_MEMORY_LIMIT"];

  if (!value) {
    return DEFAULT_MEMORY_LIMIT_MB;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MEMORY_LIMIT_MB;
}

async function ensureImageExists(image: string): Promise<void> {
  try {
    await docker.getImage(image).inspect();
  } catch {
    console.log(
      `[sandbox] pulling docker image: ${image} (this might take a moment)...`
    );

    const stream = await docker.pull(image);

    await new Promise<void>((resolve, reject) => {
      docker.modem.followProgress(stream, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log(
      `[sandbox] successfully pulled image: ${image}`
    );
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
  let timerId: NodeJS.Timeout | undefined;

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
        SecurityOpt: [
          "no-new-privileges:true",
        ],
        Tmpfs: {
          "/tmp": "size=64M,nosuid",
        },
        AutoRemove: false,
      },
      NetworkDisabled: config.networkDisabled,
      StopTimeout: Math.ceil(task.timeoutMs / 1000),
    });

    if (task.language === "cpp" || task.language === "java" || task.language === "rust") {
      const filename =
        task.language === "cpp"
          ? "main.cpp"
          : task.language === "java"
            ? "Main.java"
            : "main.rs";
      const tarPack = tar.pack();

      const tarPromise = new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        tarPack.on("data", (chunk: Buffer) => chunks.push(chunk));
        tarPack.on("end", () => resolve(Buffer.concat(chunks)));
        tarPack.on("error", (err: Error) => reject(err));
      });

      tarPack.entry({ name: filename }, task.code);
      tarPack.finalize();

      const tarBuffer = await tarPromise;
      await container.putArchive(tarBuffer, { path: "/tmp" });
    }

    await container.start();

    const timeoutPromise = new Promise<"timeout">((resolve) => {
      timerId = setTimeout(() => resolve("timeout"), task.timeoutMs);
    });

    const waitPromise = container.wait();
    const race = await Promise.race([waitPromise, timeoutPromise]);

    if (timerId) {
      clearTimeout(timerId);
    }

    if (race === "timeout") {
      try {
        await container.stop({ t: 1 });
      } catch {
        // already stopped
      }

      return {
        taskId: task.id,
        status: "timeout",
        stdout: "",
        stderr: `Execution timed out after ${String(
          task.timeoutMs
        )}ms`,
        exitCode: null,
        durationMs: performance.now() - startTime,
      };
    }

    const logs = await container.logs({
      stdout: true,
      stderr: true,
      follow: false,
    });

    const logOutput =
      typeof logs === "string"
        ? logs
        : logs.toString("utf-8");

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
    if (timerId) {
      clearTimeout(timerId);
    }
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
        await container.remove({ force: true });
      } catch {
        // already removed
      }
    }
  }
}


