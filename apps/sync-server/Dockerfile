FROM node:20-alpine AS builder
# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@tessera/sync-server --docker

FROM node:20-alpine AS installer
WORKDIR /app
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN npx turbo run build --filter=@tessera/sync-server...

FROM node:20-alpine AS runner
WORKDIR /app
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 syncserver
USER syncserver
COPY --from=installer /app/ .
CMD ["npm", "run", "start", "--workspace=@tessera/sync-server"]
