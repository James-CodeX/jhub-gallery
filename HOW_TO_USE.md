# 📸 How to Use JHUB Gallery - Step by Step

## 🎯 Quick Overview

1. **Start the servers** (backend + frontend)
2. **Create a folder** to organize your photos
3. **Select the folder** you want to upload to
4. **Click "Upload Files"** button
5. **Drag & drop** images or click to browse
6. **Watch the magic happen!** ✨

---

## 📖 Detailed Instructions

### Step 1: Start the Application

**Terminal 1 - Backend:**

```bash
cd "c:\Users\PC\3D Objects\jhub-gallery\backend"
node src/index.js
```

**Terminal 2 - Frontend:**

```bash
cd "c:\Users\PC\3D Objects\jhub-gallery\frontend"
npm run dev
```

### Step 2: Open the Admin Dashboard

1. Open your browser
2. Go to: `http://localhost:3000`
3. Click the **"Admin Dashboard"** button
4. You'll see the admin interface

---

## 📁 How to Create a Folder

### Method 1: Main "+" Button

1. Look at the **left sidebar** (it says "Folders" at the top)
2. Find the **"+"** button next to "Folders"
3. Click it
4. A dialog will appear
5. Type your folder name (e.g., "My Photos")
6. Click **"Create Folder"**
7. ✅ Folder appears in the sidebar!

### Method 2: Create Subfolder

1. **Hover** over any existing folder in the sidebar
2. A **three-dot menu** (⋮) appears on the right
3. Click the three dots
4. Select **"New Subfolder"**
5. Type the subfolder name
6. Click **"Create Folder"**
7. ✅ Subfolder appears under the parent!

**Visual Guide:**

```
Folders                           [+]  ← Click here to create root folder
├─ My Photos                      ⋮   ← Hover and click menu
│  ├─ New Subfolder               ⋮   ← Create more subfolders
│  └─ Vacation 2025
└─ Work Photos
```

---

## 📤 How to Upload Photos

### Step 1: Select a Folder

**You MUST select a folder before uploading!**

1. Click on **any folder** in the left sidebar
2. The folder will be **highlighted in blue**
3. You'll see the folder contents in the main area

### Step 2: Open Upload Area

1. Look at the **top right** corner
2. Click the blue **"Upload Files"** button
3. A **drag & drop area** appears with a cloud icon ☁️

### Step 3: Upload Your Photos

**Method A: Drag & Drop** (Easiest!)

1. Open your file explorer (Windows Explorer)
2. Find your photos
3. **Drag** them into the upload box
4. **Drop** them when you see "Drop files here"
5. ✅ Upload starts automatically!

**Method B: Click to Browse**

1. Click anywhere in the upload box
2. A file picker opens
3. Select one or multiple images
4. Click "Open"
5. ✅ Upload starts!

### Step 4: Watch the Progress

You'll see:

- ✅ Each file with a **progress bar**
- ✅ **Percentage** (0% → 100%)
- ✅ **Spinning icon** while uploading
- ✅ **Green checkmark** when complete
- ✅ File **auto-removes** after 3 seconds

### Step 5: View Your Photos

After upload completes:

- Photos appear in the **gallery grid** below
- Click any photo to **preview** full-size
- Use **Grid/List** buttons to change view
- Use **Search** to find specific files

---

## 🖼️ Gallery Features

### Grid View (Default)

- Shows thumbnails in a grid
- Hover to see actions menu
- Click image to preview

### List View

- Shows files in a table
- See file name, size, date
- Click "View" to preview

### Image Preview

- Click any image
- Full-screen preview opens
- Press **ESC** to close
- Or click the **X** button

### Context Menu

- **Hover** over any image
- Click the **three-dot menu** (⋮)
- Options:
  - 👁️ View - Full preview
  - 📥 Download - Save to computer
  - 🔗 Share - Get share link
  - 🗑️ Delete - Remove file

---

## 🔍 Search and Filter

1. Use the **search bar** (top right)
2. Type any part of the filename
3. Results filter in real-time
4. Clear search to see all files

---

## 📋 Complete Workflow Example

Let's upload vacation photos step-by-step:

### 1. Create Folder Structure

```
Folders                    [+] ← Click here
├─ Vacation 2025          ← Create this folder
│  ├─ Beach               ← Create subfolder
│  ├─ Mountains           ← Create subfolder
│  └─ City Tour           ← Create subfolder
```

### 2. Select "Beach" Folder

- Click "Beach" in sidebar
- It turns blue (selected)

### 3. Upload Beach Photos

