# 📤 Photo Upload Guide

## How to Upload Photos - Step by Step

### Step 1: Create a Folder ✅ (You've Done This!)

- Click the **+** button next to "Folders" in the left sidebar
- Enter a folder name (e.g., "Vacation 2024")
- Click "Create Folder"

### Step 2: Select the Folder 👆 **IMPORTANT!**

```
┌─────────────────────┐
│  📁 Folders         │
│                     │
│  📁 My Photos       │  ← Click on the folder NAME
│  📁 Vacation 2024   │  ← The selected folder turns BLUE
│  📁 Family          │
└─────────────────────┘
```

**The folder must be HIGHLIGHTED in BLUE before you can upload!**

### Step 3: Click "Upload Files" Button

- Look at the top-right corner
- Click the blue **"Upload Files"** button
- If the button is gray and says "Please select a folder first", go back to Step 2

### Step 4: Upload Your Images 🎨

You'll see a drag-and-drop zone that looks like this:

```
┌─────────────────────────────────────┐
│                                     │
│           📤                        │
│    Drag & drop images here          │
│    or click to browse               │
│                                     │
│    Maximum file size: 50MB          │
└─────────────────────────────────────┘
```

**Two ways to upload:**

1. **Drag & Drop**: Drag image files from your computer directly into the box
2. **Click to Browse**: Click anywhere in the box to open file picker

### Step 5: Watch Upload Progress 📊

Each file will show:

- ⏳ Blue spinner = Uploading
- ✅ Green checkmark = Complete
- ❌ Red X = Error (with reason)

Progress bar shows upload percentage (0% → 100%)

## Supported File Types 🖼️

- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

## File Size Limit 📏

- Maximum: **50MB per file**
- Files larger than 50MB will be rejected with an error message

## Common Issues & Solutions 🔧

### ❌ "Upload Files" Button is Gray

**Problem**: No folder is selected
**Solution**: Click on a folder name in the sidebar until it turns blue

### ❌ No Drag-and-Drop Zone Visible

**Problem**: Upload mode not activated
**Solution**:

1. Select a folder (must turn blue)
2. Click "Upload Files" button at top-right
3. Zone should appear below the breadcrumb

### ❌ "Only image files are allowed"

**Problem**: Trying to upload non-image file
**Solution**: Only upload image files (PNG, JPEG, GIF, WebP, SVG)

### ❌ "File size must be less than 50MB"

**Problem**: File too large
**Solution**: Resize/compress the image before uploading

### ❌ Upload gets stuck at 0%

**Problem**: Backend server might be down
**Solution**: Check that backend is running on port 4000

```cmd
cd backend
node src/index.js
```

## Visual Walkthrough 🎥

### Before Selecting Folder:

```
[ Upload Files ] ← Button is DISABLED (gray)
"Select a folder to upload photos" message shown
```

### After Selecting Folder:

```
[ Upload Files ] ← Button is ENABLED (blue)
Folder name appears in sidebar with BLUE background
```

### After Clicking "Upload Files":

```
┌─────────────────────────────────────┐
│ 📂 Uploading to: Vacation 2024      │ ← Shows target folder
├─────────────────────────────────────┤
│           📤                        │
│    Drag & drop images here          │
│    or click to browse               │
└─────────────────────────────────────┘
```

### During Upload:

```
Uploading Files
┌─────────────────────────────────────┐
│ ⏳ photo1.jpg                       │
│ ████████░░░░░░░░  45%              │
├─────────────────────────────────────┤
│ ✅ photo2.jpg                       │
│ Upload complete                     │
└─────────────────────────────────────┘
```

## Tips for Best Results 💡

1. **Create organized folders** before uploading (e.g., by event, date, or category)
2. **Select the correct folder** - double-check the blue highlight
3. **Upload multiple files at once** - drag all files together
4. **Wait for green checkmark** before closing the page
5. **Refresh the gallery** if images don't appear immediately

## Keyboard Shortcuts ⌨️

- **Click folder** → Select folder
- **Click "Upload Files"** → Toggle upload zone
- **Click upload zone** → Open file picker
- **Drag files** → Start upload

## What Happens After Upload? 🎉

1. Files are uploaded to MinIO storage
2. Thumbnails are automatically generated
3. Gallery refreshes to show new images
4. Upload zone auto-hides after completion
5. Images appear in the selected folder

## Need More Help? 🆘

Check these files:

- `HOW_TO_USE.md` - Complete usage guide
- `TROUBLESHOOTING.md` - Common problems
- `START_HERE.md` - Initial setup

Or check the browser console (F12) for error messages.

---

**Remember: FOLDER MUST BE BLUE BEFORE UPLOADING! 🔵**
