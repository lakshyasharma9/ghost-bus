/**
 * PayPal Payment Controller — GhostBus
 * Uses PayPal v2 Orders API (Smart Buttons flow)
 * India merchant: Smart Payment Buttons only (no Advanced Card Fields / Google Pay)
 */

import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

// ─── PayPal base URL ──────────────────────────────────────────────────────────

function getPayPalBase() {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

// ─── Get PayPal OAuth2 access token ──────────────────────────────────────────

async function getPayPalAccessToken() {
  const clientId     = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET)');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${getPayPalBase()}/v1/oauth2/token`, {
    method:  'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PayPal token error (${res.status}): ${body.substring(0, 200)}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ─── POST /api/v1/payments/paypal/create-order ────────────────────────────────

/**
 * Creates a PayPal order and a PENDING DB order.
 * Body: { items: [{ trackId }], buyerPhone, countryCode }
 * Returns: { paypalOrderId, dbOrderId }
 */
export async function createPayPalOrder(req, res) {
  try {
    const { items, buyerPhone, countryCode } = req.body;
    const buyer = req.user;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 400, 'No items provided');
    }

    const trackIds = items.map((i) => i.trackId).filter(Boolean);
    if (trackIds.length === 0) {
      return errorResponse(res, 400, 'Invalid item list');
    }

    // ── Re-fetch prices from DB — never trust client-sent prices ──
    const tracks = await prisma.track.findMany({
      where: {
        id:     { in: trackIds },
        status: 'APPROVED',
        isSold: false,
      },
      select: { id: true, title: true, price: true },
    });

    if (tracks.length === 0) {
      return errorResponse(res, 400, 'No available tracks found');
    }
    if (tracks.length !== trackIds.length) {
      const foundIds   = tracks.map((t) => t.id);
      const missingIds = trackIds.filter((id) => !foundIds.includes(id));
      return errorResponse(res, 400, `Some tracks are unavailable or already sold: ${missingIds.join(', ')}`);
    }

    // ── Server-side total calculation ──
    const subtotal   = tracks.reduce((sum, t) => sum + parseFloat(t.price), 0);
    const serviceFee = Math.round(subtotal * 0.03 * 100) / 100;
    const total      = (subtotal + serviceFee).toFixed(2);

    // ── Build PayPal Create Order payload ──
    const paypalPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: buyer.id,
          description:  `GhostBus: ${tracks.map((t) => t.title).join(', ')}`.substring(0, 127),
          amount: {
            currency_code: 'EUR',
            value:         total,
            breakdown: {
              item_total: { currency_code: 'EUR', value: subtotal.toFixed(2) },
              handling:   { currency_code: 'EUR', value: serviceFee.toFixed(2) },
            },
          },
          items: tracks.map((t) => ({
            name:        t.title.substring(0, 127),
            unit_amount: { currency_code: 'EUR', value: parseFloat(t.price).toFixed(2) },
            quantity:    '1',
            category:    'DIGITAL_GOODS',
          })),
        },
      ],
    };

    // ── Call PayPal API ──
    const accessToken = await getPayPalAccessToken();

    const paypalRes = await fetch(`${getPayPalBase()}/v2/checkout/orders`, {
      method:  'POST',
      headers: {
        Authorization:       `Bearer ${accessToken}`,
        'Content-Type':      'application/json',
        'PayPal-Request-Id': `ghostbus-${buyer.id}-${Date.now()}`,
      },
      body: JSON.stringify(paypalPayload),
    });

    const paypalOrder = await paypalRes.json();

    if (!paypalRes.ok) {
      console.error('[PayPal] create-order error:', JSON.stringify(paypalOrder));
      return errorResponse(res, 502, 'Failed to create PayPal order. Please try again.');
    }

    // ── Create PENDING DB order immediately ──
    const dbOrder = await prisma.order.create({
      data: {
        buyerId:       buyer.id,
        totalAmount:   parseFloat(total),
        status:        'PENDING',
        paypalOrderId: paypalOrder.id,
        paymentMethod: 'PAYPAL',
        buyerEmail:    buyer.email,
        buyerPhone:    buyerPhone ? `${countryCode || ''}${buyerPhone}` : null,
        items: {
          create: tracks.map((t) => ({
            trackId: t.id,
            price:   parseFloat(t.price),
          })),
        },
      },
      select: { id: true },
    });

    console.log(`[PayPal] Order created: ${paypalOrder.id} | DB: ${dbOrder.id}`);

    return successResponse(res, 201, 'PayPal order created', {
      paypalOrderId: paypalOrder.id,
      dbOrderId:     dbOrder.id,
    });
  } catch (err) {
    console.error('[PayPal] createPayPalOrder error:', err.message);
    return errorResponse(res, 500, 'Payment initialization failed. Please try again.');
  }
}

// ─── POST /api/v1/payments/paypal/capture-order ───────────────────────────────

/**
 * Captures a PayPal order after buyer approves.
 * Body: { paypalOrderId }
 * Returns: { orderId, captureId, status }
 */
export async function capturePayPalOrder(req, res) {
  try {
    const { paypalOrderId } = req.body;
    const buyer = req.user;

    if (!paypalOrderId) {
      return errorResponse(res, 400, 'paypalOrderId is required');
    }

    // ── Find pending DB order ──
    const dbOrder = await prisma.order.findUnique({
      where:   { paypalOrderId },
      include: {
        items: {
          include: {
            track: {
              select: { id: true, title: true, genre: true, audioUrl: true, waveformData: true, sellerId: true },
            },
          },
        },
      },
    });

    if (!dbOrder)                          return errorResponse(res, 404, 'Order not found');
    if (dbOrder.buyerId !== buyer.id)      return errorResponse(res, 403, 'Forbidden');
    if (dbOrder.status === 'COMPLETED')    return successResponse(res, 200, 'Already completed', { orderId: dbOrder.id, status: 'COMPLETED' });
    if (dbOrder.status === 'FAILED')       return errorResponse(res, 409, 'Order failed — please start a new checkout');
    if (dbOrder.status !== 'PENDING')      return errorResponse(res, 409, 'Order already processed');

    // ── Capture via PayPal ──
    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(`${getPayPalBase()}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method:  'POST',
      headers: {
        Authorization:       `Bearer ${accessToken}`,
        'Content-Type':      'application/json',
        'PayPal-Request-Id': `capture-${paypalOrderId}`,
      },
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok || captureData.status !== 'COMPLETED') {
      console.error('[PayPal] capture error:', JSON.stringify(captureData));
      await prisma.order.update({
        where: { id: dbOrder.id },
        data:  { status: 'FAILED' },
      });
      return errorResponse(res, 502, 'Payment capture failed. Your card was not charged.');
    }

    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    // ── Atomic DB update: complete order + mark tracks sold ──
    await prisma.$transaction([
      prisma.order.update({
        where: { id: dbOrder.id },
        data:  { status: 'COMPLETED', paypalCaptureId: captureId ?? null },
      }),
      ...dbOrder.items.map((item) =>
        prisma.track.update({
          where: { id: item.trackId },
          data:  { isSold: true },
        })
      ),
    ]);

    console.log(`[PayPal] Capture success: ${captureId} | Order: ${dbOrder.id}`);

    return successResponse(res, 200, 'Payment successful', {
      orderId:   dbOrder.id,
      captureId: captureId ?? null,
      status:    'COMPLETED',
    });
  } catch (err) {
    console.error('[PayPal] capturePayPalOrder error:', err.message);
    return errorResponse(res, 500, 'Payment processing error. Please contact support.');
  }
}
