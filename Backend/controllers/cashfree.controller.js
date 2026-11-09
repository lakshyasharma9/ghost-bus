/**
 * Cashfree Payment Controller — GhostBus
 * Handles Indian payments via Cashfree (UPI, Cards, NetBanking)
 *
 * Flow:
 *  1. POST /payments/cashfree/create-order  → creates Cashfree order + PENDING DB order
 *  2. Frontend opens Cashfree checkout (JS SDK drop-in)
 *  3. POST /payments/cashfree/verify        → verify payment after user returns
 *  4. POST /payments/cashfree/webhook       → (backup) Cashfree server-to-server callback
 *
 * Security:
 *  - Prices always fetched from DB — never trusted from client
 *  - EUR→INR conversion via live exchange rate API
 *  - Webhook signature verified with HMAC-SHA256
 *  - Atomic DB transaction prevents double-sale race condition
 */

import crypto from 'crypto';
import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

// ─── Cashfree API base ────────────────────────────────────────────────────────

function getCashfreeBase() {
  return process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com'
    : 'https://sandbox.cashfree.com';
}

function getCashfreeHeaders() {
  return {
    'Content-Type':        'application/json',
    'x-api-version':       '2023-08-01',
    'x-client-id':         process.env.CASHFREE_APP_ID,
    'x-client-secret':     process.env.CASHFREE_SECRET_KEY,
  };
}

// ─── EUR → INR exchange rate (cached 10 min) ─────────────────────────────────

let _rateCache = null; // { rate: number, fetchedAt: number }

async function getEurToInrRate() {
  const TEN_MIN = 10 * 60 * 1000;

  // Return cached rate if fresh
  if (_rateCache && Date.now() - _rateCache.fetchedAt < TEN_MIN) {
    return _rateCache.rate;
  }

  try {
    // Free tier — no API key needed, 1500 req/month
    const res = await fetch(
      'https://api.exchangerate-api.com/v4/latest/EUR',
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error(`Exchange rate API error ${res.status}`);
    const data = await res.json();
    const rate  = data.rates?.INR;
    if (!rate) throw new Error('INR rate not found in response');

    _rateCache = { rate, fetchedAt: Date.now() };
    console.log(`[Cashfree] EUR→INR rate: ${rate}`);
    return rate;
  } catch (err) {
    console.error('[Cashfree] Exchange rate fetch failed:', err.message);
    // Fallback: use last cached rate if available, else hardcoded conservative rate
    if (_rateCache) return _rateCache.rate;
    return 90; // conservative fallback — update if needed
  }
}

// ─── POST /api/v1/payments/cashfree/create-order ─────────────────────────────

/**
 * Creates a Cashfree order and a PENDING DB order.
 * Body: { items: [{ trackId }], buyerPhone, buyerName }
 * Returns: { cashfreeOrderId, paymentSessionId, amountInr, exchangeRate }
 */
export async function createCashfreeOrder(req, res) {
  try {
    const { items, buyerPhone, buyerName } = req.body;
    const buyer = req.user;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 400, 'No items provided');
    }
    if (!buyerPhone || !/^\+91\d{10}$/.test(buyerPhone.replace(/\s/g, ''))) {
      return errorResponse(res, 400, 'Valid Indian mobile number is required (+91XXXXXXXXXX)');
    }

    const trackIds = items.map((i) => i.trackId).filter(Boolean);
    if (trackIds.length === 0) return errorResponse(res, 400, 'Invalid item list');

    // ── Re-fetch prices from DB — never trust client-sent prices ──
    const tracks = await prisma.track.findMany({
      where: {
        id:         { in: trackIds },
        status:     'APPROVED',
        isSold:     false,
        orderItems: { none: { order: { status: 'COMPLETED' } } },
      },
      select: { id: true, title: true, price: true },
    });

    if (tracks.length === 0) return errorResponse(res, 400, 'No available tracks found');
    if (tracks.length !== trackIds.length) {
      const found   = tracks.map((t) => t.id);
      const missing = trackIds.filter((id) => !found.includes(id));
      return errorResponse(res, 400, `Some tracks are unavailable: ${missing.join(', ')}`);
    }

    // ── Calculate totals ──
    const subtotalEur = tracks.reduce((sum, t) => sum + parseFloat(t.price), 0);
    const feeEur      = Math.round(subtotalEur * 0.03 * 100) / 100;
    const totalEur    = subtotalEur + feeEur;

    // ── EUR → INR conversion ──
    const eurToInr   = await getEurToInrRate();
    // Round to 2 decimal places, minimum ₹1
    const totalInr   = Math.max(1, Math.round(totalEur * eurToInr * 100) / 100);

    // ── Unique order ID ──
    const cfOrderId = `GB_${buyer.id.substring(0, 8)}_${Date.now()}`;

    // ── Call Cashfree Create Order API ──
    const cfPayload = {
      order_id:       cfOrderId,
      order_amount:   totalInr,
      order_currency: 'INR',
      order_note:     `GhostBus: ${tracks.map((t) => t.title).join(', ')}`.substring(0, 200),
      customer_details: {
        customer_id:    buyer.id,
        customer_name:  buyerName || buyer.fullName || buyer.username || 'GhostBus Buyer',
        customer_email: buyer.email,
        customer_phone: buyerPhone.replace(/\s/g, ''),
      },
      order_meta: {
        return_url:    `${process.env.FRONTEND_URL}/checkout/cashfree-return?order_id={order_id}`,
        notify_url:    `${process.env.BACKEND_URL || 'https://api.ghostbusaudio.com'}/api/v1/payments/cashfree/webhook`,
        payment_methods: 'upi,cc,dc,nb,wallet', // UPI, credit/debit cards, netbanking, wallets
      },
    };

    const cfRes = await fetch(`${getCashfreeBase()}/pg/orders`, {
      method:  'POST',
      headers: getCashfreeHeaders(),
      body:    JSON.stringify(cfPayload),
    });

    const cfData = await cfRes.json();

    if (!cfRes.ok) {
      console.error('[Cashfree] create-order error:', JSON.stringify(cfData));
      return errorResponse(res, 502, 'Failed to initialize payment. Please try again.');
    }

    // ── Create PENDING DB order ──
    const dbOrder = await prisma.order.create({
      data: {
        buyerId:          buyer.id,
        totalAmount:      parseFloat(totalInr.toFixed(2)),
        currency:         'INR',
        status:           'PENDING',
        cashfreeOrderId:  cfOrderId,
        paymentMethod:    'CASHFREE',
        buyerCountry:     'IN',
        buyerEmail:       buyer.email,
        buyerPhone:       buyerPhone.replace(/\s/g, ''),
        exchangeRate:     parseFloat(eurToInr.toFixed(4)),
        items: {
          create: tracks.map((t) => ({
            trackId: t.id,
            price:   parseFloat(t.price),
          })),
        },
      },
      select: { id: true },
    });

    console.log(`[Cashfree] Order created: ${cfOrderId} | DB: ${dbOrder.id} | ₹${totalInr}`);

    return successResponse(res, 201, 'Cashfree order created', {
      cashfreeOrderId:  cfOrderId,
      paymentSessionId: cfData.payment_session_id,
      amountInr:        totalInr,
      amountEur:        totalEur,
      exchangeRate:     eurToInr,
      dbOrderId:        dbOrder.id,
    });
  } catch (err) {
    console.error('[Cashfree] createCashfreeOrder error:', err.message);
    return errorResponse(res, 500, 'Payment initialization failed. Please try again.');
  }
}

// ─── POST /api/v1/payments/cashfree/verify ───────────────────────────────────

/**
 * Verifies a Cashfree payment after the user returns from checkout.
 * Called by frontend after Cashfree JS SDK completes.
 * Body: { cashfreeOrderId }
 * Returns: { orderId, status }
 */
