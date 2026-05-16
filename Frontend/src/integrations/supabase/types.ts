export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; avatar_url: string | null; role: string; bio: string | null; website: string | null; instagram: string | null; soundcloud: string | null; created_at: string; updated_at: string };
        Insert: { id: string; display_name?: string | null; avatar_url?: string | null; role?: string; bio?: string | null; website?: string | null; instagram?: string | null; soundcloud?: string | null };
        Update: { display_name?: string | null; avatar_url?: string | null; role?: string; bio?: string | null; website?: string | null; instagram?: string | null; soundcloud?: string | null };
        Relationships: [];
      };
      tracks: {
        Row: { id: string; seller_id: string; title: string; genre: string; bpm: number; musical_key: string; duration: string | null; description: string | null; price: number; transparency: "original" | "loops"; status: "pending" | "approved" | "rejected" | "sold"; artwork_url: string | null; mastered_url: string | null; unmastered_url: string | null; stems_url: string | null; midi_url: string | null; watermarked_url: string | null; tags: string[]; plays: number; views: number; rejection_reason: string | null; created_at: string; updated_at: string };
        Insert: { seller_id: string; title: string; genre: string; bpm: number; musical_key: string; duration?: string | null; description?: string | null; price: number; transparency: "original" | "loops"; artwork_url?: string | null; tags?: string[] };
        Update: { title?: string; genre?: string; bpm?: number; musical_key?: string; description?: string | null; price?: number; status?: "pending" | "approved" | "rejected" | "sold"; rejection_reason?: string | null };
        Relationships: [{ foreignKeyName: "tracks_seller_id_fkey"; columns: ["seller_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      orders: {
        Row: { id: string; track_id: string; buyer_id: string; seller_id: string; amount: number; platform_fee: number; seller_payout: number; stripe_payment_intent: string | null; stripe_session_id: string | null; status: "pending" | "paid" | "refunded" | "disputed"; download_token: string | null; download_expires_at: string | null; created_at: string };
        Insert: { track_id: string; buyer_id: string; seller_id: string; amount: number; platform_fee: number; seller_payout: number; stripe_session_id?: string | null };
        Update: { status?: "pending" | "paid" | "refunded" | "disputed"; stripe_payment_intent?: string | null };
        Relationships: [];
      };
      messages: {
        Row: { id: string; thread_id: string; sender_id: string; recipient_id: string; body: string; read: boolean; created_at: string };
        Insert: { thread_id: string; sender_id: string; recipient_id: string; body: string };
        Update: { read?: boolean };
        Relationships: [];
      };
      message_threads: {
        Row: { id: string; participant_a: string; participant_b: string; last_message: string | null; last_message_at: string | null; unread_a: number; unread_b: number; created_at: string };
        Insert: { participant_a: string; participant_b: string };
        Update: { last_message?: string | null; last_message_at?: string | null; unread_a?: number; unread_b?: number };
        Relationships: [];
      };
      notifications: {
        Row: { id: string; user_id: string; type: "sale" | "message" | "review_approved" | "review_rejected" | "withdrawal" | "system"; title: string; body: string; read: boolean; metadata: Json; created_at: string };
        Insert: { user_id: string; type: "sale" | "message" | "review_approved" | "review_rejected" | "withdrawal" | "system"; title: string; body: string; metadata?: Json };
        Update: { read?: boolean };
        Relationships: [];
      };
      kyc_submissions: {
        Row: { id: string; user_id: string; id_document_url: string | null; address_document_url: string | null; payout_email: string | null; payout_method: "paypal" | "bank" | "stripe"; status: "pending" | "approved" | "rejected"; rejection_reason: string | null; reviewed_by: string | null; reviewed_at: string | null; submitted_at: string };
        Insert: { user_id: string; id_document_url?: string | null; address_document_url?: string | null; payout_email?: string | null; payout_method?: "paypal" | "bank" | "stripe" };
        Update: { id_document_url?: string | null; address_document_url?: string | null; payout_email?: string | null; status?: "pending" | "approved" | "rejected"; rejection_reason?: string | null };
        Relationships: [];
      };
      services: {
        Row: { id: string; seller_id: string; title: string; description: string; category: string; price: number; delivery_days: number; revisions: number; includes: string[]; status: "active" | "paused" | "deleted"; rating_avg: number; rating_count: number; orders_count: number; created_at: string };
        Insert: { seller_id: string; title: string; description: string; category: string; price: number; delivery_days: number; revisions?: number; includes?: string[] };
        Update: { title?: string; description?: string; price?: number; delivery_days?: number; status?: "active" | "paused" | "deleted" };
        Relationships: [];
      };
      service_orders: {
        Row: { id: string; service_id: string; buyer_id: string; seller_id: string; requirements: string | null; amount: number; status: "pending" | "in_progress" | "delivered" | "revision" | "completed" | "cancelled" | "disputed"; delivery_due_at: string | null; stripe_session_id: string | null; created_at: string; updated_at: string };
        Insert: { service_id: string; buyer_id: string; seller_id: string; requirements?: string | null; amount: number };
        Update: { status?: "pending" | "in_progress" | "delivered" | "revision" | "completed" | "cancelled" | "disputed" };
        Relationships: [];
      };
      reviews: {
        Row: { id: string; reviewer_id: string; seller_id: string; track_id: string | null; service_id: string | null; order_id: string | null; rating: number; body: string | null; created_at: string };
        Insert: { reviewer_id: string; seller_id: string; track_id?: string | null; service_id?: string | null; order_id?: string | null; rating: number; body?: string | null };
        Update: { body?: string | null };
        Relationships: [];
      };
      withdrawals: {
        Row: { id: string; seller_id: string; amount: number; status: "pending" | "processing" | "paid" | "failed"; payout_method: string; payout_destination: string; processed_at: string | null; created_at: string };
        Insert: { seller_id: string; amount: number; payout_method: string; payout_destination: string };
        Update: { status?: "pending" | "processing" | "paid" | "failed"; processed_at?: string | null };
        Relationships: [];
      };
      admin_actions: {
        Row: { id: string; admin_id: string; action_type: string; target_type: string; target_id: string; notes: string | null; created_at: string };
        Insert: { admin_id: string; action_type: string; target_type: string; target_id: string; notes?: string | null };
        Update: never;
        Relationships: [];
      };
      wishlists: {
        Row: { user_id: string; track_id: string; created_at: string };
        Insert: { user_id: string; track_id: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      seller_stats: {
        Row: { seller_id: string; display_name: string | null; active_tracks: number; sold_tracks: number; pending_tracks: number; total_earned: number; earned_this_month: number };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Update"];

export const Constants = { public: { Enums: {} } } as const;
