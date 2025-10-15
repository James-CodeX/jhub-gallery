# Backend Dockerfile for JHUB Gallery
# Multi-stage build for optimized production image

# Stage 1: Base image with dependencies
FROM node:18-alpine AS base

# Install system dependencies for sharp (image processing)
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Stage 2: Development dependencies
FROM base AS deps
# Using npm install since package-lock.json may not exist
RUN npm install --frozen-lockfile || npm install

# Stage 3: Production dependencies only
FROM base AS prod-deps
# Using npm install since package-lock.json may not exist
RUN npm install --frozen-lockfile --omit=dev || npm install --omit=dev

# Stage 4: Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Stage 5: Production runner
FROM node:18-alpine AS runner

# Install dumb-init to handle PID 1 and signal forwarding
RUN apk add --no-cache dumb-init

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies and source code
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Switch to non-root user
USER nodejs

# Expose backend port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to run the application
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/index.js"]
