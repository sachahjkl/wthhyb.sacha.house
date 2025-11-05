# Build stage
FROM oven/bun:alpine AS builder

WORKDIR /build

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN bun run build

# Production stage - just the files, no runtime
FROM scratch

# Copy built files to /app
COPY --from=builder /build/dist /app

