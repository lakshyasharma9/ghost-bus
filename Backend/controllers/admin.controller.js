import prisma from '../config/database.js';
import { errorResponse, successResponse } from '../utils/response.js';
import { getPreviewUrl } from '../utils/s3.js';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats(req, res) {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers, activeSellers,
      totalRevenue, monthRevenue,
      pendingTracks, openDisputes,
      pendingRefunds, pendingApplications,
      pendingKyc, pendingWithdrawals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SELLER', sellerVerified: true } }),
      prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
        _sum: { totalAmount: true },
      }),
      prisma.track.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'REFUNDED' } }),
      prisma.user.count({ where: { sellerApplicationStatus: 'pending' } }),
      prisma.kYCSubmission.count({ where: { status: 'PENDING' } }),
      prisma.withdrawal.count({ where: { status: 'pending' } }),
    ]);

    return successResponse(res, 200, 'Dashboard stats', {
      totalUsers,
      activeSellers,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      monthRevenue: Number(monthRevenue._sum.totalAmount || 0),
      pendingTracks,
      openDisputes,
      pendingRefunds,
      pendingApplications,
      pendingKyc,
      pendingWithdrawals,
    });
  } catch (err) {
    console.error('getDashboardStats:', err);
    return errorResponse(res, 500, 'Failed to fetch dashboard stats');
  }
}

// ─── Revenue (last 30 days) ───────────────────────────────────────────────────
export async function getRevenueChart(req, res) {
  try {
    const days = 30;
    const since = new Date(Date.now() - days * 86400000);

    const orders = await prisma.order.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: since } },
      select: { totalAmount: true, createdAt: true },
    });

    // Group by day
    const map = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - (days - 1 - i) * 86400000);
      const key = d.toISOString().slice(0, 10);
      map[key] = { day: key, revenue: 0, commission: 0 };
    }
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (map[key]) {
        const rev = Number(o.totalAmount);
        map[key].revenue += rev;
        map[key].commission += Math.round(rev * 0.28 * 100) / 100;
      }
    }

    return successResponse(res, 200, 'Revenue chart', { data: Object.values(map) });
  } catch (err) {
    console.error('getRevenueChart:', err);
    return errorResponse(res, 500, 'Failed to fetch revenue chart');
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getUsers(req, res) {
  try {
    const { role, status, search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (role) where.role = role.toUpperCase();
    if (status === 'suspended') where.isVerified = false;
    if (status === 'active') where.isVerified = true;
    if (search?.trim()) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limitNum, orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, fullName: true, username: true,
          role: true, isVerified: true, kycStatus: true, avatarUrl: true,
          sellerApplicationStatus: true, sellerVerified: true, createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse(res, 200, 'Users fetched', {
      users, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('getUsers:', err);
    return errorResponse(res, 500, 'Failed to fetch users');
  }
}

export async function suspendUser(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id }, data: { isVerified: false },
      select: { id: true, email: true, isVerified: true },
    });
    return successResponse(res, 200, 'User suspended', { user });
  } catch (err) {
    console.error('suspendUser:', err);
    return errorResponse(res, 500, 'Failed to suspend user');
  }
}

export async function restoreUser(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id }, data: { isVerified: true },
      select: { id: true, email: true, isVerified: true },
    });
    return successResponse(res, 200, 'User restored', { user });
  } catch (err) {
    console.error('restoreUser:', err);
    return errorResponse(res, 500, 'Failed to restore user');
  }
}

