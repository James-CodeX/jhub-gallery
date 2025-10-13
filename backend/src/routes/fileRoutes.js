import express from 'express';
import uploadController from '../controllers/uploadController.js';
import { asyncHandler } from '../utils/errors.js';

const router = express.Router();

/**
 * @route   GET /api/files/:id
 * @desc    Get file by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(uploadController.getFile.bind(uploadController)));

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete file
 * @access  Public (add auth middleware later)
 */
router.delete('/:id', asyncHandler(uploadController.deleteFile.bind(uploadController)));

export default router;
