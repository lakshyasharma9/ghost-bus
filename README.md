# GhostBus — Premium Ghost Production Marketplace

**Full-stack marketplace for exclusive ghost-produced music tracks with complete rights transfer.**

---

## 🎯 What Was Built

### ✅ Complete Frontend (React + TanStack Router + Tailwind)

#### **Public Pages**
- **Home** — Hero video background, genre filters, hot picks, recently sold, top labels, CTA sections
- **Tracks Marketplace** — Grid/list views, advanced filters (genre, BPM, price), smart search
- **Track Detail** — Waveform preview, full metadata, file inclusions, similar tracks
- **Services** — Gig marketplace for custom production, mixing, mastering, etc.
- **Sell** — Landing page for producers to become sellers
- **Login/Signup** — Supabase Auth integration

#### **Seller Dashboard** (8 Sub-Routes)
- **Overview** — Stats cards, earnings chart, top genres, recent sales
- **Upload** — 5-step pipeline (metadata → files → transparency → pricing → verification)
  - Real Supabase Storage upload for WAV, stems, MIDI, artwork
  - Transparency declaration (100% original vs. royalty-free loops)
  - Dynamic pricing with earnings breakdown
- **My Tracks** — Track management table with status badges (Live/Pending/Sold), edit/delete actions
- **Earnings** — Payout summary, transaction history, withdrawal requests (KYC-gated)
- **Messages** — Real-time inbox with thread list and message view
- **Analytics** — KPI cards, weekly plays chart, conversion funnel, traffic sources, top tracks
- **KYC** — 3-step identity verification (ID → address → payout details)
- **Settings** — Profile editor, notification toggles, password change, danger zone

#### **Admin Panel** (6 Sub-Routes)
- **Overview** — Platform stats, pending actions, quick links
- **Track Review** — A&R queue with approve/reject actions, rejection reason modal
- **KYC Review** — Document preview, approve/reject with seller role upgrade
- **Users** — User management table with role assignment (buyer/seller/admin)
- **Orders** — (Placeholder for order management)
- **Analytics** — (Placeholder for platform-wide analytics)

#### **Components**
- **SmartSearch** — Debounced search with instant results for tracks and producers
- **NotificationBell** — Real-time dropdown with unread count, mark-as-read
- **GlobalAudioPlayer** — Bottom-fixed player with waveform, queue, volume, cart integration
- **CartDrawer** — Slide-out cart with Stripe checkout integration
- **TrackCard** — Hover play, wishlist, add-to-cart, sold badge
- **Navbar** — Sticky with glass effect, genre/services dropdowns, profile menu

---

### ✅ Complete Backend (Supabase)

#### **Database Schema** (14 Tables)
- **profiles** — User accounts with roles (buyer/seller/admin)
- **tracks** — Track listings with metadata, file URLs, status (pending/approved/rejected/sold)
- **orders** — Purchase records with Stripe session IDs, download tokens
- **messages** — Direct messages between buyers and sellers
- **message_threads** — Denormalized thread metadata for performance
- **notifications** — Real-time notifications (sale/message/review/withdrawal/system)
- **kyc_submissions** — Identity verification documents and status
- **services** — Gig listings (custom production, mixing, etc.)
- **service_orders** — Service purchase records
- **reviews** — Buyer reviews for sellers
- **withdrawals** — Seller payout requests
- **admin_actions** — Audit log for admin actions
- **wishlists** — User-track wishlist relationships
- **seller_stats** — Materialized view for seller analytics

#### **Row-Level Security (RLS)**
- All tables have granular RLS policies
- Users can only see/edit their own data
- Admins have elevated permissions
- Public data (approved tracks, reviews) visible to all

#### **Realtime Subscriptions**
- Notifications (instant toast on new notification)
- Messages (live message updates)
- Tracks (live status changes)
- Orders (live order updates)

#### **Storage Buckets**
- **tracks** — Mastered WAV, unmastered WAV, stems ZIP, MIDI ZIP, artwork
- Secure file upload with user-scoped paths
- Public URLs for approved tracks

#### **Edge Functions** (Deno + Stripe)
- **create-checkout** — Creates Stripe Checkout session for track purchases
- **stripe-webhook** — Handles payment confirmation, marks orders paid, marks tracks sold, sends notifications
- **create-service-checkout** — Creates Stripe Checkout session for service orders

