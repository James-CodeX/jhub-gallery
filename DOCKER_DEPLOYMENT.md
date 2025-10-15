# 🐳 Docker Deployment Guide - JHUB Gallery

Complete guide to running JHUB Gallery with Docker and Docker Compose.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Service Architecture](#service-architecture)
- [Development vs Production](#development-vs-production)
- [Common Operations](#common-operations)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### Verify Installation

```bash
docker --version
docker compose version
```

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd jhub-gallery
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
# On Windows (PowerShell)
copy .env.docker .env

# On Linux/Mac
cp .env.docker .env
```

Edit `.env` file and update the following **IMPORTANT** values:

```env
# SECURITY: Change these in production!
POSTGRES_PASSWORD=your_secure_password_here
MINIO_SECRET_KEY=your_secure_minio_password_here
JWT_SECRET=your_very_long_random_secret_key_here
```

### 3. Start the Application

```bash
docker compose up -d
```

This will:

- ✅ Download all required images
- ✅ Build the frontend and backend containers
- ✅ Start PostgreSQL database
- ✅ Start MinIO object storage
- ✅ Initialize MinIO buckets
- ✅ Run database migrations
- ✅ Start the backend API
- ✅ Start the frontend web application

### 4. Access the Application

Once all services are healthy (wait ~60 seconds):

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **MinIO Console**: http://localhost:9001
- **API Health**: http://localhost:4000/health

**MinIO Console Login:**

- Username: `minioadmin` (or your `MINIO_ACCESS_KEY`)
- Password: `minioadmin123` (or your `MINIO_SECRET_KEY`)

### 5. Initialize Database (First Time Only)

The database will be automatically initialized. To verify:

```bash
docker compose exec backend npm run migrate
```

---

## ⚙️ Configuration

### Environment Variables

The `.env` file controls all configuration. Key variables:

#### Database Configuration

```env
POSTGRES_DB=jhub_gallery
POSTGRES_USER=jhub_admin
POSTGRES_PASSWORD=change_me
POSTGRES_PORT=5432
```

#### MinIO Configuration

```env
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=change_me
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
```

#### Application Ports

```env
BACKEND_PORT=4000
FRONTEND_PORT=3000
```

#### API URLs

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
CORS_ORIGIN=http://localhost:3000
```

---

## 🏗️ Service Architecture

The application consists of 5 Docker services:

### 1. **postgres** - PostgreSQL Database

- **Image**: `postgres:16-alpine`
- **Port**: 5432
- **Volume**: `jhub-gallery-postgres-data`
- **Purpose**: Stores all application data (folders, files, share links)

### 2. **minio** - Object Storage

- **Image**: `minio/minio:latest`
- **Ports**: 9000 (API), 9001 (Console)
- **Volume**: `jhub-gallery-minio-data`
- **Purpose**: Stores original photos and thumbnails

### 3. **minio-init** - Bucket Initialization

- **Image**: `minio/mc:latest`
- **Purpose**: Creates buckets and sets policies (runs once)

### 4. **backend** - Node.js API

- **Build**: `./backend/Dockerfile`
- **Port**: 4000
- **Purpose**: REST API for file management and gallery operations

### 5. **frontend** - Next.js Web App

- **Build**: `./frontend/Dockerfile`
- **Port**: 3000
- **Purpose**: User interface for the gallery

### Network

All services communicate via the `jhub-gallery-network` bridge network.

---

## 🔄 Development vs Production

### Development Mode

For development with hot-reload:

```bash
# Use docker-compose.dev.yml (if available) or run services locally
npm run dev  # In backend and frontend directories
```

### Production Mode

The default `docker-compose.yml` runs in production mode:

- Optimized builds
- Multi-stage Dockerfiles
- Health checks enabled
- Non-root users
- Security best practices

---

## 🛠️ Common Operations

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f minio
```

### Check Service Status

```bash
docker compose ps
```

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes data!)
docker compose down -v
```

### Restart a Service

```bash
docker compose restart backend
docker compose restart frontend
```

### Rebuild a Service

```bash
# Rebuild and restart backend
docker compose up -d --build backend

# Rebuild and restart frontend
docker compose up -d --build frontend
```

### Execute Commands in Containers

```bash
# Backend shell
docker compose exec backend sh

# Frontend shell
docker compose exec frontend sh

# Database shell
docker compose exec postgres psql -U jhub_admin -d jhub_gallery

# MinIO client
docker compose exec minio mc ls local
```

### Database Operations

```bash
# Run migrations
docker compose exec backend npm run migrate

# Migrate folders to MinIO
docker compose exec backend npm run migrate-folders

# Fix MinIO policies
docker compose exec backend npm run fix-minio

# Backup database
docker compose exec postgres pg_dump -U jhub_admin jhub_gallery > backup.sql

# Restore database
docker compose exec -T postgres psql -U jhub_admin -d jhub_gallery < backup.sql
```

### Volume Management

```bash
# List volumes
docker volume ls | grep jhub-gallery

# Inspect a volume
docker volume inspect jhub-gallery-postgres-data

# Remove all volumes (WARNING: deletes data!)
docker compose down -v
```

---

## 🐛 Troubleshooting

### Services Won't Start

**Check logs:**

```bash
docker compose logs
```

**Verify ports aren't in use:**

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :5432
netstat -ano | findstr :9000

# Linux/Mac
lsof -i :3000
lsof -i :4000
lsof -i :5432
lsof -i :9000
```

### Backend Can't Connect to Database

**Check if postgres is healthy:**

```bash
docker compose ps postgres
```

**Verify connection:**

```bash
docker compose exec backend sh -c 'nc -zv postgres 5432'
```

### Frontend Can't Reach Backend

**Check backend health:**

```bash
curl http://localhost:4000/health
```

**Verify CORS settings in `.env`:**

```env
CORS_ORIGIN=http://localhost:3000
```

### Images Not Loading

**Check MinIO health:**

```bash
curl http://localhost:9000/minio/health/live
```

**Verify bucket policies:**

```bash
docker compose exec backend npm run fix-minio
```

**Check MinIO console:**

- Go to http://localhost:9001
- Login with credentials from `.env`
- Verify buckets exist: `jhub-photos-original`, `jhub-photos-thumbnails`

### Database Not Initialized

**Run migrations manually:**

```bash
docker compose exec backend npm run migrate
```

### Port Conflicts

**Change ports in `.env`:**

```env
FRONTEND_PORT=3001
BACKEND_PORT=4001
POSTGRES_PORT=5433
MINIO_PORT=9001
```

Then restart:

```bash
docker compose down
docker compose up -d
```

---

## 🚀 Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Change all passwords and secrets in `.env`
- [ ] Use strong, random passwords (32+ characters)
- [ ] Update `JWT_SECRET` with a secure random string
- [ ] Configure proper CORS origins
- [ ] Enable SSL/TLS (use reverse proxy like Nginx/Traefik)
- [ ] Set up proper domain names
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Monitor logs and health checks
- [ ] Use Docker secrets for sensitive data
- [ ] Limit container resource usage
- [ ] Keep images and dependencies updated

### Production Environment Variables

```env
NODE_ENV=production

# Use your domain names
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_MINIO_ENDPOINT=https://cdn.yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Strong passwords
POSTGRES_PASSWORD=<generate-strong-password>
MINIO_SECRET_KEY=<generate-strong-password>
JWT_SECRET=<generate-strong-random-string>
```

### Using a Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# MinIO (CDN)
server {
    listen 80;
    server_name cdn.yourdomain.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker compose exec -T postgres pg_dump -U jhub_admin jhub_gallery | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup MinIO data
docker run --rm -v jhub-gallery-minio-data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/minio_$DATE.tar.gz -C /data .

echo "Backup completed: $DATE"
```

Set up a cron job:

```bash
0 2 * * * /path/to/backup.sh
```

### Health Monitoring

The containers include health checks. Monitor them:

```bash
docker compose ps
```

Integrate with monitoring tools like:

- **Prometheus + Grafana**
- **Uptime Kuma**
- **Healthchecks.io**

---

## 📊 Resource Requirements

### Minimum Requirements

- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 20 GB (plus space for uploaded photos)

### Recommended for Production

- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: SSD with 100+ GB

### Limiting Resources

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M
```

---

## 📝 Notes

- **Data Persistence**: All data is stored in Docker volumes and persists across restarts
- **Database Schema**: Automatically initialized on first run
- **MinIO Buckets**: Automatically created and configured
- **Hot Reload**: Not enabled in production Docker images (use local dev environment)
- **Logs**: Stored in Docker and can be viewed with `docker compose logs`

---

## 🆘 Support

If you encounter issues:

1. Check logs: `docker compose logs`
2. Verify configuration: `cat .env`
3. Check service health: `docker compose ps`
4. Restart services: `docker compose restart`
5. Rebuild if needed: `docker compose up -d --build`

For more help, check the main README.md or project documentation.

---

**Happy Deploying! 🚀**
