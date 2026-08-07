import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

// ─── TRACKS ──────────────────────────────────────────────────────────────────

export function useTracks(filters?: { 
  genre?: string; 
  minBpm?: number; 
  maxBpm?: number; 
  maxPrice?: number; 
  status?: string 
}) {
  return useQuery({
    queryKey: ["tracks", filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/tracks', { params: filters });
      // Backend returns { tracks: [...], pagination: {...} }
      return data.data?.tracks || data.data || [];
    },
  });
}

export function useTrack(id: string) {
  return useQuery({
    queryKey: ["track", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tracks/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useMyTracks() {
  return useQuery({
    queryKey: ["my-tracks"],
    queryFn: async () => {
      const { data } = await apiClient.get('/tracks/my-tracks');
      // Backend returns { tracks: [...], pagination: {...} }
      return data.data?.tracks || data.data || [];
    },
  });
}

export function useUploadTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post('/tracks', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tracks"] });
      toast.success("Track submitted for review!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...update }: any) => {
      const { data } = await apiClient.patch(`/tracks/${id}`, update);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tracks"] });
      qc.invalidateQueries({ queryKey: ["tracks"] });
      toast.success("Track updated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tracks/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tracks"] });
      toast.success("Track deleted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export function useMyOrders() {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data } = await apiClient.get('/orders/my-orders');
      return data.data || [];
    },
  });
}

export function useSellerOrders() {
  return useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => {
      const { data } = await apiClient.get('/orders/seller-orders');
      return data.data || [];
    },
  });
}

export function useSellerStats() {
  return useQuery({
    queryKey: ["seller-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get('/sellers/stats');
      return data.data || null;
    },
  });
}

// ─── SERVICES ────────────────────────────────────────────────────────────────

export function useServices(category?: string) {
  return useQuery({
    queryKey: ["services", category],
    queryFn: async () => {
      const { data } = await apiClient.get('/services', { params: { category } });
      return data.data || [];
    },
  });
}

export function useMyServices() {
  return useQuery({
    queryKey: ["my-services"],
    queryFn: async () => {
      const { data } = await apiClient.get('/services/my-services');
      return data.data || [];
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post('/services', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service created!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const endpoint = userId ? `/users/profile/${userId}` : '/auth/profile';
      const { data } = await apiClient.get(endpoint);
      return data.data?.user || null;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (update: any) => {
      const { data } = await apiClient.patch('/users/profile', update);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const { data } = await apiClient.post('/users/change-password', payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.[0]?.message ||
        "Failed to change password";
      toast.error(msg);
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await apiClient.post('/users/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data as { avatarUrl: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile photo updated!");
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message || "Failed to upload photo";
      toast.error(msg);
    },
  });
}

export function useUploadBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('banner', file);
      const { data } = await apiClient.post('/sellers/banner', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data as { bannerUrl: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Banner updated!");
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message || "Failed to upload banner";
      toast.error(msg);
    },
  });
}

// ─── KYC & WITHDRAWALS ───────────────────────────────────────────────────────

export function useMyKYC() {
  return useQuery({
    queryKey: ["my-kyc"],
    queryFn: async () => {
      const { data } = await apiClient.get('/kyc/my-kyc');
      return data.data || null;
    },
  });
}

export function useSubmitKYC() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post('/kyc/submit', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-kyc"] });
      toast.success("KYC submitted for review!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMyWithdrawals() {
  return useQuery({
    queryKey: ["my-withdrawals"],
    queryFn: async () => {
      const { data } = await apiClient.get('/withdrawals/my-withdrawals');
      return data.data || [];
    },
  });
}

export function useRequestWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post('/withdrawals/request', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-withdrawals"] });
      toast.success("Withdrawal requested! Processing in 2-3 business days.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── SEARCH ──────────────────────────────────────────────────────────────────

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query.trim()) return { tracks: [], profiles: [] };
      const { data } = await apiClient.get('/search', { params: { q: query } });
      return data.data || { tracks: [], profiles: [] };
    },
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}

// ─── NOTIFICATIONS (Placeholder) ─────────────────────────────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/notifications/${id}/mark-read`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/notifications/mark-all-read');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ─── FILE UPLOAD (Placeholder) ───────────────────────────────────────────────

export async function uploadFile(file: File, type: 'audio' | 'image'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  const { data } = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return data.data.url;
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────

export function useAdminTracks(status?: string) {
  return useQuery({
    queryKey: ["admin-tracks", status],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/tracks', { params: { status } });
      return data.data || [];
    },
  });
}

export function useAdminReviewTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post('/admin/tracks/review', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tracks"] });
      toast.success("Track review submitted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminKYC() {
  return useQuery({
    queryKey: ["admin-kyc"],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/kyc');
      return data.data || [];
    },
  });
}

export function useAdminReviewKYC() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post('/admin/kyc/review', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-kyc"] });
      toast.success("KYC review submitted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/users');
      return data.data || [];
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/stats');
      return data.data || {};
    },
  });
}
