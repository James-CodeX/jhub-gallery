# JHUB Africa Photo Gallery System

A fast, scalable, and elegant photo gallery system built with Next.js, Node.js, MinIO, and PostgreSQL.

## 🚀 Features

- **Fast Upload & Download**: Direct MinIO integration with presigned URLs
- **Scalable Storage**: MinIO object storage with automatic thumbnail generation
- **Hierarchical Organization**: Folder-based structure for organizing photos
- **Share Links**: Generate shareable links for folders and individual files
- **Real-time Progress**: Track upload progress with background processing
- **Elegant UI**: Modern, responsive interface built with Next.js 14 and Tailwind CSS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (for Windows) - [Download](https://www.docker.com/products/docker-desktop/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

Optional (for MinIO CLI operations):

- **MinIO Client (mc)** - [Installation Guide](https://min.io/docs/minio/linux/reference/minio-mc.html)

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│    MinIO    │
│  (Next.js)  │         │ (Node.js)    │         │  (Storage)  │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  PostgreSQL  │
                        │  (Metadata)  │
                        └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │    Redis     │
                        │   (Cache)    │
                        └──────────────┘
```

## 📦 Phase 1: Setup & Infrastructure (COMPLETED)

### Project Structure

```
jhub-gallery/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Helper functions
│   │   └── index.js        # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/               # Next.js 14 application
│   ├── src/
│   │   └── app/           # App Router pages
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── database/              # Database scripts
│   └── init.sql          # Schema initialization
├── minio-init/           # MinIO setup scripts
│   ├── init.sh           # Linux/Mac setup
│   └── init.bat          # Windows setup
└── docker-compose.yml    # Docker orchestration
```

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
cd "c:\Users\PC\3D Objects\jhub-gallery"
```

### Step 2: Setup Environment Variables

#### Backend Environment

```bash
cd backend
copy .env.example .env
```

Edit `backend\.env` with your configuration (default values work for local development).

#### Frontend Environment

```bash
cd ..\frontend
copy .env.example .env.local
```

### Step 3: Start Infrastructure with Docker

From the project root directory:

```bash
# Start MinIO, PostgreSQL, and Redis
docker-compose up -d
```

Wait for all services to be healthy (about 30-60 seconds). You can check the status with:

```bash
docker-compose ps
```

### Step 4: Initialize MinIO Buckets

#### On Windows:

```bash
cd minio-init
init.bat
```

#### On Linux/Mac:

```bash
cd minio-init
chmod +x init.sh
./init.sh
```

### Step 5: Install Backend Dependencies

```bash
cd ..\backend
npm install
```

### Step 6: Start Backend Server

```bash
npm run dev
```

The backend will be available at: `http://localhost:4000`

### Step 7: Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### Step 8: Start Frontend Application

```bash
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## 🔗 Access Points

Once everything is running, you can access:

| Service           | URL                       | Credentials                |
| ----------------- | ------------------------- | -------------------------- |
| **Frontend**      | http://localhost:3000     | N/A                        |
| **Backend API**   | http://localhost:4000/api | N/A                        |
| **MinIO Console** | http://localhost:9001     | minioadmin / minioadmin123 |
| **PostgreSQL**    | localhost:5432            | jhub_admin / jhub_password |
| **Redis**         | localhost:6379            | No password                |

## 🧪 Testing the Setup

### 1. Check Backend Health

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "status": "ok",
  "environment": "development",
  "timestamp": "2025-10-13T..."
}
```

### 2. Check Database Connection

The backend logs should show:

```
✅ Database connected successfully at: ...
```

### 3. Check MinIO Connection

The backend logs should show:

```
✅ MinIO connected successfully. Available buckets: 2
✅ Created bucket: jhub-photos-original
✅ Created bucket: jhub-photos-thumbnails
```

### 4. Visit Frontend

Open http://localhost:3000 in your browser. You should see the JHUB Gallery homepage.

## 🛠️ Development Commands

### Backend

```bash
cd backend

# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

### Frontend

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Database Schema

The database includes the following tables:

- **folders**: Hierarchical folder structure
- **files**: File metadata with MinIO references
- **share_links**: Shareable links for folders/files
- **upload_sessions**: Track multi-file upload progress

See `database/init.sql` for the complete schema.

## 🔐 Security Notes

**For Development:**

- Default credentials are set in `.env.example`
- MinIO console is accessible without VPN

**For Production:**

- Change all default passwords
- Use strong JWT secrets
- Enable SSL/TLS for all connections
- Restrict MinIO console access
- Set up proper firewall rules
- Use environment-specific `.env` files

### Port conflicts

If ports 3000, 4000, 5432, 6379, 9000, or 9001 are already in use:

1. Stop the conflicting service, OR
2. Modify the ports in `docker-compose.yml` and corresponding `.env` files

## 📝 Environment Variables Reference

### Backend (.env)

| Variable       | Description      | Default     |
| -------------- | ---------------- | ----------- |
| NODE_ENV       | Environment mode | development |
| PORT           | Server port      | 4000        |
| POSTGRES_HOST  | Database host    | localhost   |
| POSTGRES_PORT  | Database port    | 5432        |
| MINIO_ENDPOINT | MinIO endpoint   | localhost   |
| MINIO_PORT     | MinIO port       | 9000        |

See `backend/.env.example` for complete list.

### Frontend (.env.local)

| Variable              | Description      | Default                   |
| --------------------- | ---------------- | ------------------------- |
| NEXT_PUBLIC_API_URL   | Backend API URL  | http://localhost:4000/api |
| NEXT_PUBLIC_MINIO_URL | MinIO public URL | http://localhost:9000     |

See `frontend/.env.example` for complete list.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - JHUB Africa

## 🆘 Support

For issues or questions:

- Check the troubleshooting section
- Review the logs: `docker-compose logs -f`
- Contact the development team

---

**Status**: ✅ Phase 1 Complete - Infrastructure Ready!
