/**
 * GhostBus Master Admin Panel — API Client
 * Talks to the Express backend at /api/v1/admin/*
 * Auth: Bearer token (admin_token) + refresh token (admin_refresh_token)
 * Admin tokens last 24h. Refresh token lasts 7d.
 */

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("admin_token");
export const setToken = (t: string) => localStorage.setItem("admin_token", t);
export const clearToken = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_refresh_token");
};
export const getRefreshToken = () => localStorage.getItem("admin_refresh_token");
export const setRefreshToken = (t: string) => localStorage.setItem("admin_refresh_token", t);

// ─── Token refresh (called automatically on 401) ──────────────────────────────
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.data?.accessToken) return null;

    const newToken = json.data.accessToken;
    setToken(newToken);
    // Also refresh the refresh token if provided
    if (json.data.refreshToken) setRefreshToken(json.data.refreshToken);
    return newToken;
  } catch {
    return null;
  }
}

// ─── Core fetch wrapper with auto-refresh ────────────────────────────────────
async function req<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  // Auto-refresh on 401
  if (res.status === 401) {
    if (isRefreshing) {
      // Wait for the in-progress refresh
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          try {
            const retryRes = await fetch(`${BASE}${path}`, {
              method,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
              ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
            });
            const retryJson = await retryRes.json().catch(() => ({ message: "Error" }));
            if (!retryRes.ok) reject(new Error(retryJson?.message ?? `HTTP ${retryRes.status}`));
            else resolve(retryJson.data as T);
          } catch (e) { reject(e); }
        });
      });
    }

    isRefreshing = true;
    const newToken = await attemptTokenRefresh();
    isRefreshing = false;

    if (!newToken) {
      // Refresh failed — redirect to login
      clearToken();
      window.location.href = "/admin/login";
      throw new Error("Session expired. Please log in again.");
    }

    onTokenRefreshed(newToken);

    // Retry original request with new token
    const retryRes = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const retryJson = await retryRes.json().catch(() => ({ message: "Error" }));
    if (!retryRes.ok) throw new Error(retryJson?.message ?? `HTTP ${retryRes.status}`);
    return retryJson.data as T;
  }

  const json = await res.json().catch(() => ({ success: false, message: "Invalid JSON response" }));

  if (!res.ok) {
    const message = json?.message ?? `HTTP ${res.status}`;
    throw new Error(`${res.status}: ${message}`);
  }
  return json.data as T;
}

const get = <T>(path: string) => req<T>("GET", path);
const post = <T>(path: string, body?: unknown) => req<T>("POST", path, body);
const patch = <T>(path: string, body?: unknown) => req<T>("PATCH", path, body);

