import downloadService from '../services/downloadService.js';
import uploadService from '../services/uploadService.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

class DownloadController {
  /**
   * Download single file
   * GET /api/download/file/:id
   */
  async downloadFile(req, res) {
    try {
      const { id } = req.params;

      const downloadData = await downloadService.getFileDownloadUrl(id);

      // Redirect to presigned URL
      res.redirect(downloadData.downloadUrl);
    } catch (error) {
      console.error('Download file error:', error);
      if (error.message === 'File not found') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Get file download URL (without redirect)
   * GET /api/download/file/:id/url
   */
  async getFileDownloadUrl(req, res) {
    try {
      const { id } = req.params;

      const downloadData = await downloadService.getFileDownloadUrl(id);

      res.json(successResponse(downloadData, 'Download URL generated successfully'));
    } catch (error) {
      console.error('Get download URL error:', error);
      if (error.message === 'File not found') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Download folder as ZIP
   * GET /api/download/folder/:id
   */
  async downloadFolder(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.query;

      // Get folder details
      const folderData = await uploadService.getFileById(id).catch(() => null);
      const folderName = name || folderData?.name || 'folder';

      // Stream ZIP
      await downloadService.streamFolderAsZip(id, res, folderName);
    } catch (error) {
      console.error('Download folder error:', error);
      if (error.message === 'Folder not found' || error.message === 'No files found in folder') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      if (!res.headersSent) {
        res.status(500).json(errorResponse(error.message, 500));
      }
    }
  }

  /**
   * Get download statistics for folder
   * GET /api/download/folder/:id/stats
   */
  async getFolderDownloadStats(req, res) {
    try {
      const { id } = req.params;

      const stats = await downloadService.getDownloadStats(id);

      res.json(successResponse(stats, 'Download stats retrieved successfully'));
    } catch (error) {
      console.error('Get download stats error:', error);
      if (error.message === 'Folder not found') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      res.status(500).json(errorResponse(error.message, 500));
    }
  }
}

export default new DownloadController();
