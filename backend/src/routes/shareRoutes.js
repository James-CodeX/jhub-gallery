import express from 'express';
import shareController from '../controllers/shareController.js';
import { asyncHandler } from '../utils/errors.js';

const router = express.Router();

/**
 * @route   GET /api/share
 * @desc    Get all share links (admin)
 * @access  Public (add auth middleware later)
 */
router.get('/', asyncHandler(shareController.getAllShareLinks.bind(shareController)));

/**
 * @route   POST /api/share/folder/:folderId
 * @desc    Create share link for folder
 * @access  Public (add auth middleware later)
 */
router.post('/folder/:folderId', asyncHandler(shareController.createFolderShare.bind(shareController)));

/**
 * @route   POST /api/share/file/:fileId
 * @desc    Create share link for file
 * @access  Public (add auth middleware later)
 */
router.post('/file/:fileId', asyncHandler(shareController.createFileShare.bind(shareController)));

/**
 * @route   GET /api/share/resource/:type/:id
 * @desc    Get share links for a specific resource
 * @access  Public
 */
router.get('/resource/:type/:id', asyncHandler(shareController.getResourceShareLinks.bind(shareController)));

/**
 * @route   GET /api/share/:token
 * @desc    Access shared content by token
 * @access  Public
 */
router.get('/:token', asyncHandler(shareController.getSharedContent.bind(shareController)));

/**
 * @route   DELETE /api/share/:id
 * @desc    Deactivate share link
 * @access  Public (add auth middleware later)
 */
router.delete('/:id', asyncHandler(shareController.deactivateShare.bind(shareController)));

export default router;
