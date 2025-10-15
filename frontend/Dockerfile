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

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build Next.js application
RUN npm run build

# Stage 3: Production runner
FROM node:18-alpine AS runner

WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy necessary files for standalone Next.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose frontend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to run the application
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js server
CMD ["node", "server.js"]
