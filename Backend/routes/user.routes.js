import express from 'express';
import { body } from 'express-validator';
import { validate } from '../utils/response.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { avatarUpload, handleUploadError } from '../middleware/upload.middleware.js';
import {
  toggleSellerMode,
  updateProfile,
  changePassword,
  uploadAvatar,
  submitSellerApplication,
  getSellerApplicationStatus,
  submitKyc,
} from '../controllers/user.controller.js';

const router = express.Router();

/**
 * @route   POST /api/v1/users/toggle-seller-mode
 * @desc    Toggle seller mode on/off
 * @access  Private
 */
router.post(
  '/toggle-seller-mode',
  authenticate,
  [
    body('enabled')
      .isBoolean()
      .withMessage('Enabled must be a boolean'),
    validate,
  ],
  toggleSellerMode
);

/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Update user profile (name, username, bio, phone, avatarUrl)
 * @access  Private
 */
router.patch(
  '/profile',
  authenticate,
  [
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Full name must be at least 2 characters'),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio cannot exceed 500 characters'),
    body('avatarUrl')
      .optional()
      .isURL()
      .withMessage('Avatar URL must be a valid URL'),
    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[\d\s\-().]{7,20}$/)
      .withMessage('Phone number is not valid'),
    validate,
  ],
  updateProfile
);

/**
 * @route   POST /api/v1/users/change-password
 * @desc    Change authenticated user's password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/[A-Za-z]/)
      .withMessage('New password must contain at least one letter')
      .matches(/\d/)
      .withMessage('New password must contain at least one number'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    validate,
  ],
  changePassword
);

/**
 * @route   POST /api/v1/users/avatar
 * @desc    Upload profile avatar image to S3
 * @access  Private
 */
router.post(
  '/avatar',
  authenticate,
  avatarUpload,
  handleUploadError,
  uploadAvatar
);

/**
 * @route   GET /api/v1/users/following
 * @desc    Get list of sellers the current user follows
 * @access  Private
 */
router.get('/following', authenticate, async (req, res) => {
  const { default: prisma } = await import('../config/database.js');
  const { successResponse, errorResponse } = await import('../utils/response.js');
  const { getPreviewUrl } = await import('../utils/s3.js');
  try {
    const userId = req.user.id;
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        following: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
            sellerVerified: true,
            _count: {
              select: {
                followers: true,
                tracks: { where: { status: 'APPROVED' } },
              },
            },
          },
        },
      },
    });

    const sellers = await Promise.all(follows.map(async (f) => {
      const s = f.following;
      let avatarUrl = s.avatarUrl;
      if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
        avatarUrl = await getPreviewUrl(avatarUrl).catch(() => avatarUrl);
      }
      return {
        id: s.id,
        fullName: s.fullName,
        username: s.username,
        avatarUrl,
        sellerVerified: s.sellerVerified,
        followers: s._count.followers,
        trackCount: s._count.tracks,
        followedAt: f.createdAt,
      };
    }));

    return successResponse(res, 200, 'Following fetched', { sellers });
  } catch (err) {
    console.error('Get following error:', err);
    return errorResponse(res, 500, 'Failed to fetch following');
  }
});

/**
 * @route   POST /api/v1/users/seller-application
 * @desc    Submit seller verification application (JSON body with full application data)
 * @access  Private
 */
router.post(
  '/seller-application',
  authenticate,
  submitSellerApplication
);

/**
 * @route   GET /api/v1/users/seller-application/status
 * @desc    Get current user's seller application status
 * @access  Private
 */
router.get(
  '/seller-application/status',
  authenticate,
  getSellerApplicationStatus
);

/**
 * @route   POST /api/v1/users/kyc
 * @desc    Submit KYC identity documents for payout verification (approved sellers only)
 * @access  Private
 */
router.post(
  '/kyc',
  authenticate,
  avatarUpload,
  handleUploadError,
  submitKyc
);

export default router;
