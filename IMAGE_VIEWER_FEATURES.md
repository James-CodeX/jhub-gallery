# Image Viewer Features - Implementation Guide

## ✅ What's Been Implemented

### 1. Previous/Next Navigation

- **Left/Right arrow buttons** in the image viewer
- Navigate through images in the current folder
- Buttons show/hide based on availability
- Disabled state when at first/last image

### 2. Keyboard Navigation

- **ESC** - Close the image viewer
- **← (Left Arrow)** - Previous image
- **→ (Right Arrow)** - Next image

### 3. Download Functionality

- **Download button** saves image to your computer
- Uses original filename
- Shows loading state while downloading
- Works with any image format

### 4. Share Functionality

- **Share button** copies the current URL to clipboard
- Share exact image view with others
- Shows success confirmation
- Fallback for browsers without clipboard API

## Features Details

### Previous/Next Buttons

**Visual States:**

- **Active** - White semi-transparent button, scales on hover
- **Disabled** - Gray, semi-transparent, non-clickable
- **Hover** - Increases opacity and scales up

**Behavior:**

- Only show when there are images to navigate to
- First image: Previous button disabled
- Last image: Next button disabled
- Middle images: Both buttons active

**Location:**

- Left side of screen (Previous)
- Right side of screen (Next)
- Vertically centered

### Download Button

**How it works:**

1. Click download button
2. Fetches image from MinIO
3. Creates blob and download link
4. Triggers browser download
5. Shows loading state during download

**Features:**

- Preserves original filename
- Works with CORS-enabled images
- Disables during download to prevent multiple clicks
- Console logs success/failure

### Share Button

**How it works:**

1. Click share button
2. Copies current page URL to clipboard
3. URL includes folder ID and file ID
4. Shows green checkmark confirmation
5. Confirmation disappears after 2 seconds

**What gets shared:**

```
http://localhost:3000/admin/folder/[folderId]?file=[fileId]
```

**Features:**

- One-click sharing
- Visual confirmation (✓ icon)
- Toast notification at top
- Fallback prompt if clipboard fails

### Keyboard Shortcuts

| Key | Action         |
| --- | -------------- |
| ESC | Close viewer   |
| ←   | Previous image |
| →   | Next image     |

**Benefits:**

- Fast navigation
- Power user friendly
- Accessibility support
- Intuitive controls

## Usage Examples

### Example 1: Navigate Through Images

```
1. Open image in viewer
2. Click Next button (or press →)
3. View next image
4. Click Previous (or press ←)
5. Go back to previous image
```

### Example 2: Download an Image

```
1. Open image in viewer
2. Click download button at bottom
3. Image saves with original filename
4. Check your Downloads folder
```

### Example 3: Share an Image

```
1. Open image you want to share
2. Click share button
3. See "Link copied!" confirmation
4. Paste link in email/chat/etc.
5. Recipient opens exact image
```

### Example 4: Keyboard Navigation

```
1. Open image
2. Press → key repeatedly to browse forward
3. Press ← to go back
4. Press ESC to close
```

## UI Elements

### Top Bar

```
┌─────────────────────────────────────┐
│ [X Close]                           │
└─────────────────────────────────────┘
```

### Side Navigation

```
┌──────────────────────────────────────┐
│  [◀️]        IMAGE        [▶️]         │
│ Previous              Next           │
└──────────────────────────────────────┘
```

### Bottom Info Bar

```
┌──────────────────────────────────────┐
│ DSC_8299.JPG                         │
│ 4.13 MB • 4032 × 3024 • Oct 13, 2025│
│                                       │
│              [⬇️] [🔗] [🗑️]            │
│            Download Share Delete     │
└──────────────────────────────────────┘
```

### Share Success Toast

```
┌──────────────────────────┐
│ ✓ Link copied to clipboard! │
└──────────────────────────┘
```

## Technical Implementation

### Component: ImagePreviewModal

**New Features:**

```typescript
// Keyboard navigation
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") onPrevious();
    if (e.key === "ArrowRight") onNext();
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);

// Download handler
const handleDownload = async () => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
};

// Share handler
const handleShare = async () => {
  await navigator.clipboard.writeText(window.location.href);
  setShowShareSuccess(true);
};
```

### Navigation Logic

**Determining Previous/Next:**

```typescript
const currentIndex = files.findIndex((f) => f.id === selectedFile.id);

onPrevious =
  currentIndex > 0 ? () => openFile(files[currentIndex - 1]) : undefined;

onNext =
  currentIndex < files.length - 1
    ? () => openFile(files[currentIndex + 1])
    : undefined;
```

**Button States:**

- `onPrevious` exists → Previous button active
- `onPrevious` undefined → Previous button disabled
- Same logic for Next button

## Browser Compatibility

### Download Feature

✅ Modern browsers (Chrome, Firefox, Safari, Edge)
✅ Mobile browsers
✅ Works with any image format supported by browser

### Share Feature (Clipboard API)

✅ Chrome/Edge 63+
✅ Firefox 53+
✅ Safari 13.1+
⚠️ Requires HTTPS in production (works on localhost)
✅ Fallback prompt for unsupported browsers

### Keyboard Navigation

✅ All browsers with JavaScript enabled
✅ Works on desktop only (mobile has touch gestures)

## Accessibility

### Keyboard Support

- Full keyboard navigation
- ESC to close
- Arrow keys to navigate
- Tab to focus buttons

### Screen Readers

- Buttons have `title` attributes
- Alt text on images
- Semantic HTML structure

### Visual Feedback

- Hover states on all buttons
- Focus indicators
- Loading states
- Success confirmations

## Tips & Best Practices

### For Users

1. **Use keyboard shortcuts** for faster navigation
2. **Share button** is faster than copying URL manually
3. **Download preserves quality** - gets original image
4. **Previous/Next** respects current search/filter

### For Developers

1. **Test keyboard navigation** on all pages
2. **Check CORS headers** for download to work
3. **Verify URLs** are shareable (not localhost in production)
4. **Test on mobile** - touch events vs keyboard

## Troubleshooting

### Download Not Working

**Symptom**: Click download, nothing happens

**Solutions:**

1. Check browser console for CORS errors
2. Verify MinIO public read policy is set
3. Check popup blocker isn't blocking download
4. Try in incognito mode

### Share Button No Feedback

**Symptom**: Click share, no confirmation shown

**Solutions:**

1. Check if clipboard API is available (HTTPS required)
2. Look for browser permissions prompt
3. Check browser console for errors
4. Use fallback prompt if needed

### Keyboard Navigation Not Working

**Symptom**: Arrow keys don't change images

**Solutions:**

1. Make sure image viewer is open
2. Click inside viewer to focus
3. Check browser console for JS errors
4. Verify onPrevious/onNext are defined

### Navigation Buttons Disabled

**Symptom**: Can't click Previous/Next buttons

**Solutions:**

1. Check if at first/last image (expected behavior)
2. Verify folder has multiple images
3. Check search filter (may be hiding images)
4. Refresh page to reload file list

## Future Enhancements (Optional)

Potential additions:

- [ ] Zoom in/out controls
- [ ] Rotate image buttons
- [ ] Slideshow mode
- [ ] Touch gestures on mobile
- [ ] Download all images in folder
- [ ] Generate share link with expiry
- [ ] Copy image to clipboard
- [ ] Print image option

---

**Status**: ✅ Fully implemented and working!
