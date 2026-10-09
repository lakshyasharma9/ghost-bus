import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { createPayPalOrder, capturePayPalOrder } from '../controllers/payment.controller.js';

const router = express.Router();

/**
 * POST /api/v1/payments/paypal/create-order
 * Creates a PayPal order + PENDING DB order
 * Auth: required
 */
router.post('/paypal/create-order', authenticate, createPayPalOrder);

/**
 * POST /api/v1/payments/paypal/capture-order
 * Captures payment, marks order COMPLETED + tracks as sold
 * Auth: required
 */
router.post('/paypal/capture-order', authenticate, capturePayPalOrder);

export default router;
