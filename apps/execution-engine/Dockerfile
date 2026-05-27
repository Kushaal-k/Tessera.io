# apps/execution-engine/Dockerfile
FROM ubuntu:24.04

# Avoid tzdata interactive prompt during apt install
ENV DEBIAN_FRONTEND=noninteractive

# Install g++, python3, nodejs, and other essential tools
RUN apt-get update && apt-get install -y \
    curl \
    g++ \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js v20 (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set up a non-root sandbox user for secure execution
RUN useradd -m -s /bin/bash sandbox
USER sandbox
WORKDIR /home/sandbox

# Default command
CMD ["bash"]
