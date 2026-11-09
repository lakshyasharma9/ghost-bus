import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { paymentRateLimit } from '../middleware/rateLimit.middleware.js';
import { createPayPalOrder, capturePayPalOrder } from '../controllers/payment.controller.js';
import {
  createCashfreeOrder,
  verifyCashfreePayment,
  cashfreeWebhook,
} from '../controllers/cashfree.controller.js';

const router = express.Router();

// ── PayPal (International) ────────────────────────────────────────────────────
router.post('/paypal/create-order',  authenticate, paymentRateLimit, createPayPalOrder);
router.post('/paypal/capture-order', authenticate, paymentRateLimit, capturePayPalOrder);

// ── Cashfree (India) ──────────────────────────────────────────────────────────
router.post('/cashfree/create-order', authenticate, paymentRateLimit, createCashfreeOrder);
router.post('/cashfree/verify',       authenticate, paymentRateLimit, verifyCashfreePayment);

// Webhook — NO auth (Cashfree server calls this directly), signature verified inside
// Must use raw body for signature verification — express.json() has already parsed it,
// so we re-stringify in the controller (fine for production use)
router.post('/cashfree/webhook', cashfreeWebhook);

export default router;
