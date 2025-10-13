import minioClient from '../config/minio.js';
import uploadService from './uploadService.js';
import folderService from './folderService.js';
import db from '../config/database.js';
import archiver from 'archiver';

class DownloadService {
  /**
   * Generate presigned download URL for a single file
   */
  async getFileDownloadUrl(fileId) {
    try {
      return await uploadService.generatePresignedDownloadUrl(fileId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all files in a folder (including subfolders)
   */
  async getAllFilesInFolder(folderId) {
    try {
      // Get folder path
      const folderResult = await db.query(
        'SELECT path FROM folders WHERE id = $1',
        [folderId]
      );

      if (folderResult.rows.length === 0) {
        throw new Error('Folder not found');
      }

      const folderPath = folderResult.rows[0].path;

      // Get all files in this folder and subfolders
      const filesResult = await db.query(
        `SELECT f.id, f.filename, f.original_name, f.minio_key, f.size, 
                fo.path as folder_path
         FROM files f
         INNER JOIN folders fo ON f.folder_id = fo.id
         WHERE fo.path = $1 OR fo.path LIKE $2
         ORDER BY fo.path, f.filename`,
        [folderPath, `${folderPath}/%`]
      );

      return filesResult.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Stream folder as ZIP
   */
  async streamFolderAsZip(folderId, res, folderName = 'download') {
    try {
      const files = await this.getAllFilesInFolder(folderId);

      if (files.length === 0) {
        throw new Error('No files found in folder');
      }

      // Set response headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);

      // Create archiver instance with fast compression
      const archive = archiver('zip', {
        zlib: { level: 1 } // Fast compression
      });

      // Pipe archive to response
      archive.pipe(res);

      // Track errors
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        throw err;
      });

      archive.on('warning', (err) => {
        if (err.code !== 'ENOENT') {
          console.warn('Archive warning:', err);
        }
      });

      // Add files to archive
      for (const file of files) {
        try {
          // Get file stream from MinIO
          const stream = await minioClient.getClient().getObject(
            minioClient.buckets.original,
            file.minio_key
          );

          // Build relative path for ZIP (preserve folder structure)
          const relativePath = file.folder_path.replace(/^\//, '');
          const zipPath = relativePath ? `${relativePath}/${file.original_name}` : file.original_name;

          // Add to archive
          archive.append(stream, { name: zipPath });
        } catch (error) {
          console.error(`Error adding file ${file.original_name}:`, error);
          // Continue with other files
        }
      }

      // Finalize archive
      await archive.finalize();

      return {
        fileCount: files.length,
        folderName
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get download statistics
   */
  async getDownloadStats(folderId) {
    try {
      const files = await this.getAllFilesInFolder(folderId);
      
      const totalSize = files.reduce((sum, file) => sum + BigInt(file.size), BigInt(0));
      
      return {
        fileCount: files.length,
        totalSize: totalSize.toString(),
        estimatedZipSize: Math.floor(Number(totalSize) * 0.9) // Rough estimate
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new DownloadService();