// ─── FormData fetch with auto-refresh ────────────────────────────────────────
async function reqForm<T = unknown>(
  method: string,
  path: string,
  formData: FormData,
): Promise<T> {
  const doFetch = async (token: string | null) => {
    return fetch(`${BASE}${path}`, {
      method,
      // DO NOT set Content-Type — browser sets it with boundary automatically
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  };

  let res = await doFetch(getToken());

  // Auto-refresh on 401
  if (res.status === 401) {
    const newToken = await attemptTokenRefresh();
    if (!newToken) {
      clearToken();
      window.location.href = "/admin/login";
      throw new Error("Session expired. Please log in again.");
    }
    res = await doFetch(newToken);
  }

  const json = await res.json().catch(() => ({ success: false, message: "Invalid JSON response" }));

  if (!res.ok) {
    const message = json?.message ?? `HTTP ${res.status}`;
    throw new Error(`${res.status}: ${message}`);
  }
  return json.data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    post<{ user: AdminUser; accessToken: string; refreshToken: string }>("/auth/login", { email, password }),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => get<DashboardStats>("/admin/stats"),
  getRevenueChart: () => get<{ data: RevenueDay[] }>("/admin/revenue-chart"),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  list: (params?: Record<string, string>) =>
    get<Paginated<"users", AdminUserRow>>(`/admin/users?${new URLSearchParams(params).toString()}`),
  suspend: (id: string) => patch(`/admin/users/${id}/suspend`),
  restore: (id: string) => patch(`/admin/users/${id}/restore`),
};

// ─── Sellers ──────────────────────────────────────────────────────────────────
export const sellersAPI = {
  list: (params?: Record<string, string>) =>
    get<Paginated<"sellers", SellerRow>>(`/admin/sellers?${new URLSearchParams(params).toString()}`),
};

// ─── Seller Applications ──────────────────────────────────────────────────────
export const applicationsAPI = {
  list: (params?: Record<string, string>) =>
    get<Paginated<"applications", ApplicationRow>>(`/admin/seller-applications?${new URLSearchParams(params).toString()}`),
  review: (id: string, action: "approve" | "reject") =>
    patch(`/admin/seller-applications/${id}/review`, { action }),
};

// ─── Tracks ───────────────────────────────────────────────────────────────────
export const tracksAPI = {
  list: (params?: Record<string, string>) =>
    get<Paginated<"tracks", AdminTrackRow>>(`/admin/tracks?${new URLSearchParams(params).toString()}`),
  review: (id: string, action: "approve" | "reject", reason?: string) =>
    patch(`/admin/tracks/${id}/review`, { action, reason }),
  getFiles: (id: string) =>
    get<{ trackId: string; title: string; files: TrackFileItem[] }>(`/admin/tracks/${id}/files`),
  getMRTStatus: (id: string) =>
    get<{ trackId: string; trackTitle: string; trackStatus: string; mrt: AdminTrackRow["mrt"] }>(`/tracks/${id}/mrt-status`),
  retriggerMRTScan: (id: string) =>
    post<{ message: string }>(`/tracks/${id}/mrt-rescan`),
};

// ─── KYC ─────────────────────────────────────────────────────────────────────
export const kycAPI = {
  list: (params?: Record<string, string>) =>
    get<Paginated<"submissions", KycRow>>(`/admin/kyc?${new URLSearchParams(params).toString()}`),
  review: (id: string, action: "approve" | "reject", reason?: string) =>
    patch(`/admin/kyc/${id}/review`, { action, reason }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  list: (params?: Record<string, string>) =>
    get<Paginated<"orders", OrderRow>>(`/admin/orders?${new URLSearchParams(params).toString()}`),
  refund: (id: string) => patch(`/admin/orders/${id}/refund`),
};

// ─── Withdrawals ──────────────────────────────────────────────────────────────
export const withdrawalsAPI = {
  list: (params?: Record<string, string>) =>
    get<Paginated<"withdrawals", WithdrawalRow>>(`/admin/withdrawals?${new URLSearchParams(params).toString()}`),
  process: (id: string, action: "approve" | "reject") =>
    patch(`/admin/withdrawals/${id}/process`, { action }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  get: () => get<AnalyticsData>("/admin/analytics"),
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditLogsAPI = {
  list: (params?: Record<string, string>) =>
    get<Paginated<"logs", AuditLogRow>>(`/admin/audit-logs?${new URLSearchParams(params).toString()}`),
};

// ─── Support Tickets ──────────────────────────────────────────────────────────
export const supportAPI = {
  list: (params?: Record<string, string>) =>
    get<Paginated<"tickets", TicketRow>>(`/admin/support-tickets?${new URLSearchParams(params).toString()}`),
};

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchAPI = {
  search: (q: string) => get<SearchResults>(`/admin/search?q=${encodeURIComponent(q)}`),
};

// ─── Blog ─────────────────────────────────────────────────────────────────────
export const blogAPI = {
  list: (params?: Record<string, string>) =>
    get<{ posts: BlogPostRow[]; pagination: Pagination }>(`/blog/admin/all?${new URLSearchParams(params).toString()}`),
  create: (data: Partial<BlogPostRow>) => post<{ post: BlogPostRow }>("/blog/admin", data),
  update: (id: string, data: Partial<BlogPostRow>) =>
    req<{ post: BlogPostRow }>("PUT", `/blog/admin/${id}`, data),
  delete: (id: string) => req<void>("DELETE", `/blog/admin/${id}`),
};

// ─── Feature Flags ────────────────────────────────────────────────────────────
export const featureFlagsAPI = {
  list: () => get<{ flags: FeatureFlagRow[] }>("/admin/feature-flags"),
  toggle: (id: string, enabled: boolean) => patch<{ flag: FeatureFlagRow }>(`/admin/feature-flags/${id}`, { enabled }),
  create: (data: { name: string; description?: string; enabled?: boolean; critical?: boolean }) =>
    post<{ flag: FeatureFlagRow }>("/admin/feature-flags", data),
};

// ─── Platform Settings ────────────────────────────────────────────────────────
export const settingsAPI = {
  list: () => get<{ settings: PlatformSettingRow[] }>("/admin/settings"),
  save: (data: { key: string; value: string; type?: string }) => post<{ setting: PlatformSettingRow }>("/admin/settings", data),
};

// ─── Recently Sold ────────────────────────────────────────────────────────────
export const recentlySoldAPI = {
  list: () => get<{ items: RecentlySoldRow[] }>("/recently-sold/admin"),
  create: (formData: FormData) =>
    reqForm<{ item: RecentlySoldRow }>("POST", "/recently-sold/admin", formData),
  update: (id: string, formData: FormData) =>
    reqForm<{ item: RecentlySoldRow }>("PATCH", `/recently-sold/admin/${id}`, formData),
  delete: (id: string) => req<void>("DELETE", `/recently-sold/admin/${id}`),
  reorder: (order: { id: string; displayOrder: number }[]) =>
    req<void>("PATCH", "/recently-sold/admin/reorder", { order }),
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string; email: string; fullName: string | null; role: string;
}
export interface DashboardStats {
  totalUsers: number; activeSellers: number;
  totalRevenue: number; monthRevenue: number;
  pendingTracks: number; openDisputes: number;
  pendingRefunds: number; pendingApplications: number;
  pendingKyc: number; pendingWithdrawals: number;
}
export interface RevenueDay { day: string; revenue: number; commission: number; }

export interface AdminUserRow {
  id: string; email: string; fullName: string | null; username: string | null;
  role: string; isVerified: boolean; kycStatus: string;
  sellerApplicationStatus: string | null; sellerVerified: boolean; createdAt: string;
}
export interface SellerRow {
  id: string; email: string; fullName: string | null; username: string | null;
  isVerified: boolean; sellerVerified: boolean; kycStatus: string;
  stripeAccountId: string | null; createdAt: string;
  totalEarnings: number;
  _count: { tracks: number; withdrawals: number };
}
export interface ApplicationRow {
  id: string; email: string; fullName: string | null; username: string | null;
  sellerApplicationStatus: string | null; createdAt: string; bio: string | null;
}
export interface TrackFileItem {
  key: string;
  label: string;
  type: "audio" | "archive" | "image" | "pdf";
  url: string | null;
  size: number | null;
}

export interface AdminTrackRow {
  id: string; title: string; genre: string; bpm: number | null; key: string | null;
  price: number; status: string; rejectionReason: string | null;
  playsCount: number; coverUrl: string | null; transparency: string; createdAt: string;
  description: string | null; tags: string[];
  seller: { id: string; fullName: string | null; email: string };
  _count: { orderItems: number };
  uploadDetails: {
    vocalType: string;
    platformFee: number | null;
    sellerPayout: number | null;
    hasLyrics: boolean;
    hasMidi: boolean;
    hasRadioEdit: boolean;
    hasExtendedMix: boolean;
    hasInstrumental: boolean;
    fileSizes: Record<string, number | null> | null;
    zipVerification: { valid: boolean; reason: string; checkedAt: string } | null;
  } | null;
  // MRT fields
  mrt?: {
    status: "scanning" | "clean" | "flagged" | "rejected" | "error" | "not_scanned";
    verdict: {
      reason: string;
      details?: {
        matchType?: string;
        matchTitle?: string;
        matchArtist?: string;
        aiProbability?: number;
        prediction?: string;
        [key: string]: unknown;
      } | null;
    } | null;
    scannedAt: string | null;
  };
}
export interface KycRow {
  id: string; documentType: string; documentUrl: string;
  status: string; rejectionReason: string | null;
  submittedAt: string; reviewedAt: string | null;
  user: { id: string; fullName: string | null; email: string };
}
export interface OrderRow {
  id: string; totalAmount: number; status: string;
  stripePaymentIntentId: string | null; createdAt: string;
  buyer: { id: string; fullName: string | null; email: string };
  items: { id: string; price: number; track: { id: string; title: string } }[];
}
export interface WithdrawalRow {
  id: string; amount: number; status: string;
  stripeTransferId: string | null; createdAt: string; processedAt: string | null;
  seller: { id: string; fullName: string | null; email: string; stripeAccountId: string | null };
}
export interface AnalyticsData {
  genreRevenue: { genre: string; value: number }[];
  usersGrowth: { month: string; users: number }[];
}
export interface AuditLogRow {
  id: string; adminId: string; adminEmail: string; ip: string;
  action: string; entity: string; entityId: string; createdAt: string;
}
export interface TicketRow {
  id: string; ticketNumber: string; fullName: string; email: string;
  subject: string; category: string; priority: string; status: string;
  createdAt: string; resolvedAt: string | null; adminNotes: string | null;
  assignedTo: { id: string; fullName: string | null } | null;
}
export interface SearchResults {
  users: (AdminUserRow & { _type: "user" })[];
  tracks: (Pick<AdminTrackRow, "id"|"title"|"genre"|"status"> & { _type: "track" })[];
  orders: ({ id: string; status: string; totalAmount: number; _type: "order" })[];
  tickets: ({ id: string; ticketNumber: string; subject: string; status: string; _type: "ticket" })[];
}

export interface BlogPostRow {
  id: string; title: string; slug: string; excerpt: string | null;
  content: string; coverImageUrl: string | null;
  category: string; tags: string[]; author: string;
  readTime: string | null; status: string;
  publishedAt: string | null; seoTitle: string | null;
  seoDescription: string | null; createdAt: string; updatedAt: string;
}

export interface FeatureFlagRow {
  id: string; name: string; description: string | null;
  enabled: boolean; critical: boolean;
  updatedBy: string | null; createdAt: string; updatedAt: string;
}

export interface PlatformSettingRow {
  id: string; key: string; value: string; type: string;
  updatedBy: string | null; createdAt: string; updatedAt: string;
}

export interface RecentlySoldRow {
  id: string;
  trackName: string;
  genre: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  soldAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Paginated<K extends string, T> {
  [key: string]: T[] | Pagination;
  pagination: Pagination;
}
export interface Pagination {
  page: number; limit: number; total: number; totalPages: number;
}
