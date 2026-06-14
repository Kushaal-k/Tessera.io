import Dockerode from "dockerode";
import type {
  ExecutionTask,
  ExecutionResult,
  SandboxConfig,
  SupportedLanguage,
} from "@tessera/shared-types";
import * as tar from "tar-stream";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

/** Cleanly separated output streams parsed from a Docker log buffer. */
export interface DemuxedStreams {
  stdout: string;
  stderr: string;
}

// Docker multiplexes stdout/stderr into a single stream when a container runs
// without a TTY (`Tty: false`, our default). Every payload chunk is prefixed with
// an 8-byte header: byte 0 is the stream type (0 = stdin, 1 = stdout, 2 = stderr),
// bytes 1-3 are zero padding, and bytes 4-7 are the payload length as a big-endian
// uint32. See https://docs.docker.com/engine/api/v1.43/#tag/Container/operation/ContainerAttach
const STREAM_HEADER_SIZE = 8;
const STREAM_TYPE_STDERR = 2;

/**
 * Parse a multiplexed Docker log buffer into separate `stdout` and `stderr`
 * strings, stripping the 8-byte frame headers. If the buffer is not multiplexed
 * (for example a raw stream from a TTY-allocated container), the bytes are
 * returned as `stdout` rather than being corrupted or dropped.
 */
export function demuxDockerStream(buffer: Buffer): DemuxedStreams {
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];
  let offset = 0;

  while (offset + STREAM_HEADER_SIZE <= buffer.length) {
    const streamType = buffer[offset];
    const payloadLength = buffer.readUInt32BE(offset + 4);
    const payloadStart = offset + STREAM_HEADER_SIZE;
    const payloadEnd = payloadStart + payloadLength;

    // A valid frame has a known stream type (0-2) and a length that stays within
    // the buffer. Anything else means this isn't a multiplexed stream, so treat
    // the remaining bytes as stdout instead of emitting garbage.
    if (streamType === undefined || streamType > STREAM_TYPE_STDERR || payloadEnd > buffer.length) {
      stdoutChunks.push(buffer.subarray(offset));
      return joinStreams(stdoutChunks, stderrChunks);
    }

    const payload = buffer.subarray(payloadStart, payloadEnd);
    (streamType === STREAM_TYPE_STDERR ? stderrChunks : stdoutChunks).push(payload);
    offset = payloadEnd;
  }

  // Trailing bytes too short to form a header shouldn't occur for a well-formed
  // stream, but keep them (as stdout) rather than silently dropping output.
  if (offset < buffer.length) {
    stdoutChunks.push(buffer.subarray(offset));
  }

  return joinStreams(stdoutChunks, stderrChunks);
}

function joinStreams(stdoutChunks: Buffer[], stderrChunks: Buffer[]): DemuxedStreams {
  return {
    stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
    stderr: Buffer.concat(stderrChunks).toString("utf-8"),
  };
}

const LANGUAGE_IMAGES: Record<SupportedLanguage, string> = {
  typescript: "node:20-slim",
  python: "python:3.12-slim",
  cpp: "gcc:14",
  java: "eclipse-temurin:21-jdk-alpine",
  rust: "rust:1.75-slim",
};

const LANGUAGE_COMPILE_COMMANDS: Record<string, string[]> = {
  cpp: ["sh", "-c", "g++ -o /tmp/main /tmp/main.cpp && /tmp/main"],
  java: ["sh", "-c", "javac /tmp/Main.java && java -cp /tmp Main"],
  rust: ["sh", "-c", "rustc /tmp/main.rs -o /tmp/main && /tmp/main"],
};

const LANGUAGE_COMMANDS: Record<
  SupportedLanguage,
  (code: string) => string[]
> = {
  typescript: (code) => ["node", "--input-type=module", "-e", code],
  python: (code) => ["python3", "-c", code],
  cpp: () => LANGUAGE_COMPILE_COMMANDS["cpp"]!,
  java: () => LANGUAGE_COMPILE_COMMANDS["java"]!,
  rust: () => LANGUAGE_COMPILE_COMMANDS["rust"]!,
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
      docker.modem.followProgress(stream, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log(`[sandbox] successfully pulled image: ${image}`);
  }
}

