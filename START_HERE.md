# 🚀 JHUB Gallery - Complete Startup Guide

## 🎯 What You Need to Do

**You need TWO terminal windows running at the same time:**

1. **Terminal 1**: Backend (provides the API)
2. **Terminal 2**: Frontend (the web interface)

---

## ⚡ Quick Start (Windows)

### Option A: Using Batch Files (Easiest!)

**Step 1: Start Backend**

- Double-click: `start-backend.bat`
- A black window opens
- Wait for: "Server running on http://localhost:4000"
- **Keep this window open!**

**Step 2: Start Frontend**

- Double-click: `start-frontend.bat`
- A black window opens
- Wait for: "ready - started server on 0.0.0.0:3000"
- **Keep this window open!**

**Step 3: Open Browser**

- Go to: http://localhost:3000
- Click "Admin Dashboard"
- Start using the gallery!

### Option B: Manual Start

**Step 1: Start Backend**

```cmd
cd "c:\Users\PC\3D Objects\jhub-gallery\backend"
node src\index.js
```

**Keep this terminal open!**

**Step 2: Start Frontend (NEW terminal)**

```cmd
cd "c:\Users\PC\3D Objects\jhub-gallery\frontend"
npm run dev
```

**Keep this terminal open!**

---

## 🎨 How to Use After Starting

### 1. Create Your First Folder

1. Go to: http://localhost:3000/admin
2. Look at the **left sidebar**
3. Find the **"+"** button next to "Folders"
4. Click it
5. Type: "My Photos" (or any name)
6. Click "Create Folder"
7. ✅ Folder appears!

### 2. Upload Your First Photo

1. **Click the folder** you just created (turns BLUE)
2. **Click "Upload Files"** (top right, blue button)
3. A **cloud icon box** appears
4. **Drag an image** into the box
5. Or **click the box** and select a file
6. ✅ Watch it upload!

### 3. View Your Photo

- The photo appears as a thumbnail
- Click it to see full-size
- Press ESC to close
- Try uploading more!

---

## 🎯 Visual Guide

```
╔═══════════════════════════════════════════════════════════╗
║  JHUB Gallery Admin                         [Search] [⚏⚎] ║
║                                              [Upload Files]║ ← Click this!
╠═══════════════════════════════════════════════════════════╣
║                   │                                        ║
║  Folders      [+] │  ← FIRST: Select a folder             ║
║  ├─ My Photos ← │  │  ← It turns BLUE when selected        ║
║  │  └─ Beach     │                                        ║
║  └─ Work         │  ← THEN: Click Upload Files button    ║
║                   │                                        ║
║                   │  ☁️ Drag & drop images here           ║
║                   │  or click to browse                    ║
║                   │  Maximum file size: 50MB               ║
║                   │                                        ║
╚═══════════════════════════════════════════════════════════╝
```

---

## ❗ Troubleshooting

### Problem: "Add Folder" button doesn't work

**Check:**

1. ✅ Backend is running (Terminal 1)
2. ✅ Frontend is running (Terminal 2)
3. ✅ Browser is at http://localhost:3000/admin
4. ✅ Press F12, check Console for errors

**Solution:**

- Press **Ctrl + F5** (hard refresh)
- Check both terminals are still running
- Try clicking the "+" button again

### Problem: Can't upload

**Check:**

1. ✅ Is a folder selected? (Should be BLUE)
2. ✅ Is "Upload Files" button visible?
3. ✅ Is backend running?

**Solution:**

- Click a folder first (it MUST be blue)
- Then click "Upload Files"
- Then drag images

### Problem: Servers won't start

**Backend Error: "port 4000 already in use"**

```cmd
# Kill the process
taskkill /F /IM node.exe
# Start again
node src\index.js
```

**Frontend Error: "port 3000 already in use"**

```cmd
# Kill the process
taskkill /F /IM node.exe
# Start again
npm run dev
```

---

## 🔍 Testing Checklist

Before using the gallery, verify:

- [ ] Backend terminal shows: "Server running on http://localhost:4000"
- [ ] Frontend terminal shows: "ready - started server"
- [ ] http://localhost:4000/health returns "OK"
- [ ] http://localhost:3000 shows the homepage
- [ ] http://localhost:3000/admin shows admin dashboard
- [ ] Left sidebar shows "Folders" with "+" button
- [ ] Can click "+" to open create folder dialog

If all checked ✅ → Gallery is ready to use!

---

## 📊 What Each Terminal Shows

### Terminal 1 (Backend)

```
Server running on http://localhost:4000
Connected to PostgreSQL database
MinIO client initialized successfully
Buckets verified: jhub-photos-original, jhub-photos-thumbnails
```

### Terminal 2 (Frontend)

```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
compiled successfully
```

---

## 🎓 First-Time Setup Flow

```
1. Start backend          → Wait for "Server running"
2. Start frontend         → Wait for "ready - started"
3. Open browser          → http://localhost:3000
4. Click Admin Dashboard → Opens admin interface
5. Click "+" button      → Create folder dialog
6. Create "Test" folder  → Appears in sidebar
7. Click "Test" folder   → Turns blue (selected)
8. Click "Upload Files"  → Upload area appears
9. Drag test image       → Upload progress shows
10. See thumbnail        → Success! 🎉
```

---

## 💡 Pro Tips

### Keep Terminals Open

- Don't close the terminal windows
- They need to run the whole time
- Minimize them if needed

### Refresh Browser

- If something looks wrong, press **Ctrl + F5**
- This clears cache and reloads

### Check Console

- Press **F12** in browser
- Click **Console** tab
- Look for error messages (red text)

### Test Backend First

- Go to: http://localhost:4000/health
- Should see: "OK" or status message
- If this works, backend is fine

---

## 🆘 Emergency Restart

If everything is broken:

1. **Close all terminals** (Ctrl + C in each)
2. **Wait 5 seconds**
3. **Start backend** (use batch file or manual)
4. **Wait for "Server running"**
5. **Start frontend** (use batch file or manual)
6. **Wait for "ready - started"**
7. **Open browser** http://localhost:3000
8. **Hard refresh** (Ctrl + F5)

---

## 📱 Browser Requirements

- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Firefox
- ✅ Safari

**Note**: Make sure JavaScript is enabled!

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Homepage loads with two cards
2. ✅ Admin dashboard shows folder tree
3. ✅ Can create folders
4. ✅ Can select folders (they turn blue)
5. ✅ Upload button appears when folder selected
6. ✅ Can drag and drop images
7. ✅ Progress bars show during upload
8. ✅ Thumbnails appear after upload

---

## 🎉 You're Ready!

Follow these steps and you should be able to:

- ✅ Create folders
- ✅ Upload photos
- ✅ View gallery
- ✅ Preview images
- ✅ Search files

**Enjoy using JHUB Gallery! 📸✨**
