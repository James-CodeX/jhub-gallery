import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class FolderService {
  /**
   * Create a new folder
   */
  async createFolder(name, parentId = null, createdBy = 'system') {
    try {
      // Get parent folder path if parentId is provided
      let parentPath = '/';
      if (parentId) {
        const parentResult = await db.query(
          'SELECT path FROM folders WHERE id = $1',
          [parentId]
        );
        
        if (parentResult.rows.length === 0) {
          throw new Error('Parent folder not found');
        }
        parentPath = parentResult.rows[0].path;
      }

      // Build new folder path
      const sanitizedName = name.replace(/[^a-zA-Z0-9-_\s]/g, '_').trim();
      const folderPath = parentPath === '/' 
        ? `/${sanitizedName}` 
        : `${parentPath}/${sanitizedName}`;

      // Check if folder with same path already exists
      const existingFolder = await db.query(
        'SELECT id FROM folders WHERE path = $1',
        [folderPath]
      );

      if (existingFolder.rows.length > 0) {
        throw new Error('Folder with this name already exists in this location');
      }

      // Create folder
      const result = await db.query(
        `INSERT INTO folders (id, name, parent_id, path, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [uuidv4(), name, parentId, folderPath, createdBy]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get folder by ID with contents
   */
  async getFolderById(folderId) {
    try {
      // Get folder details
      const folderResult = await db.query(
        'SELECT * FROM folders WHERE id = $1',
        [folderId]
      );

      if (folderResult.rows.length === 0) {
        throw new Error('Folder not found');
      }

      const folder = folderResult.rows[0];

      // Get subfolders
      const subfoldersResult = await db.query(
        `SELECT id, name, path, created_at, 
                (SELECT COUNT(*) FROM files WHERE folder_id = folders.id) as file_count
         FROM folders 
         WHERE parent_id = $1
         ORDER BY name ASC`,
        [folderId]
      );

      // Get files in this folder
      const filesResult = await db.query(
        `SELECT id, filename, original_name, size, mime_type, 
                thumbnail_key, uploaded_at
         FROM files 
         WHERE folder_id = $1
         ORDER BY uploaded_at DESC`,
        [folderId]
      );

      return {
        folder,
        subfolders: subfoldersResult.rows,
        files: filesResult.rows
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get folder tree structure
   */
  async getFolderTree() {
    try {
      const result = await db.query(
        `SELECT id, name, parent_id, path, created_at,
                (SELECT COUNT(*) FROM files WHERE folder_id = folders.id) as file_count,
                (SELECT COUNT(*) FROM folders f WHERE f.parent_id = folders.id) as subfolder_count
         FROM folders
         ORDER BY path ASC`
      );

      // Build tree structure
      const folders = result.rows;
      const folderMap = {};
      const tree = [];

      // Create map of all folders
      folders.forEach(folder => {
        folderMap[folder.id] = { ...folder, children: [] };
      });

      // Build tree
      folders.forEach(folder => {
        if (folder.parent_id === null) {
          tree.push(folderMap[folder.id]);
        } else if (folderMap[folder.parent_id]) {
          folderMap[folder.parent_id].children.push(folderMap[folder.id]);
        }
      });

      return tree;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update folder (rename)
   */
  async updateFolder(folderId, newName) {
    try {
      // Get current folder
      const folderResult = await db.query(
        'SELECT * FROM folders WHERE id = $1',
        [folderId]
      );

      if (folderResult.rows.length === 0) {
        throw new Error('Folder not found');
      }

      const folder = folderResult.rows[0];

      // Don't allow renaming root folder
      if (folder.parent_id === null) {
        throw new Error('Cannot rename root folder');
      }

      // Build new path
      const sanitizedName = newName.replace(/[^a-zA-Z0-9-_\s]/g, '_').trim();
      const pathParts = folder.path.split('/');
      pathParts[pathParts.length - 1] = sanitizedName;
      const newPath = pathParts.join('/');

      // Check if new path already exists
      const existingFolder = await db.query(
        'SELECT id FROM folders WHERE path = $1 AND id != $2',
        [newPath, folderId]
      );

      if (existingFolder.rows.length > 0) {
        throw new Error('Folder with this name already exists in this location');
      }

      // Get all child folders to update their paths
      const childFolders = await db.query(
        'SELECT id, path FROM folders WHERE path LIKE $1',
        [`${folder.path}/%`]
      );

      // Start transaction
      const client = await db.getClient();
      try {
        await client.query('BEGIN');

        // Update current folder
        await client.query(
          'UPDATE folders SET name = $1, path = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
          [newName, newPath, folderId]
        );

        // Update all child folder paths
        for (const childFolder of childFolders.rows) {
          const newChildPath = childFolder.path.replace(folder.path, newPath);
          await client.query(
            'UPDATE folders SET path = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newChildPath, childFolder.id]
          );
        }

        await client.query('COMMIT');

        // Get updated folder
        const updatedResult = await client.query(
          'SELECT * FROM folders WHERE id = $1',
          [folderId]
        );

        return updatedResult.rows[0];
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete folder and all its contents
   */
  async deleteFolder(folderId) {
    try {
      // Get folder
      const folderResult = await db.query(
        'SELECT * FROM folders WHERE id = $1',
        [folderId]
      );

      if (folderResult.rows.length === 0) {
        throw new Error('Folder not found');
      }

      const folder = folderResult.rows[0];

      // Don't allow deleting root folder
      if (folder.parent_id === null) {
        throw new Error('Cannot delete root folder');
      }

      // Get all files in this folder and subfolders
      const filesResult = await db.query(
        `SELECT f.id, f.minio_key, f.thumbnail_key
         FROM files f
         INNER JOIN folders fo ON f.folder_id = fo.id
         WHERE fo.path LIKE $1 OR fo.id = $2`,
        [`${folder.path}/%`, folderId]
      );

      // Delete folder (CASCADE will handle child folders and files in DB)
      await db.query('DELETE FROM folders WHERE id = $1', [folderId]);

      // Return list of files to delete from MinIO
      return {
        deletedFolder: folder,
        filesToDelete: filesResult.rows
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get folder statistics
   */
  async getFolderStats(folderId) {
    try {
      const result = await db.query(
        `SELECT 
          COUNT(DISTINCT f.id) as total_files,
          COALESCE(SUM(f.size), 0) as total_size,
          COUNT(DISTINCT subf.id) as total_subfolders
         FROM folders folder
         LEFT JOIN folders subf ON subf.path LIKE CONCAT(folder.path, '/%')
         LEFT JOIN files f ON f.folder_id = subf.id OR f.folder_id = folder.id
         WHERE folder.id = $1
         GROUP BY folder.id`,
        [folderId]
      );

      return result.rows[0] || {
        total_files: 0,
        total_size: 0,
        total_subfolders: 0
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search folders by name
   */
  async searchFolders(searchTerm) {
    try {
      const result = await db.query(
        `SELECT id, name, path, parent_id, created_at,
                (SELECT COUNT(*) FROM files WHERE folder_id = folders.id) as file_count
         FROM folders
         WHERE name ILIKE $1
         ORDER BY name ASC
         LIMIT 50`,
        [`%${searchTerm}%`]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

export default new FolderService();
