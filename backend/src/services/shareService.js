import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, calculateExpiryDate, isExpired } from '../utils/helpers.js';

class ShareService {
  /**
   * Create share link for a folder
   */
  async createFolderShareLink(folderId, options = {}) {
    try {
      const { title, description, expiryDays, createdBy = 'system' } = options;

      // Verify folder exists
      const folderResult = await db.query(
        'SELECT id, name FROM folders WHERE id = $1',
        [folderId]
      );

      if (folderResult.rows.length === 0) {
        throw new Error('Folder not found');
      }

      const folder = folderResult.rows[0];

      // Generate unique token
      const token = generateToken(32);
      const expiresAt = expiryDays ? calculateExpiryDate(expiryDays) : null;

      // Create share link
      const result = await db.query(
        `INSERT INTO share_links (
          id, token, folder_id, title, description, expires_at, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          uuidv4(),
          token,
          folderId,
          title || `Share: ${folder.name}`,
          description,
          expiresAt,
          createdBy
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create share link for a single file
   */
  async createFileShareLink(fileId, options = {}) {
    try {
      const { title, description, expiryDays, createdBy = 'system' } = options;

      // Verify file exists
      const fileResult = await db.query(
        'SELECT id, original_name FROM files WHERE id = $1',
        [fileId]
      );

      if (fileResult.rows.length === 0) {
        throw new Error('File not found');
      }

      const file = fileResult.rows[0];

      // Generate unique token
      const token = generateToken(32);
      const expiresAt = expiryDays ? calculateExpiryDate(expiryDays) : null;

      // Create share link
      const result = await db.query(
        `INSERT INTO share_links (
          id, token, file_id, title, description, expires_at, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          uuidv4(),
          token,
          fileId,
          title || `Share: ${file.original_name}`,
          description,
          expiresAt,
          createdBy
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get share link by token
   */
  async getShareLinkByToken(token) {
    try {
      const result = await db.query(
        `SELECT sl.*, 
                f.name as folder_name,
                f.path as folder_path,
                fi.original_name as file_name,
                fi.size as file_size,
                fi.mime_type as file_mime_type
         FROM share_links sl
         LEFT JOIN folders f ON sl.folder_id = f.id
         LEFT JOIN files fi ON sl.file_id = fi.id
         WHERE sl.token = $1 AND sl.is_active = true`,
        [token]
      );

      if (result.rows.length === 0) {
        throw new Error('Share link not found');
      }

      const shareLink = result.rows[0];

      // Check if expired
      if (shareLink.expires_at && isExpired(shareLink.expires_at)) {
        throw new Error('Share link has expired');
      }

      // Increment access count
      await this.incrementAccessCount(shareLink.id);

      return shareLink;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get contents of shared folder
   */
  async getSharedFolderContents(token) {
    try {
      const shareLink = await this.getShareLinkByToken(token);

      if (!shareLink.folder_id) {
        throw new Error('This link is not for a folder');
      }

      // Get folder contents
      const filesResult = await db.query(
        `SELECT id, filename, original_name, size, mime_type, 
                thumbnail_key, uploaded_at
         FROM files
         WHERE folder_id = $1
         ORDER BY uploaded_at DESC`,
        [shareLink.folder_id]
      );

      // Get subfolders
      const subfoldersResult = await db.query(
        `SELECT id, name, path, created_at,
                (SELECT COUNT(*) FROM files WHERE folder_id = folders.id) as file_count
         FROM folders
         WHERE parent_id = $1
         ORDER BY name ASC`,
        [shareLink.folder_id]
      );

      return {
        shareLink: {
          title: shareLink.title,
          description: shareLink.description,
          folder_name: shareLink.folder_name
        },
        files: filesResult.rows,
        subfolders: subfoldersResult.rows
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get shared file details
   */
  async getSharedFileDetails(token) {
    try {
      const shareLink = await this.getShareLinkByToken(token);

      if (!shareLink.file_id) {
        throw new Error('This link is not for a file');
      }

      // Get full file details
      const fileResult = await db.query(
        `SELECT f.*, fo.name as folder_name
         FROM files f
         INNER JOIN folders fo ON f.folder_id = fo.id
         WHERE f.id = $1`,
        [shareLink.file_id]
      );

      return {
        shareLink: {
          title: shareLink.title,
          description: shareLink.description
        },
        file: fileResult.rows[0]
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Increment access count for share link
   */
  async incrementAccessCount(shareLinkId) {
    try {
      await db.query(
        `UPDATE share_links 
         SET access_count = access_count + 1,
             last_accessed_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [shareLinkId]
      );
    } catch (error) {
      console.error('Error incrementing access count:', error);
    }
  }

  /**
   * Deactivate share link
   */
  async deactivateShareLink(shareLinkId) {
    try {
      const result = await db.query(
        'UPDATE share_links SET is_active = false WHERE id = $1 RETURNING *',
        [shareLinkId]
      );

      if (result.rows.length === 0) {
        throw new Error('Share link not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all share links (for admin)
   */
  async getAllShareLinks(limit = 50, offset = 0) {
    try {
      const result = await db.query(
        `SELECT sl.*,
                f.name as folder_name,
                fi.original_name as file_name
         FROM share_links sl
         LEFT JOIN folders f ON sl.folder_id = f.id
         LEFT JOIN files fi ON sl.file_id = fi.id
         ORDER BY sl.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countResult = await db.query(
        'SELECT COUNT(*) FROM share_links'
      );

      return {
        shareLinks: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit,
        offset
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get share links for a specific folder or file
   */
  async getShareLinksForResource(resourceId, resourceType = 'folder') {
    try {
      const column = resourceType === 'folder' ? 'folder_id' : 'file_id';
      
      const result = await db.query(
        `SELECT * FROM share_links 
         WHERE ${column} = $1 AND is_active = true
         ORDER BY created_at DESC`,
        [resourceId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

export default new ShareService();