---

### ✅ API Layer (React Query Hooks)

**Comprehensive hooks in `src/hooks/use-api.ts`:**
- `useTracks`, `useTrack`, `useMyTracks`, `useUploadTrack`, `useUpdateTrack`, `useDeleteTrack`
- `useMyOrders`, `useSellerOrders`, `useSellerStats`
- `useThreads`, `useMessages`, `useSendMessage`, `useOrCreateThread`
- `useNotifications`, `useMarkNotificationRead`, `useMarkAllNotificationsRead`
- `useMyKYC`, `useSubmitKYC`
- `useServices`, `useMyServices`, `useCreateService`
- `useWishlistDB`, `useToggleWishlistDB`
- `useProfile`, `useUpdateProfile`
- `useAdminTracks`, `useAdminReviewTrack`, `useAdminKYC`, `useAdminReviewKYC`, `useAdminUsers`, `useAdminStats`
- `useSearch` (debounced search)
- `useCreateCheckout`, `useCreateServiceCheckout` (Stripe)
- `useMyWithdrawals`, `useRequestWithdrawal`

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account

### 1. Clone & Install
```bash
cd Frontend
npm install
```

### 2. Supabase Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy create-service-checkout

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Environment Variables
Create `.env`:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

### 4. Stripe Webhook
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
3. Select events: `checkout.session.completed`, `checkout.session.expired`
4. Copy webhook secret to Supabase secrets

### 5. Storage Buckets
```sql
-- Create storage bucket
insert into storage.buckets (id, name, public) values ('tracks', 'tracks', true);

-- Set RLS policies
create policy "Users can upload own files" on storage.objects
  for insert with check (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public can view approved tracks" on storage.objects
  for select using (bucket_id = 'tracks');
```

### 6. Run Dev Server
```bash
npm run dev
```

---

## 🎨 Tech Stack

### Frontend
- **React 19** — UI library
- **TanStack Router** — File-based routing with SSR
- **TanStack Query** — Server state management
- **Zustand** — Client state (audio player, cart, wishlist)
- **Tailwind CSS v4** — Styling with custom design system
- **Framer Motion** — Animations
- **Radix UI** — Accessible components
- **Lucide React** — Icons
- **Sonner** — Toast notifications

### Backend
- **Supabase** — PostgreSQL database, Auth, Storage, Realtime, Edge Functions
- **Stripe** — Payment processing
- **Deno** — Edge Function runtime

---

## 📊 Key Features

### For Buyers
- Browse 1000s of exclusive tracks
- Smart search with instant results
- Waveform preview before purchase
- One-click Stripe checkout
- Instant download with full rights transfer
- Wishlist & cart
- Real-time notifications

### For Sellers
- 5-step upload wizard
- Supabase Storage integration
- A&R review queue
- Real-time earnings dashboard
- Instant payout on sale (15% platform fee)
- KYC verification for withdrawals
- Messaging with buyers
- Analytics & insights

### For Admins
- Track review queue (approve/reject)
- KYC review with document preview
- User management with role assignment
- Platform-wide analytics
- Audit log for all actions

---

## 🔐 Security

- **Row-Level Security (RLS)** on all tables
- **Supabase Auth** with JWT tokens
- **Stripe Checkout** for PCI compliance
- **KYC verification** for seller payouts
- **File encryption** in Supabase Storage
- **Webhook signature verification** for Stripe events
- **Admin-only routes** with role checks

---

## 📈 Scalability

- **Supabase** handles 100K+ concurrent users
- **Edge Functions** auto-scale globally
- **Realtime** uses WebSockets for instant updates
- **CDN** for static assets and track files
- **Database indexes** on all foreign keys and filters
- **Materialized views** for complex analytics

---

## 🎯 Next Steps

### Phase 2 (Optional Enhancements)
- [ ] Watermarking system (FFmpeg in Edge Function)
- [ ] Email system (Resend/SendGrid integration)
- [ ] Advanced analytics (Mixpanel/PostHog)
- [ ] Social features (follow producers, activity feed)
- [ ] Referral program
- [ ] Subscription tiers (Pro sellers)
- [ ] Mobile app (React Native)

---

## 📝 License

Proprietary — All rights reserved.

---

## 🙏 Credits

Built with ❤️ using modern web technologies.
