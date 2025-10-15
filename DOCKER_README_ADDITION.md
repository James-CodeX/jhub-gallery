# 🐳 Docker Quick Start Addition for README.md

Add this section to the README.md after the Prerequisites section:

---

## 🐳 Docker Deployment (Recommended)

The easiest way to run JHUB Gallery is using Docker. All services are pre-configured and will start automatically.

### Prerequisites for Docker Deployment

- Docker Desktop 20.10+ (includes Docker Compose)
- 4GB RAM minimum, 8GB recommended
- 20GB disk space (plus space for photos)

### Quick Start with Docker

1. **Copy environment template:**

   ```bash
   # Windows
   copy .env.docker .env

   # Linux/Mac
   cp .env.docker .env
   ```

2. **Update credentials in `.env`:**

   - Change `POSTGRES_PASSWORD`
   - Change `MINIO_SECRET_KEY`
   - Change `JWT_SECRET`

3. **Start all services:**

   ```bash
   docker compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - MinIO Console: http://localhost:9001

### Using Helper Scripts

**Windows:**

```cmd
docker-start.bat
```

**Linux/Mac:**

```bash
chmod +x docker-start.sh
./docker-start.sh
```

### Docker Commands

**View logs:**

```bash
docker compose logs -f
```

**Stop services:**

```bash
docker compose down
```

**Restart services:**

```bash
docker compose restart
```

**Rebuild after code changes:**

```bash
docker compose up -d --build
```

📖 **For detailed Docker documentation, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)**

---

## 💻 Manual Setup (Alternative to Docker)

If you prefer to run services manually instead of using Docker:
