/**
 * React Query hooks for every admin API endpoint.
 * Each hook handles loading/error state automatically.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  dashboardAPI, usersAPI, sellersAPI, applicationsAPI,
  tracksAPI, kycAPI, ordersAPI, withdrawalsAPI,
  analyticsAPI, auditLogsAPI, supportAPI, searchAPI,
} from "./api";
import type { AdminTrackRow } from "./api";

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const useDashboardStats = () =>
  useQuery({ queryKey: ["admin", "stats"], queryFn: dashboardAPI.getStats, refetchInterval: 30000 });

export const useRevenueChart = () =>
  useQuery({ queryKey: ["admin", "revenue-chart"], queryFn: dashboardAPI.getRevenueChart });

// ─── Users ────────────────────────────────────────────────────────────────────
export const useAdminUsers = (params: Record<string, string> = {}) =>
  useQuery({ queryKey: ["admin", "users", params], queryFn: () => usersAPI.list(params) });

export const useSuspendUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersAPI.suspend(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useRestoreUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersAPI.restore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

// ─── Sellers ──────────────────────────────────────────────────────────────────
export const useAdminSellers = (params: Record<string, string> = {}) =>
  useQuery({ queryKey: ["admin", "sellers", params], queryFn: () => sellersAPI.list(params) });

// ─── Seller Applications ──────────────────────────────────────────────────────
export const useAdminApplications = (params: Record<string, string> = {}) =>
  useQuery({ queryKey: ["admin", "applications", params], queryFn: () => applicationsAPI.list(params) });

export const useReviewApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      applicationsAPI.review(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
};

// ─── Tracks ───────────────────────────────────────────────────────────────────
export const useAdminTracks = (params: Record<string, string> = {}) =>
  useQuery({ queryKey: ["admin", "tracks", params], queryFn: () => tracksAPI.list(params) });

export const useReviewTrack = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "approve" | "reject"; reason?: string }) =>
      tracksAPI.review(id, action, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tracks"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
};

export const useRetriggerMRTScan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tracksAPI.retriggerMRTScan(id),
    onSuccess: (_data, id) => {
      // Refetch the track list after a short delay to allow scan to start
      setTimeout(() => qc.invalidateQueries({ queryKey: ["admin", "tracks"] }), 2000);
    },
  });
};

export const useTrackFiles = (trackId: string | null) =>
  useQuery({
    queryKey: ["admin", "track-files", trackId],
    queryFn: () => tracksAPI.getFiles(trackId!),
    enabled: !!trackId,
    staleTime: 5 * 60 * 1000, // cache 5 min (S3 URLs valid 2hrs)
  });

// ─── KYC ─────────────────────────────────────────────────────────────────────
export const useAdminKyc = (params: Record<string, string> = {}) =>
  useQuery({ queryKey: ["admin", "kyc", params], queryFn: () => kycAPI.list(params) });

export const useReviewKyc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "approve" | "reject"; reason?: string }) =>
      kycAPI.review(id, action, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "kyc"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const useAdminOrders = (params: Record<string, string> = {}) =>
  useQuery({ queryKey: ["admin", "orders", params], queryFn: () => ordersAPI.list(params) });

export const useRefundOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersAPI.refund(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });
};

// ─── Withdrawals ──────────────────────────────────────────────────────────────
export const useAdminWithdrawals = (params: Record<string, string> = {}) =>
  useQuery({ queryKey: ["admin", "withdrawals", params], queryFn: () => withdrawalsAPI.list(params) });

export const useProcessWithdrawal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      withdrawalsAPI.process(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "withdrawals"] }),
  });
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const useAdminAnalytics = () =>
  useQuery({ queryKey: ["admin", "analytics"], queryFn: analyticsAPI.get });

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const useAuditLogs = (params: Record<string, string> = {}) =>
  useQuery({ queryKey: ["admin", "audit-logs", params], queryFn: () => auditLogsAPI.list(params) });

// ─── Support Tickets ──────────────────────────────────────────────────────────
export const useAdminTickets = (params: Record<string, string> = {}) =>
  useQuery({ queryKey: ["admin", "tickets", params], queryFn: () => supportAPI.list(params) });

// ─── Global Search ────────────────────────────────────────────────────────────
export const useAdminSearch = (q: string) =>
  useQuery({
    queryKey: ["admin", "search", q],
    queryFn: () => searchAPI.search(q),
    enabled: q.trim().length >= 2,
  });


// ─── Blog ─────────────────────────────────────────────────────────────────────
import { blogAPI, featureFlagsAPI, settingsAPI } from "./api";
import type { BlogPostRow, FeatureFlagRow } from "./api";

export const useAdminBlogPosts = (params: Record<string, string> = {}) =>
  useQuery({ queryKey: ["admin", "blog", params], queryFn: () => blogAPI.list(params) });

export const useCreateBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BlogPostRow>) => blogAPI.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
  });
};

export const useUpdateBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<BlogPostRow>) => blogAPI.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
  });
};

export const useDeleteBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogAPI.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "blog"] }),
  });
};

// ─── Feature Flags ────────────────────────────────────────────────────────────
export const useFeatureFlags = () =>
  useQuery({ queryKey: ["admin", "feature-flags"], queryFn: featureFlagsAPI.list });

export const useToggleFeatureFlag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => featureFlagsAPI.toggle(id, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });
};

export const useCreateFeatureFlag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; enabled?: boolean; critical?: boolean }) => featureFlagsAPI.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });
};

// ─── Platform Settings ────────────────────────────────────────────────────────
export const usePlatformSettings = () =>
  useQuery({ queryKey: ["admin", "settings"], queryFn: settingsAPI.list });

export const useSavePlatformSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { key: string; value: string; type?: string }) => settingsAPI.save(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "settings"] }),
  });
};
