import express from 'express';
import { body } from 'express-validator';
import { validate } from '../utils/response.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketStats,
} from '../controllers/support.controller.js';

const router = express.Router();

/**
 * @route   POST /api/v1/support/tickets
 * @desc    Create new support ticket
 * @access  Public (with optional auth)
 */
router.post(
  '/tickets',
  optionalAuth,
  [
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be 2-100 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('phone')
      .optional()
      .trim()
      .isLength({ min: 10, max: 20 })
      .withMessage('Valid phone number required'),
    body('company')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Company name too long'),
    body('userType')
      .trim()
      .isIn(['Buyer', 'Seller', 'Visitor', 'Other'])
      .withMessage('Invalid user type'),
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be 5-200 characters'),
    body('category')
      .optional()
      .isIn([
        'GENERAL_INQUIRY',
        'TECHNICAL_SUPPORT',
        'BILLING_PAYMENT',
        'ACCOUNT_ISSUE',
        'TRACK_ISSUE',
        'LEGAL_COPYRIGHT',
        'SELLER_SUPPORT',
        'BUG_REPORT',
        'FEATURE_REQUEST',
        'OTHER',
      ])
      .withMessage('Invalid category'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .withMessage('Invalid priority'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Message must be 10-5000 characters'),
    body('attachmentUrl')
      .optional()
      .isURL()
      .withMessage('Invalid attachment URL'),
    validate,
  ],
  createTicket
);

/**
 * @route   GET /api/v1/support/tickets
 * @desc    Get all tickets (admin) or user's tickets
 * @access  Private
 */
router.get('/tickets', authenticate, getTickets);

/**
 * @route   GET /api/v1/support/tickets/:id
 * @desc    Get single ticket by ID
 * @access  Private
 */
router.get('/tickets/:id', authenticate, getTicketById);

/**
 * @route   PATCH /api/v1/support/tickets/:id
 * @desc    Update ticket (admin only)
 * @access  Admin
 */
router.patch(
  '/tickets/:id',
  authenticate,
  [
    body('status')
      .optional()
      .isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .withMessage('Invalid priority'),
    body('assignedToId')
      .optional()
      .isUUID()
      .withMessage('Invalid user ID'),
    body('adminNotes')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Admin notes too long'),
    validate,
  ],
  updateTicket
);

/**
 * @route   DELETE /api/v1/support/tickets/:id
 * @desc    Delete ticket (admin only)
 * @access  Admin
 */
router.delete('/tickets/:id', authenticate, deleteTicket);

/**
 * @route   GET /api/v1/support/stats
 * @desc    Get ticket statistics (admin only)
 * @access  Admin
 */
router.get('/stats', authenticate, getTicketStats);

export default router;
