import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getRecentlySold,
  adminGetRecentlySold,
  adminCreateRecentlySold,
  adminUpdateRecentlySold,
  adminDeleteRecentlySold,
  adminReorderRecentlySold,
} from '../controllers/recently-sold.controller.js';

const router = Router();

// Multer — memory storage, single image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Admin auth shortcuts
const adminAuth = [authenticate, authorize('ADMIN')];

// ── Public ────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/recently-sold
 * Public: homepage marquee feed
 */
router.get('/', getRecentlySold);

// ── Admin (protected) ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/recently-sold/admin
 */
router.get('/admin', ...adminAuth, adminGetRecentlySold);

/**
 * POST /api/v1/recently-sold/admin
 */
router.post(
  '/admin',
  ...adminAuth,
  upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'image', maxCount: 1 }]),
  adminCreateRecentlySold
);

/**
 * PATCH /api/v1/recently-sold/admin/reorder
 * Must come BEFORE /:id route
 */
router.patch('/admin/reorder', ...adminAuth, adminReorderRecentlySold);

/**
 * PATCH /api/v1/recently-sold/admin/:id
 */
router.patch(
  '/admin/:id',
  ...adminAuth,
  upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'image', maxCount: 1 }]),
  adminUpdateRecentlySold
);

/**
 * DELETE /api/v1/recently-sold/admin/:id
 */
router.delete('/admin/:id', ...adminAuth, adminDeleteRecentlySold);

export default router;
