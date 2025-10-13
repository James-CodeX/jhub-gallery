# URGENT: Frontend Restart Required

## 🚨 The frontend MUST be restarted for images to load!

### Why?

Next.js loads `NEXT_PUBLIC_*` environment variables at **startup time**, not at runtime.
The `.env.local` file was updated, but the running frontend still has the old (missing) values.

### How to Fix (2 Simple Steps)

#### Step 1: Stop the Frontend

1. Go to the terminal running the frontend
2. Press **Ctrl+C** to stop it
3. Wait for it to fully stop

#### Step 2: Start the Frontend Again

```bash
start-frontend.bat
```

## Test After Restart

### Method 1: Visit the Debug Page

Open in browser: http://localhost:3000/debug

This will show:

- All environment variables
- A test image that should load
- The URL being used

### Method 2: Try Viewing an Image

1. Go to the gallery
2. Click any image
3. It should now load!

## What the Debug Page Will Show

**Before restart (BROKEN):**

```
NEXT_PUBLIC_MINIO_ENDPOINT: NOT SET
NEXT_PUBLIC_MINIO_BUCKET_ORIGINAL: NOT SET
NEXT_PUBLIC_MINIO_BUCKET_THUMBNAILS: NOT SET
```

**After restart (WORKING):**

```
NEXT_PUBLIC_MINIO_ENDPOINT: http://minio.jameskaranja.me:9000
NEXT_PUBLIC_MINIO_BUCKET_ORIGINAL: jhub-photos-original
NEXT_PUBLIC_MINIO_BUCKET_THUMBNAILS: jhub-photos-thumbnails
```

## Quick Verification

After restarting, open browser console (F12) and check the image URLs.

They should look like:

```
http://minio.jameskaranja.me:9000/jhub-photos-original/[folder-id]/[file-id].jpg
```

NOT like:

```
http://localhost:9000/undefined/[folder-id]/[file-id].jpg
```

## Still Not Working?

1. **Clear browser cache**: Ctrl+Shift+R or Ctrl+F5
2. **Check browser console** for errors
3. **Visit debug page**: http://localhost:3000/debug
4. **Verify environment variables** are loaded correctly

---

## Summary

✅ MinIO buckets configured correctly
✅ Bucket policies set to public
✅ Files exist in MinIO
✅ Frontend .env.local updated
❌ **Frontend not restarted** ← YOU ARE HERE

**Action Required: Restart the frontend now!**
