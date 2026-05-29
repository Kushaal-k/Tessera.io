# apps/execution-engine/Dockerfile
FROM node:20-bookworm

# Avoid tzdata interactive prompt during apt install
ENV DEBIAN_FRONTEND=noninteractive

# Install g++, python3, and other essential tools
RUN apt-get update && apt-get install -y \
    g++ \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set up a non-root sandbox user for secure execution
RUN useradd -m -s /bin/bash sandbox
USER sandbox
WORKDIR /home/sandbox

# Default command
CMD ["bash"]
