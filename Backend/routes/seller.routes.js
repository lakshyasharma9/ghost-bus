import express from 'express';
import multer from 'multer';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware.js';
import { getSellerStats } from '../controllers/track.controller.js';
import { getSellerProfile, toggleFollow, uploadBanner } from '../controllers/seller-profile.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 } });

/**
 * GET /api/v1/sellers/stats
 * Seller dashboard overview stats
 */
router.get('/stats', authenticate, (req, res, next) => {
  if (!req.user?.sellerModeEnabled) {
    return res.status(403).json({ success: false, message: 'Seller mode not enabled' });
  }
  next();
}, getSellerStats);

/**
 * GET /api/v1/sellers/:username/profile
 * Public: seller/artist profile page data
 */
router.get('/:username/profile', optionalAuth, getSellerProfile);

/**
 * POST /api/v1/sellers/:username/follow
 * Auth required: toggle follow/unfollow
 */
router.post('/:username/follow', authenticate, toggleFollow);

/**
 * POST /api/v1/users/banner
 * Auth required: upload/replace banner image
 */
router.post('/banner', authenticate, upload.fields([{ name: 'banner', maxCount: 1 }]), uploadBanner);

export default router;
