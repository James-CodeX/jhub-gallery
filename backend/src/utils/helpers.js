import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Generate a unique filename with UUID prefix
 * @param {string} originalName - Original filename
 * @returns {string} - UUID-prefixed filename
 */
export function generateUniqueFilename(originalName) {
  const uuid = uuidv4();
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  return `${uuid}-${sanitized}.${extension}`;
}

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} - Hex token
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Format bytes to human readable size
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Decimal places
 * @returns {string} - Formatted size
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validate if file type is allowed
 * @param {string} mimeType - File MIME type
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean}
 */
export function isFileTypeAllowed(mimeType, allowedTypes) {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2);
      return mimeType.startsWith(prefix + '/');
    }
    return type === mimeType;
  });
}

/**
 * Build materialized path for folder hierarchy
 * @param {string} parentPath - Parent folder path
 * @param {string} folderName - Folder name
 * @returns {string} - Full path
 */
export function buildFolderPath(parentPath, folderName) {
  const sanitized = folderName.replace(/[^a-zA-Z0-9-_]/g, '_');
  return parentPath === '/' ? `/${sanitized}` : `${parentPath}/${sanitized}`;
}

/**
 * Parse materialized path to get folder hierarchy
 * @param {string} path - Folder path
 * @returns {string[]} - Array of folder names
 */
export function parseFolderPath(path) {
  return path.split('/').filter(p => p.length > 0);
}

/**
 * Calculate expiry date from days
 * @param {number} days - Number of days
 * @returns {Date} - Expiry date
 */
export function calculateExpiryDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Check if date has expired
 * @param {Date} expiryDate - Expiry date
 * @returns {boolean}
 */
export function isExpired(expiryDate) {
  if (!expiryDate) return false;
  return new Date() > new Date(expiryDate);
}

/**
 * Sanitize filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} - Extension (lowercase)
 */
export function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * Build MinIO object key
 * @param {string} folderId - Folder UUID
 * @param {string} filename - Filename
 * @returns {string} - Object key
 */
export function buildMinioKey(folderId, filename) {
  return `${folderId}/${filename}`;
}

/**
 * Create success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @returns {object}
 */
export function successResponse(data, message = 'Success') {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {object}
 */
export function errorResponse(message, statusCode = 500) {
  return {
    success: false,
    message,
    statusCode,
  };
}
