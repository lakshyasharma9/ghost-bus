import express from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../utils/response.js';
import { authenticate, requireSellerMode } from '../middleware/auth.middleware.js';
import { trackUploadFields, handleUploadError } from '../middleware/upload.middleware.js';
import { uploadRateLimit, marketplaceRateLimit, signedUrlRateLimit } from '../middleware/rateLimit.middleware.js';
import {
  uploadTrack,
  getTracks,
  getTrackById,
  getMyTracks,
  updateTrack,
  deleteTrack,
  getSellerStats,
  getTrackPreviewUrl,
  getTrackMRTStatus,
  retriggerMRTScan,
} from '../controllers/track.controller.js';

const router = express.Router();

// ─── Seller-only Routes (MUST be before /:id to avoid param conflict) ─────────

/**
 * GET /api/v1/tracks/my-tracks
 * Seller's own tracks — all statuses
 */
router.get(
  '/my-tracks',
  authenticate,
  requireSellerMode,
  [
    query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  getMyTracks
);

// ─── Public Routes ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/tracks
 * Marketplace listing — approved tracks only
 */
router.get(
  '/',
  marketplaceRateLimit,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('minBpm').optional().isInt({ min: 60, max: 220 }).withMessage('Invalid BPM range'),
    query('maxBpm').optional().isInt({ min: 60, max: 220 }).withMessage('Invalid BPM range'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Invalid price'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Invalid price'),
    query('sortBy').optional().isIn(['createdAt', 'price', 'playsCount', 'likesCount']).withMessage('Invalid sort field'),
    query('search').optional().isLength({ max: 100 }).trim().escape(),
    validate,
  ],
  getTracks
);

/**
 * GET /api/v1/tracks/:id
 * Single track detail — public (approved only)
 * Optional auth — if seller is viewing their own pending track
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid track ID'),
    validate,
  ],
  (req, res, next) => {
    // Try to authenticate but don't block if no token
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authenticate(req, res, next);
    }
    next();
  },
  getTrackById
);

// ─── Protected Routes (Seller) ────────────────────────────────────────────────

/**
 * POST /api/v1/tracks
 * Upload a new track (multipart/form-data)
 */
router.post(
  '/',
  authenticate,
  requireSellerMode,
  uploadRateLimit,
  trackUploadFields,
  handleUploadError,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('genre').trim().notEmpty().withMessage('Genre is required').isLength({ max: 100 }),
    body('bpm').isInt({ min: 60, max: 220 }).withMessage('BPM must be between 60 and 220'),
    body('key').trim().notEmpty().withMessage('Musical key is required').isLength({ max: 20 }),
    body('price').isFloat({ min: 149, max: 2000 }).withMessage('Price must be between €149 and €2000'),
    body('transparency').isIn(['original', 'loops']).withMessage('Invalid transparency value'),
    body('vocalType').optional().isIn(['none', 'exclusive', 'ai']).withMessage('Invalid vocal type'),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('tags').optional(),
    validate,
  ],
  uploadTrack
);

/**
 * PATCH /api/v1/tracks/:id
 * Update track metadata (not files)
 */
router.patch(
  '/:id',
  authenticate,
  requireSellerMode,
  [
    param('id').isUUID().withMessage('Invalid track ID'),
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('genre').optional().trim().isLength({ min: 1, max: 100 }),
    body('bpm').optional().isInt({ min: 60, max: 220 }).withMessage('BPM must be between 60 and 220'),
    body('key').optional().trim().isLength({ min: 1, max: 20 }),
    body('price').optional().isFloat({ min: 149, max: 2000 }).withMessage('Price must be between €149 and €2000'),
    body('tags').optional(),
    validate,
  ],
  updateTrack
);

/**
 * DELETE /api/v1/tracks/:id
 * Delete a track (only if not sold)
 */
router.delete(
  '/:id',
  authenticate,
  requireSellerMode,
  [
    param('id').isUUID().withMessage('Invalid track ID'),
    validate,
  ],
  deleteTrack
);

/**
 * GET /api/v1/tracks/:id/preview-url
 * Get a fresh signed S3 URL for audio preview
 */
router.get(
  '/:id/preview-url',
  signedUrlRateLimit,
  [
    param('id').isUUID().withMessage('Invalid track ID'),
    validate,
  ],
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authenticate(req, res, next);
    }
    next();
  },
  getTrackPreviewUrl
);

// ─── MRT Admin Routes ────────────────────────────────────────────────────────

/**
 * GET /api/v1/tracks/:id/mrt-status
 * Admin: Get MRT scan status and verdict for a track
 */
router.get(
  '/:id/mrt-status',
  authenticate,
  [param('id').isUUID().withMessage('Invalid track ID'), validate],
  getTrackMRTStatus
);

/**
 * POST /api/v1/tracks/:id/mrt-rescan
 * Admin: Manually trigger a fresh MRT scan for a track
 */
router.post(
  '/:id/mrt-rescan',
  authenticate,
  [param('id').isUUID().withMessage('Invalid track ID'), validate],
  retriggerMRTScan
);

export default router;
