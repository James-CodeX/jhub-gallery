import express from 'express';
import uploadController from '../controllers/uploadController.js';
import { asyncHandler } from '../utils/errors.js';

const router = express.Router();

/**
 * @route   POST /api/upload/initiate
 * @desc    Get presigned URL for single file upload
 * @access  Public (add auth middleware later)
 */
router.post('/initiate', asyncHandler(uploadController.initiateUpload.bind(uploadController)));

/**
 * @route   POST /api/upload/complete
 * @desc    Complete file upload and save metadata
 * @access  Public (add auth middleware later)
 */
router.post('/complete', asyncHandler(uploadController.completeUpload.bind(uploadController)));

/**
 * @route   POST /api/upload/batch
 * @desc    Get presigned URLs for multiple file uploads
 * @access  Public (add auth middleware later)
 */
router.post('/batch', asyncHandler(uploadController.initiateBatchUpload.bind(uploadController)));

/**
 * @route   PUT /api/upload/session/:sessionId
 * @desc    Update upload session progress
 * @access  Public (add auth middleware later)
 */
router.put('/session/:sessionId', asyncHandler(uploadController.updateSession.bind(uploadController)));

export default router;
