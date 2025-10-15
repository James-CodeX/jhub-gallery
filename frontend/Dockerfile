# Frontend Dockerfile for JHUB Gallery
# Multi-stage build optimized for Next.js

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using npm install since package-lock.json may not exist
RUN npm install --frozen-lockfile || npm install

# Stage 2: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ARG NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
ARG NEXT_PUBLIC_MINIO_BUCKET_ORIGINAL=jhub-photos-original
ARG NEXT_PUBLIC_MINIO_BUCKET_THUMBNAILS=jhub-photos-thumbnails

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MINIO_ENDPOINT=$NEXT_PUBLIC_MINIO_ENDPOINT
ENV NEXT_PUBLIC_MINIO_BUCKET_ORIGINAL=$NEXT_PUBLIC_MINIO_BUCKET_ORIGINAL
ENV NEXT_PUBLIC_MINIO_BUCKET_THUMBNAILS=$NEXT_PUBLIC_MINIO_BUCKET_THUMBNAILS

# Build Next.js application
RUN npm run build

# Debug: List the standalone output
RUN echo "Standalone build contents:" && \
    ls -la .next/standalone/ || echo "No standalone folder!" && \
    ls -la .next/standalone/.next/ || echo "No .next in standalone!"

# Stage 3: Production runner
FROM node:18-alpine AS runner

WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy necessary files for standalone Next.js
# The standalone folder contains server.js and node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy the static assets - MUST be at .next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy startup script
COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x start.sh

# Debug: Verify files are in place
RUN echo "Files in /app:" && ls -la && \
    echo "Server.js exists:" && ls -la server.js || echo "NO SERVER.JS!" && \
    echo ".next folder:" && ls -la .next/ || echo "NO .NEXT FOLDER!"

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose frontend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set hostname to listen on all interfaces (CRITICAL for Docker)
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Use dumb-init to run the application
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js server with our startup script for better debugging
CMD ["./start.sh"]
