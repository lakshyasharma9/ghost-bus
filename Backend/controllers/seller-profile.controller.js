import prisma from '../config/database.js';
import { getPreviewUrl } from '../utils/s3.js';
import { errorResponse, successResponse } from '../utils/response.js';

// ─── Helper: resolve avatar/banner URLs ──────────────────────────────────────

async function resolveAvatarUrl(url) {
  if (!url) return null;
  // S3 keys don't start with http — generate signed URL
  if (!url.startsWith('http') && !url.startsWith('data:')) {
    return getPreviewUrl(url).catch(() => url);
  }
  return url;
}

// ─── GET /api/v1/sellers/:username/profile ───────────────────────────────────

/**
 * Public: Get a seller's full public profile.
 * Returns: seller info, stats (available/sold tracks, follower count),
 * whether the requesting user follows them, and all their live tracks.
 */
export async function getSellerProfile(req, res) {
  try {
    const { username } = req.params;
    const requesterId = req.user?.id ?? null; // optional auth

    const seller = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          // Also allow lookup by ID (fallback)
          { id: username },
        ],
        sellerVerified: true,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        createdAt: true,
        sellerVerified: true,
        // Count followers
        _count: { select: { followers: true } },
      },
    });

    if (!seller) {
      return errorResponse(res, 404, 'Seller not found');
    }

    // Track stats — available (approved, unsold) and sold
    const [availableTracks, soldTracks, allTracks] = await Promise.all([
      prisma.track.count({
        where: { sellerId: seller.id, status: 'APPROVED', orderItems: { none: {} } },
      }),
      prisma.track.count({
        where: { sellerId: seller.id, status: 'APPROVED', orderItems: { some: {} } },
      }),
      // Get all APPROVED tracks for listing
      prisma.track.findMany({
        where: { sellerId: seller.id, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          genre: true,
          bpm: true,
          key: true,
          price: true,
          coverUrl: true,
          duration: true,
          tags: true,
          isExclusive: true,
          playsCount: true,
          likesCount: true,
          createdAt: true,
          _count: { select: { orderItems: true } },
        },
      }),
    ]);

    // Check if requesting user follows this seller
    let isFollowing = false;
    if (requesterId && requesterId !== seller.id) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: requesterId, followingId: seller.id } },
      });
      isFollowing = !!follow;
    }

    // Resolve cover URLs (S3 signed or data URL)
    const tracksWithUrls = await Promise.all(
      allTracks.map(async (track) => ({
        ...track,
        price: Number(track.price),
        sold: track._count.orderItems > 0,
        coverUrl: track.coverUrl ? await resolveAvatarUrl(track.coverUrl) : null,
        _count: undefined,
      }))
    );

    return successResponse(res, 200, 'Seller profile fetched', {
      seller: {
        id: seller.id,
        fullName: seller.fullName,
        username: seller.username,
        avatarUrl: await resolveAvatarUrl(seller.avatarUrl),
        bannerUrl: await resolveAvatarUrl(seller.bannerUrl),
        // Only show bio if it's a real text bio (not the seller application JSON)
        bio: (seller.bio && !seller.bio.startsWith('{')) ? seller.bio : null,
        memberSince: seller.createdAt,
        sellerVerified: seller.sellerVerified,
        stats: {
          availableTracks,
          soldTracks,
          followers: seller._count.followers,
        },
        isFollowing,
      },
      tracks: tracksWithUrls,
    });
  } catch (error) {
    console.error('Get seller profile error:', error);
    return errorResponse(res, 500, 'Failed to fetch seller profile');
  }
}

// ─── POST /api/v1/sellers/:username/follow ────────────────────────────────────

/**
 * Toggle follow/unfollow a seller. Auth required.
 */
export async function toggleFollow(req, res) {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    // Find the seller
    const seller = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { id: username }],
        sellerVerified: true,
      },
      select: { id: true },
    });

    if (!seller) return errorResponse(res, 404, 'Seller not found');
    if (seller.id === followerId) return errorResponse(res, 400, 'Cannot follow yourself');

    // Check existing follow
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId: seller.id } },
    });

    if (existing) {
      // Unfollow
      await prisma.follow.delete({
        where: { followerId_followingId: { followerId, followingId: seller.id } },
      });
      const count = await prisma.follow.count({ where: { followingId: seller.id } });
      return successResponse(res, 200, 'Unfollowed', { isFollowing: false, followers: count });
    } else {
      // Follow
      await prisma.follow.create({ data: { followerId, followingId: seller.id } });
      const count = await prisma.follow.count({ where: { followingId: seller.id } });
      return successResponse(res, 200, 'Followed', { isFollowing: true, followers: count });
    }
  } catch (error) {
    console.error('Toggle follow error:', error);
    return errorResponse(res, 500, 'Failed to update follow');
  }
}

// ─── PATCH /api/v1/users/banner ──────────────────────────────────────────────

/**
 * Upload/update seller banner image (base64 stored directly — no S3).
 * Multipart: field "banner" (image file)
 */
export async function uploadBanner(req, res) {
  try {
    const userId = req.user.id;
    const imageFile = req.files?.banner?.[0] || req.file || null;

    if (!imageFile) return errorResponse(res, 400, 'Banner image is required');

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(imageFile.mimetype)) {
      return errorResponse(res, 400, 'Image must be JPEG, PNG, or WebP');
    }
    if (imageFile.size > 3 * 1024 * 1024) {
      return errorResponse(res, 400, 'Banner image must be under 3MB');
    }

    // Store as base64 data URL (no S3 dependency)
    const base64 = imageFile.buffer.toString('base64');
    const bannerUrl = `data:${imageFile.mimetype};base64,${base64}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { bannerUrl },
      select: { id: true, bannerUrl: true },
    });

    return successResponse(res, 200, 'Banner updated', { bannerUrl: user.bannerUrl });
  } catch (error) {
    console.error('Upload banner error:', error);
    return errorResponse(res, 500, 'Failed to update banner');
  }
}
