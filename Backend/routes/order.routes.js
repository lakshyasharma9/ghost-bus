import express from 'express';
import { param } from 'express-validator';
import { validate } from '../utils/response.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { getMyOrders, getOrderById, getDownloadUrl } from '../controllers/order.controller.js';

const router = express.Router();

/**
 * GET /api/v1/orders
 * Get buyer's order history
 */
router.get('/', authenticate, getMyOrders);

/**
 * GET /api/v1/orders/:id
 * Get single order details
 */
router.get(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid order ID'), validate],
  getOrderById
);

/**
 * GET /api/v1/orders/:orderId/items/:itemId/download
 * Get presigned download URLs for a purchased track
 */
router.get(
  '/:orderId/items/:itemId/download',
  authenticate,
  [
    param('orderId').isUUID().withMessage('Invalid order ID'),
    param('itemId').isUUID().withMessage('Invalid item ID'),
    validate,
  ],
  getDownloadUrl
);

export default router;
