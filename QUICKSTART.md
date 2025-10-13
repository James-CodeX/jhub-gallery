# 🚀 JHUB Gallery - Quick Start Guide

## Prerequisites Checklist

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database (Neon) configured
- ✅ MinIO bucket set up
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed

---

## Step 1: Start Backend Server

Open a terminal and run:

```bash
cd "c:\Users\PC\3D Objects\jhub-gallery\backend"
node src/index.js
```

You should see:

```
Server running on http://localhost:4000
Connected to PostgreSQL database
MinIO client initialized
```

**Backend URL**: http://localhost:4000

---

## Step 2: Start Frontend Server

Open a **NEW** terminal and run:

```bash
cd "c:\Users\PC\3D Objects\jhub-gallery\frontend"
npm run dev
```

You should see:

```
ready - started server on 0.0.0.0:3000
```

**Frontend URL**: http://localhost:3000

---

## Step 3: Access the Application

### Homepage

Go to: **http://localhost:3000**

You'll see:

- JHUB Gallery homepage
- "Admin Dashboard" button
- "Public Gallery" button

### Admin Dashboard

Click "Admin Dashboard" or go to: **http://localhost:3000/admin**

Features:

- Folder tree sidebar (left)
- Upload button (top right)
- Grid/List view toggle
- Search bar

### Public Gallery

Click "Public Gallery" or go to: **http://localhost:3000/gallery**

Features:

- Browse public folders
- Clean gallery view

---

## Step 4: Test the Features

### Create Your First Folder

1. Go to Admin Dashboard
2. Click the `+` button in the sidebar
3. Enter folder name (e.g., "My Photos")
4. Click "Create Folder"
5. The folder appears in the tree

### Upload Your First Photo

1. Select a folder from the sidebar
2. Click "Upload Files" button
3. Drag & drop an image OR click to browse
4. Watch the upload progress
5. See the image appear in the gallery!

### Try the Gallery Views

- Click the **Grid** icon (squares) for grid view
- Click the **List** icon (lines) for list view
- Use the search bar to filter files

### Preview Images

- Click any image thumbnail
- Full-screen preview opens
- Press ESC or click X to close

---

## Troubleshooting

### Backend won't start

**Error**: "Cannot find module"

```bash
cd backend
npm install
```

**Error**: "Database connection failed"

- Check your `.env` file
- Verify Neon database credentials
- Run database migration: `npm run migrate`

### Frontend won't start

**Error**: "Cannot find module"

```bash
cd frontend
npm install
```

**Error**: "Port 3000 is already in use"

```bash
# Kill the process
taskkill /F /IM node.exe
# Or change port
set PORT=3001 && npm run dev
```

### Images not loading

**Check**:

1. MinIO is accessible at `minio.jameskaranja.me:9000`
2. Buckets exist: `jhub-photos-original` and `jhub-photos-thumbnails`
3. Check browser console for errors (F12)

### Upload fails

**Check**:

1. File is an image (JPG, PNG, GIF, WebP)
2. File size < 50MB
3. Backend is running on port 4000
4. Check backend console for errors

---

## API Endpoints

Test the backend directly:

### Health Check

```bash
http://localhost:4000/health
```

### Get Folder Tree

```bash
http://localhost:4000/api/folders/tree
```

### Create Folder

```bash
curl -X POST http://localhost:4000/api/folders \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Folder", "parentId": null}'
```

---

## Folder Structure

```
jhub-gallery/
├── backend/
│   ├── src/
│   │   ├── index.js          # Start here
│   │   ├── config/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── routes/
│   ├── .env                  # Your credentials
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Homepage
│   │   │   ├── admin/
│   │   │   └── gallery/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── .env.local            # Frontend config
│   └── package.json
└── database/
    └── init.sql              # Database schema
```

---

## Environment Variables

### Backend `.env`

```env
NODE_ENV=development
PORT=4000
API_PREFIX=/api

# Database (Neon)
POSTGRES_HOST=ep-proud-dream-adfdzz39-pooler.c-2.us-east-1.aws.neon.tech
POSTGRES_PORT=5432
POSTGRES_DB=neondb
POSTGRES_USER=neondb_owner
POSTGRES_PASSWORD=your-password
POSTGRES_SSLMODE=require

# MinIO
MINIO_ENDPOINT=minio.jameskaranja.me
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_ORIGINAL=jhub-photos-original
MINIO_BUCKET_THUMBNAILS=jhub-photos-thumbnails
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000

NEXT_PUBLIC_MINIO_ENDPOINT=http://minio.jameskaranja.me:9000
NEXT_PUBLIC_MINIO_BUCKET_ORIGINAL=jhub-photos-original
NEXT_PUBLIC_MINIO_BUCKET_THUMBNAILS=jhub-photos-thumbnails
```

---

## Quick Commands

### Backend

```bash
cd backend

# Start server
node src/index.js

# Run migrations
npm run migrate

# Install dependencies
npm install
```

### Frontend

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Install dependencies
npm install
```

---

## What You Can Do Now

✅ **Create folders** - Organize your photos
✅ **Upload images** - Drag & drop support
✅ **Browse galleries** - Grid and list views
✅ **Preview images** - Full-screen viewer
✅ **Search files** - Find photos quickly
✅ **Manage folders** - Rename and delete

---

## Next Features to Implement

🔲 Share link generation
🔲 File downloads
🔲 Folder ZIP downloads
🔲 Batch operations
🔲 User authentication

---

## Need Help?

1. **Check the console** - Backend and frontend logs
2. **Check browser DevTools** - F12 → Console
3. **Review error messages** - They're descriptive!
4. **Check environment variables** - Verify all credentials

---

**Happy photo managing! 📸✨**
