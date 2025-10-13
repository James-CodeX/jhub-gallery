import express from 'express';
import downloadController from '../controllers/downloadController.js';
import { asyncHandler } from '../utils/errors.js';

const router = express.Router();

/**
 * @route   GET /api/download/file/:id
 * @desc    Download single file (redirects to presigned URL)
 * @access  Public
 */
router.get('/file/:id', asyncHandler(downloadController.downloadFile.bind(downloadController)));

/**
 * @route   GET /api/download/file/:id/url
 * @desc    Get file download URL without redirect
 * @access  Public
 */
router.get('/file/:id/url', asyncHandler(downloadController.getFileDownloadUrl.bind(downloadController)));

/**
 * @route   GET /api/download/folder/:id
 * @desc    Download folder as ZIP
 * @access  Public
 */
router.get('/folder/:id', asyncHandler(downloadController.downloadFolder.bind(downloadController)));

/**
 * @route   GET /api/download/folder/:id/stats
 * @desc    Get download statistics for folder
 * @access  Public
 */
router.get('/folder/:id/stats', asyncHandler(downloadController.getFolderDownloadStats.bind(downloadController)));

export default router;