- Click "Upload Files" button
- Drag 10 beach photos
- Watch them upload
- See thumbnails appear

### 4. Switch to "Mountains"

- Click "Mountains" folder
- It's empty (no photos yet)
- Click "Upload Files"
- Add mountain photos

### 5. View Your Gallery

- Click "Vacation 2025" folder
- See all subfolders
- Browse your organized photos!

---

## ❗ Troubleshooting

### "Upload Files" button doesn't appear

**Problem**: No folder selected

**Solution**:

1. Click any folder in the left sidebar
2. The folder must be **highlighted in blue**
3. Now the "Upload Files" button works

### "Create Folder" button doesn't work

**Problem**: Dialog not appearing

**Solution**:

1. **Refresh the page** (Ctrl + F5)
2. Check browser console (F12) for errors
3. Make sure backend is running
4. Try clicking the "+" button again

### Can't see uploaded images

**Problem**: Upload completed but no thumbnails

**Solution**:

1. Wait 5-10 seconds (thumbnail generation)
2. Refresh the folder (click it again)
3. Check backend console for errors
4. Verify MinIO is accessible

### Upload fails

**Problem**: "Upload failed" error

**Check**:

1. ✅ File is an image (JPG, PNG, GIF, WebP)
2. ✅ File size < 50MB
3. ✅ Backend is running on port 4000
4. ✅ MinIO is accessible
5. ✅ Folder is selected

### Photos are blurry

**Problem**: Only seeing thumbnails

**Solution**:

- Click the image to see full resolution
- Thumbnails are intentionally smaller (400x400)
- Full images load in preview mode

---

## 💡 Pro Tips

### Batch Upload

- Select 50+ images at once
- They upload in parallel (5 at a time)
- Very fast for large collections!

### Keyboard Shortcuts

- **ESC** - Close image preview
- **Ctrl + F5** - Hard refresh page
- **F12** - Open developer console

### Best Practices

1. Create folders **before** uploading
2. Organize by date, event, or category
3. Use descriptive folder names
4. Keep images under 10MB for best performance
5. Use JPG for photos, PNG for graphics

### Folder Organization Examples

```
Option 1: By Date
├─ 2025
│  ├─ January
│  ├─ February
│  └─ March

Option 2: By Event
├─ Weddings
├─ Corporate Events
└─ Birthday Parties

Option 3: By Client
├─ Client A
│  ├─ Project 1
│  └─ Project 2
└─ Client B
```

---

## 🎥 Visual Workflow

```
1. [Folders Sidebar]
   Click folder → Folder highlights blue

2. [Top Right]
   Click "Upload Files" button → Upload area appears

3. [Upload Area]
   Drag files → Progress bars → ✅ Complete

4. [Gallery]
   Thumbnails appear → Click to preview

5. [Preview Mode]
   Full screen image → ESC to close
```

---

## ✅ Checklist Before Uploading

- [ ] Backend server is running (port 4000)
- [ ] Frontend server is running (port 3000)
- [ ] Browser is open to http://localhost:3000/admin
- [ ] At least one folder is created
- [ ] A folder is selected (blue highlight)
- [ ] "Upload Files" button is visible
- [ ] Images are ready (JPG/PNG, < 50MB)

---

## 🆘 Still Having Issues?

1. **Check Backend Console**

   - Look for error messages
   - Verify "Server running on http://localhost:4000"

2. **Check Frontend Console**

   - Open browser DevTools (F12)
   - Look at Console tab for errors

3. **Test Backend API**

   - Open: http://localhost:4000/health
   - Should see: "OK"

4. **Check Environment Variables**

   - Backend `.env` file exists
   - Frontend `.env.local` file exists
   - All credentials are correct

5. **Restart Everything**
   - Close both servers (Ctrl + C)
   - Start backend first
   - Start frontend second
   - Refresh browser (Ctrl + F5)

---

## 📸 Example: Your First Upload

**Let's upload a single photo to test:**

1. ✅ Servers running? Check!
2. ✅ Go to: http://localhost:3000
3. ✅ Click "Admin Dashboard"
4. ✅ Click "+" next to "Folders"
5. ✅ Name it "Test Photos"
6. ✅ Click "Create Folder"
7. ✅ Click "Test Photos" in sidebar (turns blue)
8. ✅ Click "Upload Files" button (top right)
9. ✅ Drag one photo into the box
10. ✅ Watch it upload (progress bar)
11. ✅ See it appear in the gallery!
12. ✅ Click the photo to preview full-size

**Congratulations! You've uploaded your first photo! 🎉**

---

**Need more help? Check the browser console (F12) for detailed error messages!**