export async function verifyCashfreePayment(req, res) {
  try {
    const { cashfreeOrderId } = req.body;
    const buyer = req.user;

    if (!cashfreeOrderId) {
      return errorResponse(res, 400, 'cashfreeOrderId is required');
    }

    // ── Find DB order ──
    const dbOrder = await prisma.order.findUnique({
      where:   { cashfreeOrderId },
      include: {
        items: { include: { track: { select: { id: true, title: true } } } },
      },
    });

    if (!dbOrder)                          return errorResponse(res, 404, 'Order not found');
    if (dbOrder.buyerId !== buyer.id)      return errorResponse(res, 403, 'Forbidden');
    if (dbOrder.status === 'COMPLETED')    return successResponse(res, 200, 'Already completed', { orderId: dbOrder.id, status: 'COMPLETED' });
    if (dbOrder.status === 'FAILED')       return errorResponse(res, 409, 'Payment failed. Please start a new checkout.');
    if (dbOrder.status !== 'PENDING')      return errorResponse(res, 409, 'Order already processed');

    // ── Verify with Cashfree API ──
    const cfRes = await fetch(
      `${getCashfreeBase()}/pg/orders/${cashfreeOrderId}/payments`,
      { headers: getCashfreeHeaders() }
    );

    const cfPayments = await cfRes.json();

    if (!cfRes.ok) {
      console.error('[Cashfree] verify error:', JSON.stringify(cfPayments));
      return errorResponse(res, 502, 'Payment verification failed. Please contact support.');
    }

    // Find a successful payment in the list
    const successPayment = Array.isArray(cfPayments)
      ? cfPayments.find((p) => p.payment_status === 'SUCCESS')
      : null;

    if (!successPayment) {
      // Check if payment is still pending
      const hasPending = Array.isArray(cfPayments) && cfPayments.some((p) => p.payment_status === 'PENDING');
      if (hasPending) {
        return successResponse(res, 200, 'Payment is being processed', { orderId: dbOrder.id, status: 'PENDING' });
      }
      // Payment failed
      await prisma.order.update({
        where: { id: dbOrder.id },
        data:  { status: 'FAILED' },
      });
      return errorResponse(res, 402, 'Payment was not successful. Please try again.');
    }

    const cfPaymentId = successPayment.cf_payment_id?.toString();
    const trackIds    = dbOrder.items.map((i) => i.trackId);

    // ── Atomic DB transaction with race-condition safety ──
    await prisma.$transaction(async (tx) => {
      // Race check: abort if track already sold by a concurrent buyer
      const conflicting = await tx.track.findMany({
        where:  { id: { in: trackIds }, isSold: true },
        select: { id: true },
      });
      if (conflicting.length > 0) throw new Error('TRACK_ALREADY_SOLD');

      await tx.order.update({
        where: { id: dbOrder.id },
        data:  {
          status:               'COMPLETED',
          cashfreeCfPaymentId:  cfPaymentId ?? null,
        },
      });

      await tx.track.updateMany({
        where: { id: { in: trackIds } },
        data:  { isSold: true },
      });
    });

    console.log(`[Cashfree] Payment verified: ${cfPaymentId} | Order: ${dbOrder.id}`);

    return successResponse(res, 200, 'Payment successful', {
      orderId:   dbOrder.id,
      paymentId: cfPaymentId,
      status:    'COMPLETED',
    });
  } catch (err) {
    if (err.message === 'TRACK_ALREADY_SOLD') {
      try {
        await prisma.order.update({
          where: { cashfreeOrderId: req.body.cashfreeOrderId },
          data:  { status: 'FAILED' },
        });
      } catch (_) {}
      return errorResponse(res, 409, 'This track was just purchased by someone else. Your payment will be refunded within 24 hours — please contact support.');
    }
    console.error('[Cashfree] verifyCashfreePayment error:', err.message);
    return errorResponse(res, 500, 'Payment verification error. Please contact support.');
  }
}

// ─── POST /api/v1/payments/cashfree/webhook ───────────────────────────────────

