import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getDashboardStats, getRevenueChart,
  getUsers, suspendUser, restoreUser,
  getSellers,
  getSellerApplications, reviewSellerApplication,
  getAdminTracks, reviewTrack,
  getKycSubmissions, reviewKyc,
  getOrders, refundOrder,
  getWithdrawals, processWithdrawal,
  getAnalytics, getAuditLogs,
  getAdminSupportTickets, globalSearch,
  getFeatureFlags, toggleFeatureFlag, createFeatureFlag,
  getPlatformSettings, upsertPlatformSetting,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/revenue-chart', getRevenueChart);

// Users
router.get('/users', getUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/restore', restoreUser);

// Sellers
router.get('/sellers', getSellers);

// Seller Applications
router.get('/seller-applications', getSellerApplications);
router.patch('/seller-applications/:id/review', reviewSellerApplication);

// Tracks
router.get('/tracks', getAdminTracks);
router.patch('/tracks/:id/review', reviewTrack);

// Track Files — admin can get signed URLs for all uploaded files
router.get('/tracks/:id/files', async (req, res) => {
  const { default: prisma } = await import('../config/database.js');
  const { getSignedDownloadUrl, getPreviewUrl } = await import('../utils/s3.js');
  const { successResponse, errorResponse } = await import('../utils/response.js');
  try {
    const track = await prisma.track.findUnique({
      where: { id: req.params.id },
      select: { id: true, title: true, audioUrl: true, coverUrl: true, waveformData: true },
    });
    if (!track) return errorResponse(res, 404, 'Track not found');

    const wd = track.waveformData ?? {};

    // Build list of all file slots with their S3 keys
    const slots = [
      { key: 'mastered',     s3Key: track.audioUrl,          type: 'audio', label: 'Mastered WAV' },
      { key: 'unmastered',   s3Key: wd.unmasteredKey,        type: 'audio', label: 'Unmastered WAV' },
      { key: 'stems',        s3Key: wd.stemsKey,             type: 'archive', label: 'Stems ZIP' },
      { key: 'midi',         s3Key: wd.midiKey,              type: 'archive', label: 'MIDI ZIP' },
      { key: 'artwork',      s3Key: track.coverUrl,          type: 'image', label: 'Artwork' },
      { key: 'lyrics',       s3Key: wd.lyricsKey,            type: 'pdf', label: 'Lyrics PDF' },
      { key: 'radioEdit',    s3Key: wd.radioEditKey,         type: 'audio', label: 'Radio Edit MP3' },
      { key: 'extendedMix',  s3Key: wd.extendedMixKey,      type: 'audio', label: 'Extended Mix MP3' },
      { key: 'instrumental', s3Key: wd.instrumentalKey,     type: 'audio', label: 'Instrumental MP3' },
    ].filter(s => !!s.s3Key);

    // Generate 2-hour signed URLs for all files
    const files = await Promise.all(slots.map(async (slot) => {
      const url = await getSignedDownloadUrl(slot.s3Key, 7200).catch(() => null);
      return { ...slot, url, size: wd.fileSizes?.[slot.key] ?? null };
    }));

    return successResponse(res, 200, 'Track files', { trackId: track.id, title: track.title, files });
  } catch (err) {
    console.error('Admin get track files error:', err);
    return errorResponse(res, 500, 'Failed to get track files');
  }
});

// KYC
router.get('/kyc', getKycSubmissions);
router.patch('/kyc/:id/review', reviewKyc);

// Orders
router.get('/orders', getOrders);
router.patch('/orders/:id/refund', refundOrder);

// Withdrawals
router.get('/withdrawals', getWithdrawals);
router.patch('/withdrawals/:id/process', processWithdrawal);

// Analytics
router.get('/analytics', getAnalytics);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

// Support Tickets
router.get('/support-tickets', getAdminSupportTickets);

// Global Search
router.get('/search', globalSearch);

// Feature Flags
router.get('/feature-flags', getFeatureFlags);
router.patch('/feature-flags/:id', toggleFeatureFlag);
router.post('/feature-flags', createFeatureFlag);

// Platform Settings
router.get('/settings', getPlatformSettings);
router.post('/settings', upsertPlatformSetting);

export default router;
