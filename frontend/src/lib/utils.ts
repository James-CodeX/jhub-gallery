import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Generate thumbnail URL for MinIO
 */
export function getThumbnailUrl(thumbnailKey: string | null): string | null {
  if (!thumbnailKey) return null;
  const minioEndpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'http://minio.jameskaranja.me:9000';
  const bucket = process.env.NEXT_PUBLIC_MINIO_BUCKET_THUMBNAILS || 'jhub-photos-thumbnails';
  return `${minioEndpoint}/${bucket}/${thumbnailKey}`;
}

/**
 * Generate original image URL for MinIO
 */
export function getImageUrl(minioKey: string): string {
  const minioEndpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'http://minio.jameskaranja.me:9000';
  const bucket = process.env.NEXT_PUBLIC_MINIO_BUCKET_ORIGINAL || 'jhub-photos-original';
  return `${minioEndpoint}/${bucket}/${minioKey}`;
}

/**
 * Get icon name for file type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf')) return 'file-pdf';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'file-archive';
  return 'file';
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Build folder breadcrumb from path
 */
export function buildBreadcrumbs(path: string | null | undefined): Array<{ name: string; path: string }> {
  // Handle null, undefined, or empty path
  if (!path || path === '/') return [{ name: 'Root', path: '/' }];

  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Root', path: '/' }];

  let currentPath = '';
  for (const part of parts) {
    currentPath += `/${part}`;
    breadcrumbs.push({ name: part, path: currentPath });
  }

  return breadcrumbs;
}

/**
 * Generate share URL
 */
export function getShareUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
  return `${baseUrl}/share/${token}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Download file from URL
 */
export function downloadFromUrl(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number = 50): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[] = ['image/*']): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -2));
    }
    return file.type === type;
  });
}