// ─── Sellers ──────────────────────────────────────────────────────────────────
export async function getSellers(req, res) {
  try {
    const { page = '1', limit = '20', search } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = { role: 'SELLER' };
    if (search?.trim()) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [sellers, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limitNum, orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, fullName: true, username: true,
          isVerified: true, sellerVerified: true, kycStatus: true,
          stripeAccountId: true, createdAt: true,
          _count: { select: { tracks: true, withdrawals: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Attach earnings
    const sellersWithEarnings = await Promise.all(sellers.map(async (s) => {
      const agg = await prisma.orderItem.aggregate({
        where: { track: { sellerId: s.id }, order: { status: 'COMPLETED' } },
        _sum: { price: true },
      });
      return { ...s, totalEarnings: Number(agg._sum.price || 0) * 0.72 };
    }));

    return successResponse(res, 200, 'Sellers fetched', {
      sellers: sellersWithEarnings,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('getSellers:', err);
    return errorResponse(res, 500, 'Failed to fetch sellers');
  }
}

// ─── Seller Applications ──────────────────────────────────────────────────────
export async function getSellerApplications(req, res) {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && status !== 'all') where.sellerApplicationStatus = status;
    else where.sellerApplicationStatus = { not: null };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limitNum, orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, fullName: true, username: true,
          sellerApplicationStatus: true, createdAt: true, bio: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse(res, 200, 'Seller applications', {
      applications: users,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('getSellerApplications:', err);
    return errorResponse(res, 500, 'Failed to fetch seller applications');
  }
}

export async function reviewSellerApplication(req, res) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return errorResponse(res, 400, 'Invalid action');
    }
    const data = {
      sellerApplicationStatus: action === 'approve' ? 'approved' : 'rejected',
      ...(action === 'approve' && {
        role: 'SELLER',
        sellerVerified: true,
        sellerModeEnabled: true, // automatically enable seller mode on approval
      }),
    };
    const user = await prisma.user.update({ where: { id }, data, select: { id: true, email: true, sellerApplicationStatus: true, sellerVerified: true } });
    return successResponse(res, 200, `Application ${action}d`, { user });
  } catch (err) {
    console.error('reviewSellerApplication:', err);
    return errorResponse(res, 500, 'Failed to review application');
  }
}

// ─── Tracks (Admin) ───────────────────────────────────────────────────────────
export async function getAdminTracks(req, res) {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && status !== 'all') where.status = status.toUpperCase();
    if (search?.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { genre: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where, skip, take: limitNum, orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, genre: true, bpm: true, key: true,
          price: true, status: true, rejectionReason: true, playsCount: true,
          description: true, tags: true,
          coverUrl: true, waveformData: true, createdAt: true,
          seller: { select: { id: true, fullName: true, email: true } },
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.track.count({ where }),
    ]);

    const formatted = tracks.map(t => ({
      ...t,
      price: Number(t.price),
      transparency: t.waveformData?.transparency || 'original',
      // Full upload form data for A&R review
      uploadDetails: t.waveformData ? {
        vocalType:       t.waveformData.vocalType       ?? 'none',
        platformFee:     t.waveformData.platformFee     ?? null,
        sellerPayout:    t.waveformData.sellerPayout    ?? null,
        hasLyrics:       !!t.waveformData.lyricsKey,
        hasMidi:         !!t.waveformData.midiKey,
        hasRadioEdit:    !!t.waveformData.radioEditKey,
        hasExtendedMix:  !!t.waveformData.extendedMixKey,
        hasInstrumental: !!t.waveformData.instrumentalKey,
        fileSizes:       t.waveformData.fileSizes       ?? null,
        zipVerification: t.waveformData.zipVerification ?? null,
      } : null,
      // Expose MRT scan result for admin review UI
      mrt: t.waveformData ? {
        status:    t.waveformData.mrtStatus    ?? 'not_scanned',
        verdict:   t.waveformData.mrtVerdict   ?? null,
        scannedAt: t.waveformData.mrtScannedAt ?? null,
      } : null,
      waveformData: undefined, // strip raw internal data from response
    }));

    return successResponse(res, 200, 'Admin tracks', {
      tracks: formatted,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('getAdminTracks:', err);
    return errorResponse(res, 500, 'Failed to fetch tracks');
  }
}

export async function reviewTrack(req, res) {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action)) return errorResponse(res, 400, 'Invalid action');

    const data = {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      ...(action === 'reject' && reason && { rejectionReason: reason }),
    };

    const track = await prisma.track.update({
      where: { id }, data,
      select: { id: true, title: true, status: true, rejectionReason: true },
    });
    return successResponse(res, 200, `Track ${action}d`, { track });
  } catch (err) {
    console.error('reviewTrack:', err);
    return errorResponse(res, 500, 'Failed to review track');
  }
}

// ─── KYC ─────────────────────────────────────────────────────────────────────
export async function getKycSubmissions(req, res) {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && status !== 'all') where.status = status.toUpperCase();

    const [submissions, total] = await Promise.all([
      prisma.kYCSubmission.findMany({
        where, skip, take: limitNum, orderBy: { submittedAt: 'desc' },
        select: {
          id: true, documentType: true, documentUrl: true,
          status: true, rejectionReason: true, submittedAt: true, reviewedAt: true,
          user: { select: { id: true, fullName: true, email: true } },
        },
      }),
      prisma.kYCSubmission.count({ where }),
    ]);

    return successResponse(res, 200, 'KYC submissions', {
      submissions: await Promise.all(submissions.map(async (s) => ({
        ...s,
        documentUrl: s.documentUrl ? await getPreviewUrl(s.documentUrl).catch(() => s.documentUrl) : null,
      }))),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('getKycSubmissions:', err);
    return errorResponse(res, 500, 'Failed to fetch KYC submissions');
  }
}