async function uploadSourceFile(
  container: Dockerode.Container,
  filename: string,
  code: string
): Promise<void> {
  const tarPack = tar.pack();

  const tarPromise = new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    tarPack.on("data", (chunk: Buffer) => chunks.push(chunk));
    tarPack.on("end", () => resolve(Buffer.concat(chunks)));
    tarPack.on("error", (err: Error) => reject(err));
  });

  tarPack.entry({ name: filename }, code, (err) => {
    if (err) tarPack.destroy(err);
  });
  tarPack.finalize();

  const tarBuffer = await tarPromise;
  await container.putArchive(tarBuffer, { path: "/tmp" });
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
  const needsFileUpload =
    task.language === "cpp" ||
    task.language === "java" ||
    task.language === "rust";

  let container: Dockerode.Container | undefined;
  let timerId: NodeJS.Timeout | undefined;

  try {
    await ensureImageExists(image);

    container = await docker.createContainer({
      Image: image,
      Cmd: needsFileUpload
        ? ["sleep", String(Math.ceil(task.timeoutMs / 1000) + 5)]
        : LANGUAGE_COMMANDS[task.language](task.code),
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

    if (needsFileUpload) {
      const filename =
        task.language === "cpp"
          ? "main.cpp"
          : task.language === "java"
            ? "Main.java"
            : "main.rs";

      await uploadSourceFile(container, filename, task.code);
      console.log(`[sandbox] source file uploaded: ${filename} | container: ${container.id}`);

      const compileCmd = LANGUAGE_COMPILE_COMMANDS[task.language]!;
      const exec = await container.exec({
        Cmd: compileCmd,
        AttachStdout: true,
        AttachStderr: true,
        User: "sandbox",
      });

      const execStream = await exec.start({ hijack: true, stdin: false });

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];

      const timeoutPromise = new Promise<"timeout">((resolve) => {
        timerId = setTimeout(() => resolve("timeout"), task.timeoutMs);
      });

      const execPromise = new Promise<void>((resolve, reject) => {
        docker.modem.demuxStream(
          execStream,
          {
            write: (chunk: Buffer) => {
              stdoutChunks.push(chunk);
              return true;
            },
          } as any,
          {
            write: (chunk: Buffer) => {
              stderrChunks.push(chunk);
              return true;
            },
          } as any
        );
        execStream.on("end", resolve);
        execStream.on("error", reject);
      });

      const race = await Promise.race([execPromise, timeoutPromise]);

      if (timerId) clearTimeout(timerId);

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

      const execInspect = await exec.inspect();
      const exitCode = execInspect.ExitCode ?? null;
      console.log(`[sandbox] container completed: ${container.id} | exitCode: ${exitCode} | duration: ${(performance.now() - startTime).toFixed(2)}ms`);

      return {
        taskId: task.id,
        status: exitCode === 0 ? "completed" : "failed",
        stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
        stderr: Buffer.concat(stderrChunks).toString("utf-8"),
        exitCode,
        durationMs: performance.now() - startTime,
      };
    }

    // typescript / python flow
    const timeoutPromise = new Promise<"timeout">((resolve) => {
      timerId = setTimeout(() => resolve("timeout"), task.timeoutMs);
    });

    const waitPromise = container.wait();
    const race = await Promise.race([waitPromise, timeoutPromise]);

    if (timerId) clearTimeout(timerId);

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
    const logBuffer = Buffer.isBuffer(logs) ? logs : Buffer.from(logs as unknown as string, "utf-8");
    const { stdout, stderr } = demuxDockerStream(logBuffer);

    const inspectInfo = await container.inspect();
    const exitCode = inspectInfo.State.ExitCode as number;
    console.log(`[sandbox] container completed: ${container.id} | exitCode: ${exitCode} | duration: ${(performance.now() - startTime).toFixed(2)}ms`);

    return {
      taskId: task.id,
      status: exitCode === 0 ? "completed" : "failed",
      stdout,
      stderr,
      exitCode,
      durationMs: performance.now() - startTime,
    };
  } catch (err: unknown) {
    if (timerId) clearTimeout(timerId);
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