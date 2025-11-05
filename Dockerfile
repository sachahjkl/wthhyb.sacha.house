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

# Production stage - static web server
FROM ghcr.io/static-web-server/static-web-server:latest

# Copy built files to /public
COPY --from=builder /build/dist /public

