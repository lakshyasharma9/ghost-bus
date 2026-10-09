/**
 * Order Controller — GhostBus
 * Buyer order history + per-item download URL generation
 */

import prisma from '../config/database.js';
import { getSignedDownloadUrl } from '../utils/s3.js';
import { successResponse, errorResponse } from '../utils/response.js';

// ─── GET /api/v1/orders ───────────────────────────────────────────────────────

export async function getMyOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where:   { buyerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            track: {
              select: {
                id:       true,
                title:    true,
                genre:    true,
                coverUrl: true,
              },
            },
          },
        },
      },
    });

    // Generate signed cover URLs
    const ordersWithUrls = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        items: await Promise.all(
          order.items.map(async (item) => ({
            ...item,
            price: Number(item.price),
            track: {
              ...item.track,
              coverUrl: item.track.coverUrl
                ? await getSignedDownloadUrl(item.track.coverUrl, 3600)
                : null,
            },
          }))
        ),
      }))
    );

    return successResponse(res, 200, 'Orders fetched', { orders: ordersWithUrls });
  } catch (err) {
    console.error('getMyOrders error:', err.message);
    return errorResponse(res, 500, 'Failed to fetch orders');
  }
}

// ─── GET /api/v1/orders/:id ───────────────────────────────────────────────────

export async function getOrderById(req, res) {
  try {
    const order = await prisma.order.findUnique({
      where:   { id: req.params.id },
      include: {
        items: {
          include: {
            track: {
              select: {
                id:       true,
                title:    true,
                genre:    true,
                bpm:      true,
                key:      true,
                coverUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order)                       return errorResponse(res, 404, 'Order not found');
    if (order.buyerId !== req.user.id) return errorResponse(res, 403, 'Forbidden');

    return successResponse(res, 200, 'Order found', {
      order: {
        ...order,
        totalAmount: Number(order.totalAmount),
        items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
      },
    });
  } catch (err) {
    console.error('getOrderById error:', err.message);
    return errorResponse(res, 500, 'Failed to fetch order');
  }
}

// ─── GET /api/v1/orders/:orderId/items/:itemId/download ───────────────────────

/**
 * Generate a 1-hour presigned download URL for a purchased track's full package.
 * Only accessible by the buyer of the order.
 */
export async function getDownloadUrl(req, res) {
  try {
    const { orderId, itemId } = req.params;

    // Verify order belongs to buyer and is COMPLETED
    const order = await prisma.order.findUnique({
      where:  { id: orderId },
      select: { id: true, buyerId: true, status: true },
    });

    if (!order)                        return errorResponse(res, 404, 'Order not found');
    if (order.buyerId !== req.user.id) return errorResponse(res, 403, 'Forbidden');
    if (order.status !== 'COMPLETED')  return errorResponse(res, 403, 'Order not completed');

    // Get order item with track details
    const item = await prisma.orderItem.findUnique({
      where:   { id: itemId },
      include: {
        track: {
          select: {
            id:           true,
            title:        true,
            audioUrl:     true,
            waveformData: true,
          },
        },
      },
    });

    if (!item || item.orderId !== orderId) {
      return errorResponse(res, 404, 'Order item not found');
    }

    const waveformData = item.track.waveformData || {};

    // Build download URLs (1 hour TTL each)
    const downloads = {};

    // Mastered WAV
    if (item.track.audioUrl) {
      downloads.mastered = await getSignedDownloadUrl(item.track.audioUrl, 3600);
    }

    // Unmastered WAV
    if (waveformData.unmasteredKey) {
      downloads.unmastered = await getSignedDownloadUrl(waveformData.unmasteredKey, 3600);
    }

    // Stems ZIP
    if (waveformData.stemsKey) {
      downloads.stems = await getSignedDownloadUrl(waveformData.stemsKey, 3600);
    }

    // MIDI
    if (waveformData.midiKey) {
      downloads.midi = await getSignedDownloadUrl(waveformData.midiKey, 3600);
    }

    // Lyrics PDF
    if (waveformData.lyricsKey) {
      downloads.lyrics = await getSignedDownloadUrl(waveformData.lyricsKey, 3600);
    }

    // Artwork
    if (waveformData.artworkKey || item.track.coverUrl) {
      const artKey = waveformData.artworkKey || item.track.audioUrl?.replace('/audio/', '/artwork/');
      if (artKey) downloads.artwork = await getSignedDownloadUrl(artKey, 3600);
    }

    return successResponse(res, 200, 'Download URLs generated', {
      trackTitle: item.track.title,
      expiresIn:  3600,
      downloads,
    });
  } catch (err) {
    console.error('getDownloadUrl error:', err.message);
    return errorResponse(res, 500, 'Failed to generate download URLs');
  }
}
