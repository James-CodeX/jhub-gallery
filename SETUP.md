# Phase 1 Setup - Quick Start Guide

## ✅ What's Been Completed

Phase 1: Setup & Infrastructure is now **COMPLETE**! Here's what has been set up:

### 1. Project Structure ✓

- Backend (Node.js + Express)
- Frontend (Next.js 14 + TypeScript)
- Database schema (PostgreSQL)
- Docker configuration
- MinIO initialization scripts

### 2. Infrastructure Services ✓

- MinIO for object storage
- PostgreSQL for metadata
- Redis for caching
- All configured with Docker Compose

### 3. Configuration Files ✓

- Environment templates (.env.example)
- Database schema with tables, indexes, and views
- MinIO bucket setup scripts
- Complete documentation

## 🚀 Quick Start Commands

Follow these steps to get everything running:

### 1. Copy Environment Files

```bash
# Backend
cd backend
copy .env.example .env
cd ..

# Frontend
cd frontend
copy .env.example .env.local
cd ..
```

### 2. Start Docker Services

```bash
docker-compose up -d
```

Wait 30-60 seconds for services to be ready.

### 3. Initialize MinIO

```bash
cd minio-init
init.bat
cd ..
```

### 4. Install & Start Backend

```bash
cd backend
npm install
npm run dev
```

Keep this terminal running. Open a new terminal for the next step.

### 5. Install & Start Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🎯 Verify Everything Works

1. **Backend Health**: http://localhost:4000/health
2. **Frontend**: http://localhost:3000
3. **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)

## 📊 Service Status

Check if all services are running:

```bash
docker-compose ps
```

All services should show "Up" and "healthy" status.

## 🔍 View Logs

If something isn't working:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f minio
docker-compose logs -f redis
```

## ⚡ What to Do Next

Phase 1 is complete! You can now:

1. **Test the infrastructure** - All services should be running
2. **Access MinIO console** - Create test uploads manually
3. **Check database** - Connect with your SQL client
4. **Review the code** - Familiarize yourself with the structure

## 🎉 Ready for Phase 2

Once you've verified everything works, you're ready to move to:

- **Phase 2**: Backend API Development (folder management, uploads, share links)

See the main README.md for complete documentation.
