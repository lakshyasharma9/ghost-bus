import prisma from '../config/database.js';
import { errorResponse, successResponse } from '../utils/response.js';

// ─── Public: Get Recently Sold Feed ──────────────────────────────────────────

/**
 * GET /api/v1/recently-sold
 * Public endpoint — no auth required. Returns active entries for homepage marquee.
 */
export async function getRecentlySold(req, res) {
  try {
    const items = await prisma.recentlySold.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { soldAt: 'desc' }],
      take: 30,
    });

    return successResponse(res, 200, 'Recently sold fetched', {
      items: items.map((item) => ({
        id: item.id,
        trackName: item.trackName,
        genre: item.genre,
        soldAt: item.soldAt,
        displayOrder: item.displayOrder,
        imageUrl: item.imageUrl || null,
      })),
    });
  } catch (error) {
    console.error('Get recently sold error:', error);
    return errorResponse(res, 500, 'Failed to fetch recently sold');
  }
}

// ─── Admin: List All ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/recently-sold/admin
 * Returns ALL entries including hidden ones.
 */
export async function adminGetRecentlySold(req, res) {
  try {
    const items = await prisma.recentlySold.findMany({
      orderBy: [{ displayOrder: 'asc' }, { soldAt: 'desc' }],
    });
    return successResponse(res, 200, 'Admin recently sold fetched', { items });
  } catch (error) {
    console.error('Admin get recently sold error:', error);
    return errorResponse(res, 500, 'Failed to fetch recently sold');
  }
}

// ─── Helper: convert multer buffer → base64 data URL ─────────────────────────

function bufferToDataUrl(file) {
  if (!file || !file.buffer) return null;
  const base64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64}`;
}

// ─── Admin: Create ───────────────────────────────────────────────────────────

/**
 * POST /api/v1/recently-sold/admin
 * Multipart/form-data: trackName, genre, soldAt?, displayOrder?, photo (optional image)
 * Image stored as base64 data URL — no S3 needed.
 */
export async function adminCreateRecentlySold(req, res) {
  try {
    const { trackName, genre, displayOrder, soldAt } = req.body;

    if (!trackName?.trim()) return errorResponse(res, 400, 'Track name is required');
    if (!genre?.trim())     return errorResponse(res, 400, 'Genre is required');

    // Optional image upload — convert to base64 data URL
    const imageFile = req.files?.photo?.[0] || req.files?.image?.[0] || req.file || null;
    let imageUrl = null;

    if (imageFile) {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(imageFile.mimetype)) {
        return errorResponse(res, 400, 'Image must be JPEG, PNG, WebP, or GIF');
      }
      if (imageFile.size > 2 * 1024 * 1024) {
        return errorResponse(res, 400, 'Image must be under 2MB');
      }
      imageUrl = bufferToDataUrl(imageFile);
    }

    const order = parseInt(displayOrder ?? '0', 10);
    const parsedSoldAt = soldAt ? new Date(soldAt) : new Date();

    if (isNaN(parsedSoldAt.getTime())) {
      return errorResponse(res, 400, 'Invalid soldAt date');
    }

    const item = await prisma.recentlySold.create({
      data: {
        trackName: trackName.trim(),
        genre: genre.trim(),
        imageUrl,
        displayOrder: isNaN(order) ? 0 : order,
        soldAt: parsedSoldAt,
        isActive: true,
      },
    });

    return successResponse(res, 201, 'Recently sold entry created', { item });
  } catch (error) {
    console.error('Admin create recently sold error:', error);
    return errorResponse(res, 500, 'Failed to create entry');
  }
}

// ─── Admin: Update ───────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/recently-sold/admin/:id
 */
export async function adminUpdateRecentlySold(req, res) {
  try {
    const { id } = req.params;
    const { trackName, genre, displayOrder, soldAt, isActive } = req.body;

    const existing = await prisma.recentlySold.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, 404, 'Entry not found');

    // Optional new image
    const imageFile = req.files?.photo?.[0] || req.files?.image?.[0] || req.file || null;
    let newImageUrl = existing.imageUrl;

    if (imageFile) {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(imageFile.mimetype)) {
        return errorResponse(res, 400, 'Image must be JPEG, PNG, WebP, or GIF');
      }
      if (imageFile.size > 2 * 1024 * 1024) {
        return errorResponse(res, 400, 'Image must be under 2MB');
      }
      newImageUrl = bufferToDataUrl(imageFile);
    }

    const order = displayOrder !== undefined ? parseInt(displayOrder, 10) : existing.displayOrder;
    const parsedSoldAt = soldAt ? new Date(soldAt) : existing.soldAt;

    // isActive can come as string "true"/"false" from FormData
    let activeValue = existing.isActive;
    if (isActive !== undefined) {
      activeValue = isActive === 'true' || isActive === true;
    }

    const updated = await prisma.recentlySold.update({
      where: { id },
      data: {
        ...(trackName?.trim() && { trackName: trackName.trim() }),
        ...(genre?.trim()     && { genre: genre.trim() }),
        ...(newImageUrl !== existing.imageUrl && { imageUrl: newImageUrl }),
        ...(!isNaN(order)     && { displayOrder: order }),
        ...(soldAt && !isNaN(parsedSoldAt.getTime()) && { soldAt: parsedSoldAt }),
        isActive: activeValue,
      },
    });

    return successResponse(res, 200, 'Entry updated', { item: updated });
  } catch (error) {
    console.error('Admin update recently sold error:', error);
    return errorResponse(res, 500, 'Failed to update entry');
  }
}

// ─── Admin: Delete ───────────────────────────────────────────────────────────

/**
 * DELETE /api/v1/recently-sold/admin/:id
 */
export async function adminDeleteRecentlySold(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.recentlySold.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, 404, 'Entry not found');
    await prisma.recentlySold.delete({ where: { id } });
    return successResponse(res, 200, 'Entry deleted');
  } catch (error) {
    console.error('Admin delete recently sold error:', error);
    return errorResponse(res, 500, 'Failed to delete entry');
  }
}

// ─── Admin: Reorder ──────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/recently-sold/admin/reorder
 * Body: { order: [{ id, displayOrder }] }
 */
export async function adminReorderRecentlySold(req, res) {
  try {
    const { order } = req.body;
    if (!Array.isArray(order) || order.length === 0) {
      return errorResponse(res, 400, 'order array is required');
    }
    await prisma.$transaction(
      order.map(({ id, displayOrder }) =>
        prisma.recentlySold.update({
          where: { id },
          data: { displayOrder: parseInt(displayOrder, 10) },
        })
      )
    );
    return successResponse(res, 200, 'Order updated');
  } catch (error) {
    console.error('Admin reorder recently sold error:', error);
    return errorResponse(res, 500, 'Failed to reorder entries');
  }
}
