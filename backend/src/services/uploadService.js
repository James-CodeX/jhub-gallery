import minioClient from '../config/minio.js';
import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { buildMinioKey } from '../utils/helpers.js';

class UploadService {
  /**
   * Generate presigned URL for file upload
   */
  async generatePresignedUploadUrl(filename, folderId, mimeType) {
    try {
      // Verify folder exists
      const folderResult = await db.query(
        'SELECT id FROM folders WHERE id = $1',
        [folderId]
      );

      if (folderResult.rows.length === 0) {
        throw new Error('Folder not found');
      }

      // Generate unique key for MinIO
      const fileId = uuidv4();
      const extension = filename.split('.').pop();
      const minioKey = `${folderId}/${fileId}.${extension}`;

      // Generate presigned PUT URL (valid for 1 hour)
      const uploadUrl = await minioClient.getClient().presignedPutObject(
        minioClient.buckets.original,
        minioKey,
        3600 // 1 hour
      );

      return {
        fileId,
        uploadUrl,
        minioKey,
        bucket: minioClient.buckets.original
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Complete file upload (save metadata to database)
   */
  async completeUpload(fileData) {
    try {
      const {
        fileId,
        folderId,
        filename,
        originalName,
        minioKey,
        size,
        mimeType,
        width,
        height,
        uploadedBy = 'system'
      } = fileData;

      // Insert file metadata
      const result = await db.query(
        `INSERT INTO files (
          id, folder_id, filename, original_name, minio_key, 
          size, mime_type, width, height, uploaded_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          fileId,
          folderId,
          filename,
          originalName,
          minioKey,
          size,
          mimeType,
          width || null,
          height || null,
          uploadedBy
        ]
      );

      const file = result.rows[0];

      // Trigger thumbnail generation in background (async, no await)
      if (mimeType.startsWith('image/')) {
        this.generateThumbnail(minioKey, fileId).catch(err => {
          console.error('Thumbnail generation error:', err);
        });
      }

      return file;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate thumbnail for image
   */
  async generateThumbnail(minioKey, fileId) {
    try {
      console.log(`📸 Generating thumbnail for ${minioKey}...`);

      // Download original image from MinIO
      const stream = await minioClient.getClient().getObject(
        minioClient.buckets.original,
        minioKey
      );

      // Convert stream to buffer
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Generate thumbnail with Sharp
      const thumbnail = await sharp(buffer)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload thumbnail to MinIO
      const thumbnailKey = `thumb-${minioKey}`;
      await minioClient.getClient().putObject(
        minioClient.buckets.thumbnails,
        thumbnailKey,
        thumbnail,
        thumbnail.length,
        {
          'Content-Type': 'image/jpeg'
        }
      );

      // Update file record with thumbnail key
      await db.query(
        'UPDATE files SET thumbnail_key = $1 WHERE id = $2',
        [thumbnailKey, fileId]
      );

      console.log(`✅ Thumbnail generated for ${minioKey}`);

      return thumbnailKey;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  /**
   * Batch upload: generate multiple presigned URLs
   */
  async generateBatchPresignedUrls(files, folderId) {
    try {
      // Verify folder exists
      const folderResult = await db.query(
        'SELECT id FROM folders WHERE id = $1',
        [folderId]
      );

      if (folderResult.rows.length === 0) {
        throw new Error('Folder not found');
      }

      // Create upload session
      const sessionId = uuidv4();
      await db.query(
        `INSERT INTO upload_sessions (id, folder_id, total_files, created_by)
         VALUES ($1, $2, $3, $4)`,
        [sessionId, folderId, files.length, 'system']
      );

      // Generate presigned URLs for all files
      const uploadUrls = [];
      for (const file of files) {
        const fileId = uuidv4();
        const extension = file.filename.split('.').pop();
        const minioKey = `${folderId}/${fileId}.${extension}`;

        const uploadUrl = await minioClient.getClient().presignedPutObject(
          minioClient.buckets.original,
          minioKey,
          3600
        );

        uploadUrls.push({
          fileId,
          filename: file.filename,
          uploadUrl,
          minioKey
        });
      }

      return {
        sessionId,
        uploads: uploadUrls
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update upload session progress
   */
  async updateUploadSession(sessionId, completed = 0, failed = 0) {
    try {
      const result = await db.query(
        `UPDATE upload_sessions 
         SET completed_files = completed_files + $1,
             failed_files = failed_files + $2,
             status = CASE 
               WHEN (completed_files + $1 + failed_files + $2) >= total_files 
               THEN 'completed' 
               ELSE 'in_progress' 
             END
         WHERE id = $3
         RETURNING *`,
        [completed, failed, sessionId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId) {
    try {
      const result = await db.query(
        `SELECT f.*, fo.name as folder_name, fo.path as folder_path
         FROM files f
         INNER JOIN folders fo ON f.folder_id = fo.id
         WHERE f.id = $1`,
        [fileId]
      );

      if (result.rows.length === 0) {
        throw new Error('File not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId) {
    try {
      // Get file details
      const file = await this.getFileById(fileId);

      // Delete from database
      await db.query('DELETE FROM files WHERE id = $1', [fileId]);

      // Return file details for MinIO deletion
      return file;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get presigned URL for downloading a file
   */
  async generatePresignedDownloadUrl(fileId) {
    try {
      const file = await this.getFileById(fileId);

      // Generate presigned GET URL (valid for 1 hour)
      const downloadUrl = await minioClient.getClient().presignedGetObject(
        minioClient.buckets.original,
        file.minio_key,
        3600
      );

      return {
        downloadUrl,
        filename: file.original_name,
        size: file.size,
        mimeType: file.mime_type
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get files in a folder
   */
  async getFilesByFolder(folderId, limit = 100, offset = 0) {
    try {
      const result = await db.query(
        `SELECT * FROM files
         WHERE folder_id = $1
         ORDER BY uploaded_at DESC
         LIMIT $2 OFFSET $3`,
        [folderId, limit, offset]
      );

      const countResult = await db.query(
        'SELECT COUNT(*) FROM files WHERE folder_id = $1',
        [folderId]
      );

      return {
        files: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit,
        offset
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new UploadService();