export async function reviewKyc(req, res) {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action)) return errorResponse(res, 400, 'Invalid action');

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const submission = await prisma.kYCSubmission.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        ...(action === 'reject' && reason && { rejectionReason: reason }),
      },
      select: { id: true, status: true, userId: true },
    });

    if (action === 'approve') {
      await prisma.user.update({
        where: { id: submission.userId },
        data: { kycStatus: 'APPROVED', sellerVerified: true },
      });
    }

    return successResponse(res, 200, `KYC ${action}d`, { submission });
  } catch (err) {
    console.error('reviewKyc:', err);
    return errorResponse(res, 500, 'Failed to review KYC');
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getOrders(req, res) {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && status !== 'all') where.status = status.toUpperCase();

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take: limitNum, orderBy: { createdAt: 'desc' },
        select: {
          id: true, totalAmount: true, status: true,
          stripePaymentIntentId: true, createdAt: true,
          buyer: { select: { id: true, fullName: true, email: true } },
          items: { select: { id: true, price: true, track: { select: { id: true, title: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const formatted = orders.map(o => ({
      ...o, totalAmount: Number(o.totalAmount),
      items: o.items.map(i => ({ ...i, price: Number(i.price) })),
    }));

    return successResponse(res, 200, 'Orders', {
      orders: formatted,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('getOrders:', err);
    return errorResponse(res, 500, 'Failed to fetch orders');
  }
}

export async function refundOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await prisma.order.update({
      where: { id }, data: { status: 'REFUNDED' },
      select: { id: true, status: true },
    });
    return successResponse(res, 200, 'Order refunded', { order });
  } catch (err) {
    console.error('refundOrder:', err);
    return errorResponse(res, 500, 'Failed to refund order');
  }
}

// ─── Withdrawals ──────────────────────────────────────────────────────────────
export async function getWithdrawals(req, res) {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && status !== 'all') where.status = status;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where, skip, take: limitNum, orderBy: { createdAt: 'desc' },
        select: {
          id: true, amount: true, status: true,
          stripeTransferId: true, createdAt: true, processedAt: true,
          seller: { select: { id: true, fullName: true, email: true, stripeAccountId: true } },
        },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    const formatted = withdrawals.map(w => ({ ...w, amount: Number(w.amount) }));
    return successResponse(res, 200, 'Withdrawals', {
      withdrawals: formatted,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('getWithdrawals:', err);
    return errorResponse(res, 500, 'Failed to fetch withdrawals');
  }
}

export async function processWithdrawal(req, res) {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) return errorResponse(res, 400, 'Invalid action');

    const w = await prisma.withdrawal.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'processed' : 'rejected',
        ...(action === 'approve' && { processedAt: new Date() }),
      },
      select: { id: true, status: true },
    });
    return successResponse(res, 200, `Withdrawal ${action}d`, { withdrawal: w });
  } catch (err) {
    console.error('processWithdrawal:', err);
    return errorResponse(res, 500, 'Failed to process withdrawal');
  }
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getAnalytics(req, res) {
  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);

    const [genreRows, userGrowthRaw] = await Promise.all([
      prisma.track.groupBy({
        by: ['genre'],
        where: { status: 'APPROVED' },
        _count: { id: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: yearStart } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Genre revenue breakdown (use play counts as proxy)
    const genreRevenue = genreRows
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 6)
      .map(r => ({ genre: r.genre, value: r._count.id }));

    // Monthly user growth
    const monthMap = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date(yearStart.getFullYear(), yearStart.getMonth() + i, 1);
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      monthMap[key] = { month: key, users: 0 };
    }
    for (const u of userGrowthRaw) {
      const key = u.createdAt.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      if (monthMap[key]) monthMap[key].users++;
    }

    return successResponse(res, 200, 'Analytics', {
      genreRevenue,
      usersGrowth: Object.values(monthMap),
    });
  } catch (err) {
    console.error('getAnalytics:', err);
    return errorResponse(res, 500, 'Failed to fetch analytics');
  }
}

// ─── Audit Log helper (write) ─────────────────────────────────────────────────
// We store audit logs in a simple in-memory list since the schema has no AuditLog model.
// For production, add an AuditLog model to prisma schema.
const _auditLog = [];
export function writeAuditLog({ adminId, adminEmail, ip, action, entity, entityId }) {
  _auditLog.unshift({ id: `log_${Date.now()}`, adminId, adminEmail, ip, action, entity, entityId, createdAt: new Date().toISOString() });
  if (_auditLog.length > 500) _auditLog.length = 500;
}

export async function getAuditLogs(req, res) {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, parseInt(limit) || 50);
    const skip = (pageNum - 1) * limitNum;
    const slice = _auditLog.slice(skip, skip + limitNum);
    return successResponse(res, 200, 'Audit logs', {
      logs: slice,
      pagination: { page: pageNum, limit: limitNum, total: _auditLog.length, totalPages: Math.ceil(_auditLog.length / limitNum) },
    });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch audit logs');
  }
}

