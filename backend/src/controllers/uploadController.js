import uploadService from '../services/uploadService.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

class UploadController {
  /**
   * Initiate file upload - get presigned URL
   * POST /api/upload/initiate
   */
  async initiateUpload(req, res) {
    try {
      const { filename, folderId, mimeType } = req.body;

      if (!filename || !folderId || !mimeType) {
        return res.status(400).json(
          errorResponse('filename, folderId, and mimeType are required', 400)
        );
      }

      const uploadData = await uploadService.generatePresignedUploadUrl(
        filename,
        folderId,
        mimeType
      );

      res.json(successResponse(uploadData, 'Upload URL generated successfully'));
    } catch (error) {
      console.error('Initiate upload error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Complete file upload - save metadata
   * POST /api/upload/complete
   */
  async completeUpload(req, res) {
    try {
      const fileData = req.body;

      // Validate required fields
      const required = ['fileId', 'folderId', 'filename', 'originalName', 'minioKey', 'size', 'mimeType'];
      for (const field of required) {
        if (!fileData[field]) {
          return res.status(400).json(
            errorResponse(`${field} is required`, 400)
          );
        }
      }

      const file = await uploadService.completeUpload(fileData);

      res.json(successResponse(file, 'File uploaded successfully'));
    } catch (error) {
      console.error('Complete upload error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Batch upload initiate - get multiple presigned URLs
   * POST /api/upload/batch
   */
  async initiateBatchUpload(req, res) {
    try {
      const { files, folderId } = req.body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json(
          errorResponse('files array is required', 400)
        );
      }

      if (!folderId) {
        return res.status(400).json(
          errorResponse('folderId is required', 400)
        );
      }

      const batchData = await uploadService.generateBatchPresignedUrls(files, folderId);

      res.json(successResponse(batchData, 'Batch upload URLs generated successfully'));
    } catch (error) {
      console.error('Batch upload error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Update upload session progress
   * PUT /api/upload/session/:sessionId
   */
  async updateSession(req, res) {
    try {
      const { sessionId } = req.params;
      const { completed, failed } = req.body;

      const session = await uploadService.updateUploadSession(
        sessionId,
        completed || 0,
        failed || 0
      );

      res.json(successResponse(session, 'Session updated successfully'));
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Get file by ID
   * GET /api/files/:id
   */
  async getFile(req, res) {
    try {
      const { id } = req.params;

      const file = await uploadService.getFileById(id);

      res.json(successResponse(file, 'File retrieved successfully'));
    } catch (error) {
      console.error('Get file error:', error);
      if (error.message === 'File not found') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Delete file
   * DELETE /api/files/:id
   */
  async deleteFile(req, res) {
    try {
      const { id } = req.params;

      const file = await uploadService.deleteFile(id);

      // TODO: Delete from MinIO in background
      res.json(successResponse(
        { deletedFileId: file.id },
        'File deleted successfully'
      ));
    } catch (error) {
      console.error('Delete file error:', error);
      if (error.message === 'File not found') {
        return res.status(404).json(errorResponse(error.message, 404));
      }
      res.status(500).json(errorResponse(error.message, 500));
    }
  }

  /**
   * Get files in folder
   * GET /api/folders/:folderId/files
   */
  async getFolderFiles(req, res) {
    try {
      const { folderId } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const result = await uploadService.getFilesByFolder(
        folderId,
        parseInt(limit),
        parseInt(offset)
      );

      res.json(successResponse(result, 'Files retrieved successfully'));
    } catch (error) {
      console.error('Get folder files error:', error);
      res.status(500).json(errorResponse(error.message, 500));
    }
  }
}

export default new UploadController();
