# Photo Gallery System for JHUB Africa - Implementation Guide

This is an excellent project! Let me break down a comprehensive approach for building a scalable, fast, and elegant photo gallery system.

## Recommended Tech Stack

### Backend

- **Node.js + Express**
- **MinIO** for object storage (excellent choice!)
- **PostgreSQL** for metadata (folder structure, file info, permissions)

### Frontend

- **Next.js 14+** with App Router (React framework)
- **TailwindCSS** for styling (minimal & elegant)
- **shadcn/ui** for UI components
- **Tanstack Query** for data fetching
- **Uppy** or **Dropzone** for multi-file uploads

### Additional Tools

- **Sharp** (Node.js) for image optimization
- **Bull** or **BullMQ** for background job processing
- **WebSocket** or **Server-Sent Events** for real-time upload progress

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│    MinIO    │
│  (Next.js)  │         │ (Node/Python)│         │  (Storage)  │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  PostgreSQL  │
                        │  (Metadata)  │
                        └──────────────┘
```

## Implementation Plan

### Phase 1: Setup & Infrastructure (Week 1)

1. **MinIO Setup**

IN DEVELOPMENT ILL PROVIDE MINIO SETUP AND THE DATABASE URL CREDENTIALS IN THE .ENV FILE

- Install MinIO server (Docker recommended)
- Create buckets: `jhub-photos-original`, `jhub-photos-thumbnails`
- Configure bucket policies for public read on shared links
- Enable versioning for safety

2. **Database Schema**

   ```sql
   -- Folders table
   CREATE TABLE folders (
     id UUID PRIMARY KEY,
     name VARCHAR(255),
     parent_id UUID REFERENCES folders(id),
     path TEXT, -- Materialized path for quick lookups
     created_at TIMESTAMP,
     created_by UUID
   );

   -- Files table
   CREATE TABLE files (
     id UUID PRIMARY KEY,
     folder_id UUID REFERENCES folders(id),
     filename VARCHAR(255),
     original_name VARCHAR(255),
     minio_key TEXT,
     thumbnail_key TEXT,
     size BIGINT,
     mime_type VARCHAR(100),
     uploaded_at TIMESTAMP
   );

   -- Share links table
   CREATE TABLE share_links (
     id UUID PRIMARY KEY,
     token VARCHAR(64) UNIQUE,
     folder_id UUID REFERENCES folders(id),
     file_id UUID REFERENCES files(id),
     expires_at TIMESTAMP,
     created_at TIMESTAMP
   );
   ```

### Phase 2: Backend API (Week 2)

**Key Endpoints:**

```javascript
// Folder Management
POST   /api/folders              // Create folder
GET    /api/folders/:id          // Get folder contents
PUT    /api/folders/:id          // Rename folder
DELETE /api/folders/:id          // Delete folder
GET    /api/folders/:id/tree     // Get folder tree

// File Upload
POST   /api/upload/initiate      // Get presigned URLs
POST   /api/upload/complete      // Confirm upload complete
POST   /api/upload/batch         // Upload multiple files

// Sharing
POST   /api/share/folder/:id     // Generate share link
POST   /api/share/file/:id       // Generate file link
GET    /api/share/:token          // Access shared content

// Download
GET    /api/download/file/:id    // Download single file
POST   /api/download/folder/:id  // Download folder as ZIP
```

**Fast Upload Strategy:**

```javascript
// Use presigned URLs for direct MinIO upload
async function getPresignedUploadUrl(filename, folderId) {
  const key = `${folderId}/${uuidv4()}-${filename}`;

  // Generate presigned PUT URL (valid for 1 hour)
  const uploadUrl = await minioClient.presignedPutObject(
    "jhub-photos-original",
    key,
    3600
  );

  return { uploadUrl, key };
}