// ─── Support Tickets (Admin) ──────────────────────────────────────────────────
export async function getAdminSupportTickets(req, res) {
  try {
    const { status, priority, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && status !== 'all') where.status = status.toUpperCase();
    if (priority && priority !== 'all') where.priority = priority.toUpperCase();

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where, skip, take: limitNum, orderBy: { createdAt: 'desc' },
        select: {
          id: true, ticketNumber: true, fullName: true, email: true,
          subject: true, category: true, priority: true, status: true,
          createdAt: true, resolvedAt: true, adminNotes: true,
          assignedTo: { select: { id: true, fullName: true } },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return successResponse(res, 200, 'Support tickets', {
      tickets,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('getAdminSupportTickets:', err);
    return errorResponse(res, 500, 'Failed to fetch support tickets');
  }
}

// ─── Global Search ────────────────────────────────────────────────────────────
export async function globalSearch(req, res) {
  try {
    const { q } = req.query;
    if (!q?.trim()) return successResponse(res, 200, 'Search results', { results: [] });

    const [users, tracks, orders, tickets] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { username: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5, select: { id: true, fullName: true, email: true, role: true },
      }),
      prisma.track.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { genre: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5, select: { id: true, title: true, genre: true, status: true },
      }),
      prisma.order.findMany({
        where: { id: { contains: q, mode: 'insensitive' } },
        take: 5, select: { id: true, status: true, totalAmount: true },
      }),
      prisma.supportTicket.findMany({
        where: {
          OR: [
            { subject: { contains: q, mode: 'insensitive' } },
            { ticketNumber: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5, select: { id: true, ticketNumber: true, subject: true, status: true },
      }),
    ]);

    return successResponse(res, 200, 'Search results', {
      users: users.map(u => ({ ...u, _type: 'user' })),
      tracks: tracks.map(t => ({ ...t, _type: 'track' })),
      orders: orders.map(o => ({ ...o, totalAmount: Number(o.totalAmount), _type: 'order' })),
      tickets: tickets.map(t => ({ ...t, _type: 'ticket' })),
    });
  } catch (err) {
    console.error('globalSearch:', err);
    return errorResponse(res, 500, 'Search failed');
  }
}

// ─── Feature Flags ────────────────────────────────────────────────────────────
export async function getFeatureFlags(req, res) {
  try {
    const flags = await prisma.featureFlag.findMany({ orderBy: { name: 'asc' } });
    return successResponse(res, 200, 'Feature flags', { flags });
  } catch (err) {
    console.error('getFeatureFlags:', err);
    return errorResponse(res, 500, 'Failed to fetch feature flags');
  }
}

export async function toggleFeatureFlag(req, res) {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    const flag = await prisma.featureFlag.update({
      where: { id },
      data: { enabled, updatedBy: req.user.email },
    });
    return successResponse(res, 200, 'Feature flag updated', { flag });
  } catch (err) {
    console.error('toggleFeatureFlag:', err);
    return errorResponse(res, 500, 'Failed to toggle feature flag');
  }
}

export async function createFeatureFlag(req, res) {
  try {
    const { name, description, enabled, critical } = req.body;
    if (!name?.trim()) return errorResponse(res, 400, 'Name is required');
    const flag = await prisma.featureFlag.create({
      data: { name: name.trim(), description: description || null, enabled: !!enabled, critical: !!critical, updatedBy: req.user.email },
    });
    return successResponse(res, 201, 'Feature flag created', { flag });
  } catch (err) {
    if (err.code === 'P2002') return errorResponse(res, 409, 'Flag name already exists');
    return errorResponse(res, 500, 'Failed to create flag');
  }
}

// ─── Platform Settings ────────────────────────────────────────────────────────
export async function getPlatformSettings(req, res) {
  try {
    const settings = await prisma.platformSetting.findMany({ orderBy: { key: 'asc' } });
    return successResponse(res, 200, 'Platform settings', { settings });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch settings');
  }
}

export async function upsertPlatformSetting(req, res) {
  try {
    const { key, value, type } = req.body;
    if (!key?.trim()) return errorResponse(res, 400, 'Key is required');
    const setting = await prisma.platformSetting.upsert({
      where: { key: key.trim() },
      update: { value: String(value), type: type || 'string', updatedBy: req.user.email },
      create: { key: key.trim(), value: String(value), type: type || 'string', updatedBy: req.user.email },
    });
    return successResponse(res, 200, 'Setting saved', { setting });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to save setting');
  }
}
