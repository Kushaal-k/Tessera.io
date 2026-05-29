# Docker Sandbox Troubleshooting

Tessera.io's execution engine uses Docker to run submitted code in short-lived containers. This guide covers the most common local setup problems when starting the worker or running sandboxed code.

## Quick checks

Run these checks first from your terminal:

```bash
docker version
docker info
docker ps
```

If any command fails, fix Docker before starting Tessera.io. The execution engine talks directly to the Docker daemon through `/var/run/docker.sock`, so the worker cannot run code until the daemon is reachable.

## Docker socket permission errors

### Symptoms

You may see errors like:

```text
connect EACCES /var/run/docker.sock
permission denied while trying to connect to the Docker daemon socket
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

### Fixes

1. Confirm Docker is running:

   ```bash
   docker ps
   ```

2. On Linux, add your user to the `docker` group:

   ```bash
   sudo usermod -aG docker "$USER"
   newgrp docker
   ```

   Log out and back in if `newgrp docker` does not refresh the group membership for your shell.

3. Re-check socket access:

   ```bash
   ls -l /var/run/docker.sock
   docker run --rm hello-world
   ```

4. If you are running the execution worker inside a container, mount the Docker socket explicitly:

   ```bash
   docker run --rm \
     -v /var/run/docker.sock:/var/run/docker.sock \
     tessera-execution-worker
   ```

Only mount the Docker socket into trusted containers. Access to the socket effectively grants control over the host Docker daemon.

## Docker Desktop and WSL mount restrictions

### Symptoms

On Windows with WSL 2, the worker may start but fail when Docker tries to read files or create containers. Common signs include mount errors, missing paths, or paths that work in Windows but not in WSL.

### Fixes

1. Enable WSL integration in Docker Desktop:
   - Open Docker Desktop.
   - Go to **Settings > Resources > WSL Integration**.
   - Enable integration for the distro running Tessera.io.

2. Keep the repository inside the WSL filesystem, not a Windows-mounted path:

   ```bash
   # Prefer this
   ~/projects/Tessera.io

   # Avoid this for Docker-heavy workflows
   /mnt/c/Users/<you>/projects/Tessera.io
   ```

3. Restart Docker Desktop and the WSL distro after changing integration settings:

   ```bash
   wsl --shutdown
   ```

4. From the WSL shell, verify Docker is reachable:

   ```bash
   docker ps
   docker run --rm node:20-slim node --version
   ```

## Cleaning up hung sandbox containers

Sandbox containers are created with `AutoRemove: false` so the worker can inspect logs and exit codes before cleanup. If the worker is interrupted, a container can be left behind.

### Find recently exited or stuck containers

```bash
docker ps -a --filter ancestor=node:20-slim --filter ancestor=python:3.12-slim --filter ancestor=gcc:14
```

If your Docker version does not combine multiple `ancestor` filters as expected, inspect all stopped containers instead:

```bash
docker ps -a --filter status=exited
```

### Remove stopped containers

```bash
docker container prune
```

Docker will ask for confirmation before deleting stopped containers.

### Stop and remove a specific stuck container

```bash
docker stop <container-id>
docker rm <container-id>
```

### Reset pulled sandbox images

If a language image is corrupt or partially pulled, remove it and let the worker pull it again:

```bash
docker rmi node:20-slim python:3.12-slim gcc:14
```

## Optional gVisor runtime issues

The execution engine uses the default Docker runtime unless `SANDBOX_RUNTIME=runsc` is set. If you enable gVisor, confirm Docker knows about the runtime:

```bash
docker info | grep -i runtime
docker run --rm --runtime=runsc node:20-slim node --version
```

If `runsc` is not listed, unset `SANDBOX_RUNTIME` or install and register gVisor before starting the worker again.

## Redis is separate from Docker

The worker also needs Redis for the BullMQ queue. If Docker is healthy but jobs never start, confirm Redis is running and that `REDIS_HOST` and `REDIS_PORT` point to it:

```bash
docker run -d --name tessera-redis -p 6379:6379 redis:7-alpine
REDIS_HOST=127.0.0.1 REDIS_PORT=6379 npm run dev --workspace=@tessera/execution-engine
```

## When to restart services

After fixing Docker permissions, WSL integration, or runtime settings, restart in this order:

1. Docker Desktop or Docker daemon
2. WSL distro, if applicable
3. Redis container
4. Tessera.io development processes

This avoids stale Docker socket handles and queue workers that were started before Docker became reachable.
