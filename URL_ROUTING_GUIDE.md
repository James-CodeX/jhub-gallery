# URL Routing Implementation Guide

## Overview

The gallery now supports proper URL routing for folders and files. You can bookmark, share, and navigate using URLs!

## Routes

### Admin Routes

#### 1. Admin Landing Page

```
/admin
```

- Shows folder tree sidebar
- Click any folder to open it (URL will update)

#### 2. Folder View

```
/admin/folder/[folderId]
```

- Shows folder contents (subfolders and files)
- Browse through files and subfolders
- Upload files to this folder
- URL updates when you select different folders

**Example:**

```
/admin/folder/abb7725d-5cb2-4e4d-a70c-1dd949b1670a
```

#### 3. File Preview

```
/admin/folder/[folderId]?file=[fileId]
```

- Opens image preview modal
- Shows full-size image
- Navigate to previous/next images
- URL automatically updates
- Shareable link to specific image!

**Example:**

```
/admin/folder/abb7725d-5cb2-4e4d-a70c-1dd949b1670a?file=94a6dbac-2cac-44b5-94c9-01693e8e9d16
```

### Public Gallery Routes

#### 1. Gallery Landing

```
/gallery
```

- Shows all root folders
- Public view (no admin controls)

#### 2. Public Folder View

```
/gallery/[folderId]
```

- Browse folder contents publicly
- View images in full screen

## Features

### 1. URL Updates Automatically ✅

- Click a folder → URL changes to `/admin/folder/[folderId]`
- Click an image → URL adds `?file=[fileId]` parameter
- Close image → URL removes file parameter
- Use browser back/forward buttons!

### 2. Direct Navigation ✅

You can now:

- **Bookmark a folder**: Save `/admin/folder/[folderId]` to return later
- **Share a folder**: Send the URL to someone
- **Share a specific image**: Copy URL with `?file=` parameter
- **Deep link**: Open specific folder/file directly from URL

### 3. Browser History ✅

- Navigate using browser back/forward buttons
- Each action creates a history entry
- Intuitive browsing experience

## Usage Examples

### Example 1: Navigate to a Folder

1. Go to `/admin`
2. Click on folder "Wedding Photos" in sidebar
3. URL becomes: `/admin/folder/abc123-def456`
4. Bookmark this URL to return directly to this folder!

### Example 2: View and Share an Image

1. Open folder at `/admin/folder/abc123`
2. Click on image "DSC_8299.JPG"
3. URL becomes: `/admin/folder/abc123?file=xyz789`
4. Copy this URL and share with others!

### Example 3: Deep Linking

Share this URL with someone:

```
http://localhost:3000/admin/folder/abc123?file=xyz789
```

When they visit:

1. Page loads the folder `abc123`
2. Image `xyz789` opens automatically in preview modal
3. They see exactly what you wanted to show them!

## Technical Implementation

### Component Structure

```
/admin
├── page.tsx                    (Landing - folder selector)
└── folder/[folderId]/
    └── page.tsx               (Folder view with files)
```

### URL Parameters

- **Path Parameter**: `/admin/folder/[folderId]` - The folder ID
- **Query Parameter**: `?file=[fileId]` - The file ID (optional)

### State Management

- URL is the source of truth
- Components read from URL using `useParams()` and `useSearchParams()`
- Navigation uses `router.push()` to update URL

### Navigation Flow

```
User Action          →  URL Change                    →  Component Update
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Click folder         →  /admin/folder/[id]           →  FolderPage loads
Click image          →  /admin/folder/[id]?file=[id] →  Modal opens
Close modal          →  /admin/folder/[id]           →  Modal closes
Click subfolder      →  /admin/folder/[new-id]       →  New folder loads
Browser back         →  Previous URL                 →  Previous state
```

## Benefits

### For Users

✅ **Bookmarkable** - Save your place and return later
✅ **Shareable** - Send specific folders/images to others
✅ **Intuitive** - Browser back/forward works as expected
✅ **Fast** - Direct access without clicking through UI

### For Developers

✅ **SEO-friendly** - Each page has unique URL
✅ **Analytics** - Track which folders/files are viewed
✅ **Testing** - Directly navigate to any state via URL
✅ **Debugging** - URL shows exact app state

## API Integration

The routing integrates with these API endpoints:

```javascript
// Get folder contents
GET /api/folders/:folderId

// Response includes:
{
  folder: { id, name, path, ... },
  files: [{ id, minio_key, original_name, ... }],
  subfolders: [{ id, name, ... }]
}
```

## Tips & Tricks

### 1. Quick Folder Switching

Instead of clicking through sidebar multiple times:

```
/admin/folder/folder-1  →  /admin/folder/folder-2
```

Just edit the URL and press Enter!

### 2. Share Specific Image

Right-click image modal and "Copy Link" to share exact image view.

### 3. Create Shortcuts

Save commonly accessed folders as browser bookmarks:

- Events folder
- Client uploads folder
- Archive folder

### 4. Keyboard Navigation

- Press ESC to close image modal (URL updates)
- Use arrow keys to navigate images (URL updates)
- Browser Ctrl+Left/Right for history navigation

## Migration Notes

### Before (No URL Routing)

- URLs stayed at `/admin` regardless of what you were viewing
- Couldn't share or bookmark specific folders
- Browser back button went to previous page, not previous folder
- No deep linking possible

### After (With URL Routing)

- Each folder has unique URL: `/admin/folder/[id]`
- Each image can be directly accessed: `?file=[id]`
- Browser history works properly
- Shareable and bookmarkable!

## Troubleshooting

### Issue: URL doesn't update when clicking folder

**Solution**: Make sure you're using the new `GalleryGrid` with `onFolderClick` prop.

### Issue: File modal opens but URL doesn't change

**Solution**: Make sure you're using the handler from the folder page, not internal state.

### Issue: Shared URL doesn't open correct image

**Solution**: Ensure backend is returning `minio_key` in file objects (recent fix).

## Next Steps

Potential enhancements:

- [ ] Add URL slugs for SEO (e.g., `/admin/folder/wedding-2025`)
- [ ] Add pagination query params (e.g., `?page=2`)
- [ ] Add filter query params (e.g., `?type=image&sort=date`)
- [ ] Add breadcrumb navigation from URL path
- [ ] Add share buttons with pre-filled URLs

---

**Status**: ✅ Fully implemented and working!
