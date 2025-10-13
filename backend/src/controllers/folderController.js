import folderService from '../services/folderService.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

class FolderController {
  /**
   * Create a new folder
   * POST /api/folders
   */
  async createFolder(req, res) {
    try {
      const { name, parentId } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json(errorResponse('Folder name is required', 400));
      }

      const folder = await folderService.createFolder(
        name.trim(),
        parentId || null,
        req.user?.id || 'system'
      );

      res.status(201).json(successResponse(folder, 'Folder created successfully'));
    } catch (error) {
      console.error('Create folder error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Get folder by ID with contents
   * GET /api/folders/:id
   */
  async getFolderById(req, res) {
    try {
      const { id } = req.params;

      const folderData = await folderService.getFolderById(id);

      res.json(successResponse(folderData, 'Folder retrieved successfully'));
    } catch (error) {
      console.error('Get folder error:', error);
      if (error.message === 'Folder not found') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Get folder tree structure
   * GET /api/folders/tree
   */
  async getFolderTree(req, res) {
    try {
      const tree = await folderService.getFolderTree();

      res.json(successResponse(tree, 'Folder tree retrieved successfully'));
    } catch (error) {
      console.error('Get folder tree error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Update folder (rename)
   * PUT /api/folders/:id
   */
  async updateFolder(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json(errorResponse('Folder name is required', 400));
      }

      const updatedFolder = await folderService.updateFolder(id, name.trim());

      res.json(successResponse(updatedFolder, 'Folder updated successfully'));
    } catch (error) {
      console.error('Update folder error:', error);
      if (error.message === 'Folder not found') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Delete folder
   * DELETE /api/folders/:id
   */
  async deleteFolder(req, res) {
    try {
      const { id } = req.params;

      const result = await folderService.deleteFolder(id);

      // TODO: Delete files from MinIO in background
      // For now, just return success
      res.json(successResponse(
        { deletedFolderId: result.deletedFolder.id, filesCount: result.filesToDelete.length },
        'Folder deleted successfully'
      ));
    } catch (error) {
      console.error('Delete folder error:', error);
      if (error.message === 'Folder not found') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Get folder statistics
   * GET /api/folders/:id/stats
   */
  async getFolderStats(req, res) {
    try {
      const { id } = req.params;

      const stats = await folderService.getFolderStats(id);

      res.json(successResponse(stats, 'Folder stats retrieved successfully'));
    } catch (error) {
      console.error('Get folder stats error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Search folders
   * GET /api/folders/search?q=searchTerm
   */
  async searchFolders(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json(errorResponse('Search term is required', 400));
      }

      const folders = await folderService.searchFolders(q.trim());

      res.json(successResponse(folders, 'Search completed successfully'));
    } catch (error) {
      console.error('Search folders error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Ensure MinIO folder exists and get presigned URLs
   * POST /api/folders/:id/ensure-minio
   */
  async ensureMinioFolder(req, res) {
    try {
      const { id } = req.params;

      const result = await folderService.ensureMinioFolderExists(id);

      res.json(successResponse(result, 'MinIO folder verified and presigned URLs generated'));
    } catch (error) {
      console.error('Ensure MinIO folder error:', error);
      if (error.message === 'Folder not found') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      res.status(500).json(errorResponse(error.message, 500));
    }
  }
}

export default new FolderController();
