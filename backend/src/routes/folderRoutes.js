import express from 'express';
import folderController from '../controllers/folderController.js';
import { asyncHandler } from '../utils/errors.js';

const router = express.Router();

/**
 * @route   GET /api/folders/tree
 * @desc    Get folder tree structure
 * @access  Public (add auth middleware later)
 */
router.get('/tree', asyncHandler(folderController.getFolderTree.bind(folderController)));

/**
 * @route   GET /api/folders/search
 * @desc    Search folders by name
 * @access  Public
 */
router.get('/search', asyncHandler(folderController.searchFolders.bind(folderController)));

/**
 * @route   POST /api/folders
 * @desc    Create a new folder
 * @access  Public (add auth middleware later)
 */
router.post('/', asyncHandler(folderController.createFolder.bind(folderController)));

/**
 * @route   GET /api/folders/:id
 * @desc    Get folder by ID with contents
 * @access  Public
 */
router.get('/:id', asyncHandler(folderController.getFolderById.bind(folderController)));

/**
 * @route   GET /api/folders/:id/stats
 * @desc    Get folder statistics
 * @access  Public
 */
router.get('/:id/stats', asyncHandler(folderController.getFolderStats.bind(folderController)));

/**
 * @route   PUT /api/folders/:id
 * @desc    Update folder (rename)
 * @access  Public (add auth middleware later)
 */
router.put('/:id', asyncHandler(folderController.updateFolder.bind(folderController)));

/**
 * @route   DELETE /api/folders/:id
 * @desc    Delete folder
 * @access  Public (add auth middleware later)
 */
router.delete('/:id', asyncHandler(folderController.deleteFolder.bind(folderController)));

export default router;