// Background thumbnail generation
async function processUploadedImage(fileKey) {
  // Download from MinIO
  const stream = await minioClient.getObject("jhub-photos-original", fileKey);

  // Generate thumbnail with Sharp
  const thumbnail = await sharp(stream)
    .resize(400, 400, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Upload thumbnail back to MinIO
  await minioClient.putObject(
    "jhub-photos-thumbnails",
    `thumb-${fileKey}`,
    thumbnail
  );
}
```

### Phase 3: Frontend (Week 3)

**Admin Dashboard Features:**

1. **Folder Tree Navigation** (left sidebar)
2. **Grid/List View** for files
3. **Bulk Upload** with progress indicators
4. **Drag & Drop** file organization
5. **Share Link Generator**

**JHUB Color Scheme:**

```javascript
// tailwind.config.js - adjust to JHUB's actual colors
module.exports = {
  theme: {
    extend: {
      colors: {
        "jhub-primary": "#your-primary-color",
        "jhub-secondary": "#your-secondary-color",
        "jhub-accent": "#your-accent-color",
      },
    },
  },
};
```

**Sample Upload Component:**

```javascript
// Using Uppy for multi-file upload
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";

const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: ["image/*"],
    maxNumberOfFiles: 500,
  },
}).use(XHRUpload, {
  endpoint: "/api/upload",
  bundle: false, // Upload files individually
  limit: 5, // 5 concurrent uploads
});

// Progress tracking
uppy.on("upload-progress", (file, progress) => {
  // Update UI with progress
});
```

### Phase 4: Optimization (Week 4)

1. **CDN Integration**

   - Put CloudFlare in front of MinIO for faster downloads
   - Cache thumbnails aggressively

2. **Lazy Loading**

   - Implement virtual scrolling for large galleries
   - Load images on-demand

3. **Image Optimization**

   - Generate multiple sizes (thumbnail, medium, original)
   - Use WebP format with JPEG fallback
   - Implement progressive image loading

4. **Caching Strategy**
   - Redis cache for folder structures
   - Browser cache for thumbnails (1 week)
   - Service worker for offline access

## Performance Optimizations

### Fast Uploads

```javascript
// Chunked upload for large files
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

async function uploadLargeFile(file, folderId) {
  const chunks = Math.ceil(file.size / CHUNK_SIZE);

  // Initialize multipart upload
  const uploadId = await minioClient.initiateMultipartUpload(
    "jhub-photos-original",
    key
  );

  // Upload chunks in parallel (max 3 concurrent)
  const parts = await uploadChunksInParallel(file, uploadId, 3);

  // Complete upload
  await minioClient.completeMultipartUpload(
    "jhub-photos-original",
    key,
    uploadId,
    parts
  );
}
```

### Fast Downloads

```javascript
// Bulk download as ZIP
async function downloadFolderAsZip(folderId) {
  const files = await getFilesInFolder(folderId);

  // Stream ZIP creation
  const archive = archiver("zip", {
    zlib: { level: 1 }, // Fast compression
  });

  for (const file of files) {
    const stream = await minioClient.getObject(
      "jhub-photos-original",
      file.minio_key
    );
    archive.append(stream, { name: file.filename });
  }

  return archive.finalize();
}
```

## Security Considerations

1. **Authentication**: Use JWT tokens
2. **Rate Limiting**: Prevent abuse (100 uploads/hour per user)
3. **File Validation**: Check MIME types, scan for malware
4. **Share Link Expiration**: Auto-expire after 30 days
5. **Access Control**: Admin-only upload, public can only download shared links

## Deployment

```yaml
# docker-compose.yml
version: "3.8"
services:
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  backend:
    build: ./backend
    depends_on:
      - minio
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

## Next Steps

1. Set up your development environment
2. Create a proof-of-concept with 1 folder and 10 images
3. Test upload/download speeds
4. Iterate on the UI with feedback from JHUB team
5. Load test with 1000+ images

Would you like me to create starter code for any specific component, or dive deeper into any particular aspect of the implementation?
