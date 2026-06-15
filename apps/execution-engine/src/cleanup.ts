#!/usr/bin/env node

import Dockerode from "dockerode";

// Initialize Docker with auto-detection
let docker: Dockerode;

try {
  docker = new Dockerode();
} catch (error) {
  console.error("❌ Failed to connect to Docker daemon. Make sure Docker is running.");
  console.error("   Error:", error instanceof Error ? error.message : error);
  process.exit(1);
}

async function cleanupDeadSandboxContainers(): Promise<void> {
  console.log("\n🔍 Scanning for dead sandbox containers...\n");

  try {
    if (!docker) {
      console.error("❌ Docker is not available. Please ensure Docker is running.\n");
      process.exit(1);
    }

    const containers = await docker.listContainers({ all: true });

    if (!containers || containers.length === 0) {
      console.log("✅ No containers found.\n");
      return;
    }

    const deadContainers = containers.filter((container) => {
      const isSandbox = container.Names?.some(
        (name) =>
          name?.includes("sandbox") ||
          name?.includes("execution") ||
          name?.includes("tessera")
      ) || false;
      
      const isDeadOrExited =
        container.State === "exited" ||
        container.State === "dead" ||
        container.Status?.includes("exited") ||
        false;
        
      return isSandbox && isDeadOrExited;
    });

    if (deadContainers.length === 0) {
      console.log("✅ No dead sandbox containers found.\n");
      return;
    }

    console.log(`📦 Found ${deadContainers.length} dead sandbox container(s):\n`);

    for (const container of deadContainers) {
      const containerName = container.Names?.[0]?.replace("/", "") || "unknown";
      const containerId = container.Id?.substring(0, 12) || "unknown";
      
      console.log(`   🗑️  ${containerName} (${containerId}) - Status: ${container.State || "unknown"}`);

      try {
        const dockerContainer = docker.getContainer(container.Id);
        await dockerContainer.remove({ force: true });
        console.log(`      ✅ Removed successfully\n`);
      } catch (removeError) {
        console.error(
          `      ❌ Failed to remove:`,
          removeError instanceof Error ? removeError.message : removeError
        );
        console.log("");
      }
    }

    console.log("✨ Cleanup completed!\n");
  } catch (error) {
    console.error(
      "💥 Error during cleanup:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

// Run the cleanup function
cleanupDeadSandboxContainers().catch(console.error);

export { cleanupDeadSandboxContainers };