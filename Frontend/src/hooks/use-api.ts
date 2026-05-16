import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

// Cast to any to bypass Supabase generic inference — all runtime types are correct
const db = supabase as any;

// ─── TRACKS ──────────────────────────────────────────────────────────────────

export function useTracks(filters?: { genre?: string; minBpm?: number; maxBpm?: number; maxPrice?: number; status?: string }) {
  return useQuery({
    queryKey: ["tracks", filters],
    queryFn: async () => {
      let q = db.from("tracks").select("*, profiles(display_name, avatar_url)");
      if (filters?.genre) q = q.eq("genre", filters.genre);
      if (filters?.minBpm) q = q.gte("bpm", filters.minBpm);
      if (filters?.maxBpm) q = q.lte("bpm", filters.maxBpm);
      if (filters?.maxPrice) q = q.lte("price", filters.maxPrice);
      if (filters?.status) q = q.eq("status", filters.status);
      else q = q.in("status", ["approved", "sold"]);
      q = q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTrack(id: string) {
  return useQuery({
    queryKey: ["track", id],
    queryFn: async () => {
      const { data, error } = await db
        .from("tracks")
        .select("*, profiles(display_name, avatar_url, bio)")
        .eq("id", id)
        .single();
      if (error) throw error;
      db.from("tracks").update({ views: (data.views ?? 0) + 1 }).eq("id", id).then(() => {});
      return data;
    },
    enabled: !!id,
  });
}

export function useMyTracks() {
  return useQuery({
    queryKey: ["my-tracks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await db
        .from("tracks")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUploadTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await db.from("tracks").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tracks"] });
      toast.success("Track submitted for A&R review!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...update }: any) => {
      const { data, error } = await db.from("tracks").update(update).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tracks"] });
      qc.invalidateQueries({ queryKey: ["tracks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("tracks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tracks"] });
      toast.success("Track deleted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── FILE UPLOAD ──────────────────────────────────────────────────────────────

export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadTrackFiles(userId: string, trackId: string, files: Record<string, File | null>) {
  const urls: Record<string, string> = {};
  const uploads = Object.entries(files).filter(([, f]) => f !== null) as [string, File][];
  await Promise.all(
    uploads.map(async ([key, file]) => {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${trackId}/${key}.${ext}`;
      urls[key] = await uploadFile("tracks", path, file);
    })
  );
  return urls;
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export function useMyOrders() {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await db
        .from("orders")
        .select("*, tracks(title, genre, artwork_url, bpm, musical_key), profiles!orders_seller_id_fkey(display_name)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSellerOrders() {
  return useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await db
        .from("orders")
        .select("*, tracks(title, genre, artwork_url), profiles!orders_buyer_id_fkey(display_name, avatar_url)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSellerStats() {
  return useQuery({
    queryKey: ["seller-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await db
        .from("seller_stats")
        .select("*")
        .eq("seller_id", user.id)
        .single();
      if (error) return null;
      return data;
    },
  });
}

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export function useThreads() {
  return useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await db
        .from("message_threads")
        .select("*, pa:profiles!message_threads_participant_a_fkey(id,display_name,avatar_url), pb:profiles!message_threads_participant_b_fkey(id,display_name,avatar_url)")
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((t: any) => ({
        ...t,
        other: t.pa?.id === user.id ? t.pb : t.pa,
        myUnread: t.participant_a === user.id ? t.unread_a : t.unread_b,
      }));
    },
  });
}

export function useMessages(threadId: string | null) {
  return useQuery({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      if (!threadId) return [];
      const { data, error } = await db
        .from("messages")
        .select("*, sender:profiles!messages_sender_id_fkey(display_name, avatar_url)")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!threadId,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ threadId, recipientId, body }: { threadId: string; recipientId: string; body: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await db.from("messages").insert({
        thread_id: threadId,
        sender_id: user.id,
        recipient_id: recipientId,
        body,
      });
      if (error) throw error;
      await db.from("message_threads").update({
        last_message: body,
        last_message_at: new Date().toISOString(),
      }).eq("id", threadId);
    },
    onSuccess: (_, { threadId }) => {
      qc.invalidateQueries({ queryKey: ["messages", threadId] });
      qc.invalidateQueries({ queryKey: ["threads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useOrCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const [a, b] = [user.id, otherUserId].sort();
      const { data: existing } = await db
        .from("message_threads")
        .select("id")
        .eq("participant_a", a)
        .eq("participant_b", b)
        .single();
      if (existing) return existing.id as string;
      const { data, error } = await db
        .from("message_threads")
        .insert({ participant_a: a, participant_b: b })
        .select("id")
        .single();
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["threads"] });
      return data.id as string;
    },
  });
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export function useNotifications() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [] as Tables<"notifications">[];
      const { data, error } = await db
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Tables<"notifications">[];
    },
  });

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channel = supabase
        .channel("notifications-realtime")
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          const n = payload.new as Tables<"notifications">;
          toast(n.title, { description: n.body });
          qc.invalidateQueries({ queryKey: ["notifications"] });
        })
        .subscribe();
    });
    return () => { channel?.unsubscribe(); };
  }, [qc]);

  return query;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("notifications").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await db.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export function useMyKYC() {
  return useQuery({
    queryKey: ["my-kyc"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await db.from("kyc_submissions").select("*").eq("user_id", user.id).single();
      return data ?? null;
    },
  });
}

export function useSubmitKYC() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id_document_url: string; address_document_url: string; payout_email: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: existing } = await db.from("kyc_submissions").select("id").eq("user_id", user.id).single();
      if (existing) {
        const { error } = await db.from("kyc_submissions").update({ ...payload, status: "pending" }).eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await db.from("kyc_submissions").insert({ user_id: user.id, ...payload });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-kyc"] });
      toast.success("KYC submitted for review!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── SERVICES ────────────────────────────────────────────────────────────────

export function useServices(category?: string) {
  return useQuery({
    queryKey: ["services", category],
    queryFn: async () => {
      let q = db.from("services").select("*, profiles(display_name, avatar_url)").eq("status", "active");
      if (category) q = q.eq("category", category);
      q = q.order("rating_avg", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyServices() {
  return useQuery({
    queryKey: ["my-services"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await db.from("services").select("*").eq("seller_id", user.id).neq("status", "deleted");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await db.from("services").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service created!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── WISHLIST ─────────────────────────────────────────────────────────────────

export function useWishlistDB() {
  return useQuery({
    queryKey: ["wishlist-db"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await db
        .from("wishlists")
        .select("track_id, tracks(id, title, genre, price, artwork_url, bpm, musical_key, status)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useToggleWishlistDB() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ trackId, isWishlisted }: { trackId: string; isWishlisted: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to save tracks");
      if (isWishlisted) {
        await db.from("wishlists").delete().eq("user_id", user.id).eq("track_id", trackId);
      } else {
        await db.from("wishlists").insert({ user_id: user.id, track_id: trackId });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist-db"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const id = userId ?? (await supabase.auth.getUser()).data.user?.id;
      if (!id) return null;
      const { data, error } = await db.from("profiles").select("*").eq("id", id).single();
      if (error) return null;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (update: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await db.from("profiles").update(update).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export function useAdminTracks(status?: string) {
  return useQuery({
    queryKey: ["admin-tracks", status],
    queryFn: async () => {
      let q = db.from("tracks").select("*, profiles(display_name, avatar_url)");
      if (status) q = q.eq("status", status);
      q = q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminReviewTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, rejection_reason }: { id: string; status: "approved" | "rejected"; rejection_reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await db.from("tracks").update({ status, rejection_reason: rejection_reason ?? null }).eq("id", id);
      if (error) throw error;
      await db.from("admin_actions").insert({
        admin_id: user.id,
        action_type: status === "approved" ? "track_approved" : "track_rejected",
        target_type: "track",
        target_id: id,
        notes: rejection_reason,
      });
      const { data: track } = await db.from("tracks").select("seller_id, title").eq("id", id).single();
      if (track) {
        await db.from("notifications").insert({
          user_id: track.seller_id,
          type: status === "approved" ? "review_approved" : "review_rejected",
          title: status === "approved" ? "Track Approved! 🎉" : "Track Needs Changes",
          body: status === "approved"
            ? `"${track.title}" is now live on the marketplace.`
            : `"${track.title}" was not approved. Reason: ${rejection_reason}`,
        });
      }
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
      const { data, error } = await db
        .from("kyc_submissions")
        .select("*, profiles(display_name, avatar_url, role)")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminReviewKYC() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId, status, rejection_reason }: { id: string; userId: string; status: "approved" | "rejected"; rejection_reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await db.from("kyc_submissions").update({
        status,
        rejection_reason: rejection_reason ?? null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      if (status === "approved") {
        await db.from("profiles").update({ role: "seller" }).eq("id", userId);
      }
      await db.from("notifications").insert({
        user_id: userId,
        type: "system",
        title: status === "approved" ? "KYC Verified ✅" : "KYC Rejected",
        body: status === "approved"
          ? "Your identity has been verified. You can now withdraw earnings."
          : `KYC rejected: ${rejection_reason}`,
      });
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
      const { data, error } = await db.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [tracks, orders, users, kyc] = await Promise.all([
        db.from("tracks").select("status", { count: "exact" }),
        db.from("orders").select("amount, status", { count: "exact" }),
        db.from("profiles").select("role", { count: "exact" }),
        db.from("kyc_submissions").select("status", { count: "exact" }),
      ]);
      return {
        totalTracks: tracks.count ?? 0,
        pendingTracks: (tracks.data ?? []).filter((t: any) => t.status === "pending").length,
        totalOrders: orders.count ?? 0,
        totalRevenue: (orders.data ?? []).filter((o: any) => o.status === "paid").reduce((s: number, o: any) => s + o.amount, 0),
        totalUsers: users.count ?? 0,
        pendingKYC: (kyc.data ?? []).filter((k: any) => k.status === "pending").length,
      };
    },
  });
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query.trim()) return { tracks: [], profiles: [] };
      const [tracks, profiles] = await Promise.all([
        db.from("tracks").select("id, title, genre, price, artwork_url, bpm, musical_key, status").in("status", ["approved", "sold"]).or(`title.ilike.%${query}%,genre.ilike.%${query}%`).limit(6),
        db.from("profiles").select("id, display_name, avatar_url, role").ilike("display_name", `%${query}%`).limit(3),
      ]);
      return { tracks: tracks.data ?? [], profiles: profiles.data ?? [] };
    },
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}

// ─── STRIPE CHECKOUT ──────────────────────────────────────────────────────────

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (trackIds: string[]) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sign in to purchase");
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { trackIds },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      return data as { url: string };
    },
    onSuccess: ({ url }) => { window.location.href = url; },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateServiceCheckout() {
  return useMutation({
    mutationFn: async ({ serviceId, requirements }: { serviceId: string; requirements: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sign in to purchase");
      const { data, error } = await supabase.functions.invoke("create-service-checkout", {
        body: { serviceId, requirements },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      return data as { url: string };
    },
    onSuccess: ({ url }) => { window.location.href = url; },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── WITHDRAWALS ──────────────────────────────────────────────────────────────

export function useMyWithdrawals() {
  return useQuery({
    queryKey: ["my-withdrawals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await db.from("withdrawals").select("*").eq("seller_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRequestWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, payout_method, payout_destination }: { amount: number; payout_method: string; payout_destination: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await db.from("withdrawals").insert({ seller_id: user.id, amount, payout_method, payout_destination });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-withdrawals"] });
      toast.success("Withdrawal requested! Processing in 2–3 business days.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
