import shareService from '../services/shareService.js';
import uploadService from '../services/uploadService.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

class ShareController {
  /**
   * Create share link for folder
   * POST /api/share/folder/:folderId
   */
  async createFolderShare(req, res) {
    try {
      const { folderId } = req.params;
      const { title, description, expiryDays } = req.body;

      const shareLink = await shareService.createFolderShareLink(folderId, {
        title,
        description,
        expiryDays: expiryDays || 30,
        createdBy: req.user?.id || 'system'
      });

      // Build full share URL
      const shareUrl = `${req.protocol}://${req.get('host')}/share/${shareLink.token}`;

      res.json(successResponse(
        { ...shareLink, shareUrl },
        'Share link created successfully'
      ));
    } catch (error) {
      console.error('Create folder share error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Create share link for file
   * POST /api/share/file/:fileId
   */
  async createFileShare(req, res) {
    try {
      const { fileId } = req.params;
      const { title, description, expiryDays } = req.body;

      const shareLink = await shareService.createFileShareLink(fileId, {
        title,
        description,
        expiryDays: expiryDays || 30,
        createdBy: req.user?.id || 'system'
      });

      // Build full share URL
      const shareUrl = `${req.protocol}://${req.get('host')}/share/${shareLink.token}`;

      res.json(successResponse(
        { ...shareLink, shareUrl },
        'Share link created successfully'
      ));
    } catch (error) {
      console.error('Create file share error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Access shared content by token
   * GET /api/share/:token
   */
  async getSharedContent(req, res) {
    try {
      const { token } = req.params;

      const shareLink = await shareService.getShareLinkByToken(token);

      // Determine type and get appropriate content
      if (shareLink.folder_id) {
        const contents = await shareService.getSharedFolderContents(token);
        return res.json(successResponse(
          { type: 'folder', ...contents },
          'Shared folder accessed successfully'
        ));
      } else if (shareLink.file_id) {
        const fileData = await shareService.getSharedFileDetails(token);
        
        // Generate download URL
        const downloadData = await uploadService.generatePresignedDownloadUrl(shareLink.file_id);
        
        return res.json(successResponse(
          { type: 'file', ...fileData, download: downloadData },
          'Shared file accessed successfully'
        ));
      }

      res.status(404).json(errorResponse('Invalid share link', 404));
    } catch (error) {
      console.error('Get shared content error:', error);
      if (error.message === 'Share link not found' || error.message === 'Share link has expired') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Deactivate share link
   * DELETE /api/share/:id
   */
  async deactivateShare(req, res) {
    try {
      const { id } = req.params;

      const shareLink = await shareService.deactivateShareLink(id);

      res.json(successResponse(shareLink, 'Share link deactivated successfully'));
    } catch (error) {
      console.error('Deactivate share error:', error);
      if (error.message === 'Share link not found') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Get all share links (admin)
   * GET /api/share
   */
  async getAllShareLinks(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;

      const result = await shareService.getAllShareLinks(
        parseInt(limit),
        parseInt(offset)
      );

      res.json(successResponse(result, 'Share links retrieved successfully'));
    } catch (error) {
      console.error('Get all share links error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Get share links for a resource
   * GET /api/share/resource/:type/:id
   */
  async getResourceShareLinks(req, res) {
    try {
      const { type, id } = req.params;

      if (type !== 'folder' && type !== 'file') {
        return res.status(400).json(errorResponse('Invalid resource type', 400));
      }

      const shareLinks = await shareService.getShareLinksForResource(id, type);

      res.json(successResponse(shareLinks, 'Share links retrieved successfully'));
    } catch (error) {
      console.error('Get resource share links error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }
}

export default new ShareController();
