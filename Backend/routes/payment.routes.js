import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { paymentRateLimit } from '../middleware/rateLimit.middleware.js';
import { createPayPalOrder, capturePayPalOrder } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/paypal/create-order', authenticate, paymentRateLimit, createPayPalOrder);
router.post('/paypal/capture-order', authenticate, paymentRateLimit, capturePayPalOrder);

export default router;