/**
 * Cashfree server-to-server webhook — backup payment confirmation.
 * Cashfree sends this even if the user closes the browser.
 * Signature verification using HMAC-SHA256.
 *
 * Headers: x-webhook-signature, x-webhook-timestamp
 */
export async function cashfreeWebhook(req, res) {
  try {
    // ── Verify webhook signature ──
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];

    if (!signature || !timestamp) {
      console.warn('[Cashfree Webhook] Missing signature headers');
      return res.status(400).json({ success: false, message: 'Missing signature' });
    }

    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Cashfree Webhook] CASHFREE_WEBHOOK_SECRET not set');
      return res.status(500).json({ success: false });
    }

    // Cashfree signature: HMAC-SHA256(timestamp + rawBody, secret)
    const rawBody = JSON.stringify(req.body);
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(timestamp + rawBody)
      .digest('base64');

    if (expectedSig !== signature) {
      console.warn('[Cashfree Webhook] Signature mismatch');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    const type  = event?.type;

    // ── Handle PAYMENT_SUCCESS ──
    if (type === 'PAYMENT_SUCCESS' || type === 'PAYMENT_USER_DROPPED') {
      const orderId   = event?.data?.order?.order_id;
      const cfPayId   = event?.data?.payment?.cf_payment_id?.toString();
      const payStatus = event?.data?.payment?.payment_status;

      if (!orderId) {
        return res.status(200).json({ success: true }); // ack even if no order id
      }

      if (payStatus !== 'SUCCESS') {
        // Mark as failed
        await prisma.order.updateMany({
          where: { cashfreeOrderId: orderId, status: 'PENDING' },
          data:  { status: 'FAILED' },
        });
        return res.status(200).json({ success: true });
      }

      // Find DB order
      const dbOrder = await prisma.order.findUnique({
        where:   { cashfreeOrderId: orderId },
        include: { items: { select: { trackId: true } } },
      });

      if (!dbOrder) return res.status(200).json({ success: true }); // unknown order — ack
      if (dbOrder.status === 'COMPLETED') return res.status(200).json({ success: true }); // already done

      const trackIds = dbOrder.items.map((i) => i.trackId);

      try {
        await prisma.$transaction(async (tx) => {
          const conflicting = await tx.track.findMany({
            where:  { id: { in: trackIds }, isSold: true },
            select: { id: true },
          });
          if (conflicting.length > 0) throw new Error('TRACK_ALREADY_SOLD');

          await tx.order.update({
            where: { id: dbOrder.id },
            data:  { status: 'COMPLETED', cashfreeCfPaymentId: cfPayId ?? null },
          });

          await tx.track.updateMany({
            where: { id: { in: trackIds } },
            data:  { isSold: true },
          });
        });
        console.log(`[Cashfree Webhook] Order completed via webhook: ${orderId}`);
      } catch (txErr) {
        console.error('[Cashfree Webhook] Transaction error:', txErr.message);
      }
    }

    // Always return 200 to Cashfree so it stops retrying
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Cashfree Webhook] Error:', err.message);
    return res.status(200).json({ success: true }); // still 200 to prevent retries
  }
}

// ─── Refund a Cashfree payment (used by admin) ────────────────────────────────

/**
 * Issues a Cashfree refund.
 * Returns { ok: boolean, refundId?: string, error?: string }
 */
export async function refundCashfreePayment(cfOrderId, cfPaymentId, amountInr) {
  if (!cfOrderId || !cfPaymentId) return { ok: false, error: 'Missing Cashfree IDs' };

  try {
    const refundId = `refund_${cfOrderId}_${Date.now()}`;
    const res = await fetch(
      `${getCashfreeBase()}/pg/orders/${cfOrderId}/refunds`,
      {
        method:  'POST',
        headers: getCashfreeHeaders(),
        body:    JSON.stringify({
          refund_amount: amountInr,
          refund_id:     refundId,
          refund_note:   'GhostBus refund — track returned to marketplace',
        }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.message || `HTTP ${res.status}` };
    return { ok: true, refundId: data.refund_id || refundId, status: data.refund_status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
