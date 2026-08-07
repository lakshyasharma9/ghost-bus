# GhostBus Master Admin Panel — Complete Feature Document
**Version:** 1.0  
**Platform:** GhostBus Audio — Ghost Music Production Marketplace  
**Scope:** Complete production-grade Admin Panel covering all modules, pages, workflows, security, and enterprise features.

---

## Overview

The GhostBus Master Admin Panel is the central control system of the platform. It gives administrators full operational visibility, moderation capabilities, revenue tracking, seller management, content control, and security oversight — all from a single unified interface.

The panel is a **separate standalone application** (new folder, independent from the main frontend) built with its own routing, auth, and layout system.

---

## Tech Stack

**Frontend**
- Next.js (App Router) + TypeScript
- Tailwind CSS + ShadCN UI
- Zustand (state management)
- Recharts (analytics charts)
- TanStack Query (data fetching)

**Backend**
- Node.js + Express (existing backend, new /api/v1/admin/* routes)
- Prisma ORM + PostgreSQL (Supabase)
- AWS S3 (file access via signed URLs)
- Stripe (refunds, payouts)

**Security**
- JWT authentication (separate admin tokens)
- Single MASTER_ADMIN role with full access
- Rate limiting on all admin endpoints
- Audit logging on every destructive action
- IP-based access logging

---

## Admin Role & Permissions

### Role — MASTER_ADMIN
One single role. Full access to everything on the platform.

- Moderate tracks (approve/reject)
- Manage users (suspend/restore/change role)
- Review KYC submissions
- Review seller applications
- View and manage orders
- Process refunds
- Resolve disputes
- View analytics
- Send notifications
- View audit logs
- Configure commission rates
- Manage seller tiers
- Manage feature flags
- Edit content blocks (hero, banners)
- Access platform settings
- Manage withdrawal requests
- Manage gigs

### Auth Rules
- All `/api/v1/admin/*` endpoints require valid JWT + MASTER_ADMIN role
- Any non-MASTER_ADMIN user hitting admin endpoints gets 403
- Frontend routes redirect non-admin users to home page
- Admin login is separate from regular user login

---

## Complete Page List (21 Total)

| # | Page | Route | Access |
|---|---|---|---|
| 1 | Login | /admin/login | Public |
| 2 | Dashboard | /admin | MASTER_ADMIN |
| 3 | Users | /admin/users | MASTER_ADMIN |
| 4 | Seller Applications | /admin/seller-applications | MASTER_ADMIN |
| 5 | Sellers | /admin/sellers | MASTER_ADMIN |
| 6 | Tracks | /admin/tracks | MASTER_ADMIN |
| 7 | Moderation Queue | /admin/moderation | MASTER_ADMIN |
| 8 | KYC Review | /admin/kyc | MASTER_ADMIN |
| 9 | Orders | /admin/orders | MASTER_ADMIN |
| 10 | Refunds | /admin/refunds | MASTER_ADMIN |
| 11 | Disputes | /admin/disputes | MASTER_ADMIN |
| 12 | Withdrawals | /admin/withdrawals | MASTER_ADMIN |
| 13 | Analytics | /admin/analytics | MASTER_ADMIN |
| 14 | Gigs | /admin/gigs | MASTER_ADMIN |
| 15 | Notifications | /admin/notifications | MASTER_ADMIN |
| 16 | Content Management | /admin/content | MASTER_ADMIN |
| 17 | Feature Flags | /admin/feature-flags | MASTER_ADMIN |
| 18 | Audit Logs | /admin/logs | MASTER_ADMIN |
| 19 | Settings | /admin/settings | MASTER_ADMIN |
| 20 | Seller Tiers | /admin/seller-tiers | MASTER_ADMIN |
| 21 | Global Search | /admin/search | MASTER_ADMIN |

---

## Sidebar Navigation Structure

```
GhostBus Admin
├── Dashboard
├── ── ── ── ──
├── Users
├── Seller Applications  [badge: pending count]
├── Sellers
├── ── ── ── ──
├── Tracks
├── Moderation Queue     [badge: pending count]
├── KYC Review           [badge: pending count]
├── ── ── ── ──
├── Orders
├── Refunds
├── Disputes
├── Withdrawals
├── ── ── ── ──
├── Analytics
├── Gigs
├── ── ── ── ──
├── Notifications
├── Content Management
├── Feature Flags
├── ── ── ── ──
├── Audit Logs
├── Global Search
├── ── ── ── ──
└── Settings
```

---

## Page 1 — Admin Login

**Purpose:** Secure entry point for admin panel. Separate from regular user login.

**Features:**
- Email + password login
- JWT token stored in httpOnly cookie (not localStorage)
- Failed login attempts logged
- Redirect to dashboard on success
- Redirect non-admin users back to login with error

**Security:**
- Rate limit: 5 attempts per 15 minutes per IP
- Brute force protection
- Login event recorded in audit log with IP address

---

## Page 2 — Dashboard (Overview)

**Purpose:** At-a-glance platform health and pending action summary.

**KPI Cards (8 total):**
- Total Registered Users
- Active Sellers (KYC approved)
- Total Platform Revenue (all time)
- Revenue This Month
- Tracks Pending Moderation
- Open Disputes
- Pending Refund Requests
- Pending Seller Applications

**Widgets:**
- Revenue graph (last 30 days — line chart)
- Top 5 selling tracks (table with play count + revenue)
- Latest 5 uploads (with status badges)
- Latest 5 orders (with buyer + amount)
- Pending actions list (moderation, KYC, applications)
- System alerts (payment failures, upload errors)
- Real-time notification bell (unread count)

**API:** `GET /api/v1/admin/stats`

---

## Page 3 — Users Management

**Purpose:** Full control over all registered platform users.

**Features:**
- Paginated user table (50 per page)
- Search by email, username, full name
- Filter by role (BUYER, SELLER), status (active, suspended), verification
- View user profile detail (purchases, wishlist, activity)
- Suspend user (with reason — stored in DB)
- Restore suspended user
- Change user role
- View user's order history
- View user's seller performance (if seller)

**Table Columns:**
- Avatar, Full Name, Email, Username, Role, Status, Verified, KYC Status, Joined Date, Actions

**User Detail Drawer/Modal:**
- Profile info
- Purchase history (orders list)
- Seller stats (if seller mode enabled)
- Audit log entries for this user
- Suspend / Restore button

**APIs:**
- `GET /api/v1/admin/users` (paginated, filterable)
- `GET /api/v1/admin/users/:id` (detail)
- `PATCH /api/v1/admin/users/:id/suspend`
- `PATCH /api/v1/admin/users/:id/restore`
- `PATCH /api/v1/admin/users/:id/role`
- `GET /api/v1/admin/users/:id/history`

---

## Page 4 — Seller Applications

**Purpose:** Review and approve/reject applications from users who want to become sellers on the platform. This is the gateway to seller access.

**Context:** When a user clicks "Apply as Seller" on the platform, they fill out an application form. That application lands here for admin review. Until approved, the user cannot access seller features.

**Application Form Fields (submitted by user):**
- Full legal name
- Artist/producer name
- Genre specialization
- Years of experience
- Portfolio links (SoundCloud, Spotify, etc.)
- Brief bio / why they want to sell on GhostBus
- Sample track link (optional)

**Admin Features:**
- View all applications (tabs: Pending, Approved, Rejected, All)
- Search by name or email
- View full application detail
- Approve application → user gets seller access, notification sent
- Reject application → reason required, notification sent
- Re-review rejected applications if user reapplies

**Table Columns:**
- Applicant Name, Email, Artist Name, Genre, Applied Date, Status, Actions

**Application Detail View:**
- All form fields displayed
- User's account info (join date, purchase history)
- Approve / Reject buttons with reason input

**Workflow:**
```
User submits Apply Seller form
→ Application saved with status: PENDING
→ Appears in admin Seller Applications queue
→ Admin reviews → Approve or Reject
→ If Approved: user.sellerApplicationStatus = 'approved', sellerModeEnabled = true
→ If Rejected: user.sellerApplicationStatus = 'rejected', reason stored
→ Notification sent to user in both cases
→ Audit log entry created
```

**APIs:**
- `GET /api/v1/admin/seller-applications`
- `GET /api/v1/admin/seller-applications/:id`
- `POST /api/v1/admin/seller-applications/:id/approve`
- `POST /api/v1/admin/seller-applications/:id/reject`

---

## Page 5 — Sellers Management

**Purpose:** Manage all approved sellers — their performance, tiers, commissions, KYC status, and Stripe Connect.

**Features:**
- Paginated seller table
- Filter by KYC status, tier, Stripe Connect status
- View seller profile + all their tracks
- View seller earnings breakdown
- Assign seller tier
- Override commission rate
- View Stripe Connect onboarding status
- Suspend seller account
- View seller's uploaded tracks

**Seller Tiers (configurable in Settings):**
- Tier 1 (New) → 36% platform commission
- Tier 2 (Established) → 30% platform commission
- Tier 3 (Premium) → 25% platform commission

**Table Columns:**
- Name, Email, KYC Status, Tier, Commission Rate, Stripe Status, Total Tracks, Total Earnings, Actions

**Seller Detail View:**
- Profile info + bio
- KYC status + document review link
- Tier + commission rate (editable by MASTER_ADMIN)
- Stripe Connect status + account ID
- Track list (with status breakdown)
- Earnings history (monthly chart)
- Withdrawal history

**APIs:**
- `GET /api/v1/admin/sellers`
- `GET /api/v1/admin/sellers/:id`
- `PATCH /api/v1/admin/sellers/:id/tier`
- `PATCH /api/v1/admin/sellers/:id/commission`
- `GET /api/v1/admin/sellers/:id/earnings`

---

## Page 6 — Tracks (Full Catalogue)

**Purpose:** View and manage all tracks on the platform across all statuses.

**Features:**
- Paginated track table
- Filter by status (PENDING, APPROVED, REJECTED), genre, seller, date range
- Search by title, seller name
- Sort by price, plays, date, status
- View track detail
- Quick approve/reject from table
- Bulk actions: bulk approve, bulk reject (with reason)
- Export track list as CSV

**Table Columns:**
- Cover, Title, Seller, Genre, BPM, Price, Status, Plays, Upload Date, Actions

**Track Detail View:**
- All metadata (title, genre, BPM, key, description, tags)
- Inline audio player (signed S3 URL, 15 min expiry)
- Cover image
- File info (sizes, types uploaded)
- Transparency declaration (original / loops)
- Seller info
- Order history for this track (if sold)
- Approve / Reject buttons

**APIs:**
- `GET /api/v1/admin/tracks` (paginated, filterable)
- `GET /api/v1/admin/tracks/:id`
- `POST /api/v1/admin/tracks/:id/approve`
- `POST /api/v1/admin/tracks/:id/reject`
- `POST /api/v1/admin/tracks/bulk-action`

---

## Page 7 — Moderation Queue

**Purpose:** The most critical module. Dedicated view for PENDING tracks only, optimized for fast review workflow.

**Features:**
- Shows only PENDING tracks
- Inline audio player with waveform visualization
- Full metadata display per track
- File validation results (WAV quality, artwork resolution, ZIP structure)
- Transparency declaration badge
- Approve button (one click)
- Reject button (opens reason modal — reason required)
- Suspend seller directly from this view
- Add moderation notes (internal, not shown to seller)
- Keyboard shortcuts (A = approve, R = reject, Space = play/pause)

**Track Card UI:**
- Cover image (large)
- Title + seller name
- Genre, BPM, Key, Price
- Transparency badge (Original / Contains Loops)
- Audio player with waveform
- File validation checklist (WAV ✓, Artwork ✓, Stems ✓, MIDI ✓)
- Approve / Reject / Suspend Seller buttons

**Workflow:**
```
Track uploaded by seller
→ Status: PENDING
→ Appears in Moderation Queue
→ Admin plays audio, reviews metadata
→ Approve → Status: APPROVED → Track goes live on marketplace
→ Reject → Reason required → Status: REJECTED → Seller notified
→ Suspend Seller → Seller account suspended → All their tracks hidden
```

**Security:**
- Audio URL is a signed S3 URL (15 min expiry)
- Original WAV never exposed — only watermarked preview played
- Signed URL generated fresh on each page load

**APIs:**
- `GET /api/v1/admin/tracks?status=PENDING`
- `GET /api/v1/admin/tracks/:id/preview-url` (signed S3 URL)
- `POST /api/v1/admin/tracks/review` (approve/reject)
- `POST /api/v1/admin/users/:id/suspend` (suspend seller from queue)

---

## Page 8 — KYC Review

**Purpose:** Review identity verification documents submitted by sellers.

**Features:**
- Filter tabs: Pending, Approved, Rejected, All
- View submitted documents (signed S3 URLs — 15 min expiry)
- Approve KYC → seller.kycStatus = APPROVED, sellerVerified = true
- Reject KYC → reason required → seller.kycStatus = REJECTED
- View submission date, document type
- Re-review if seller resubmits

**Submission Card UI:**
- Seller name + avatar
- Submission date
- Document type (ID, Passport, etc.)
- View Document button (opens signed URL in new tab)
- Status badge
- Approve / Reject buttons (if pending)
- Rejection reason display (if rejected)

**APIs:**
- `GET /api/v1/admin/kyc`
- `GET /api/v1/admin/kyc/:id/document` (signed S3 URL)
- `POST /api/v1/admin/kyc/review`

---

## Page 9 — Orders

**Purpose:** Full visibility into all platform transactions.

**Features:**
- Paginated orders table
- Filter by status (PENDING, COMPLETED, FAILED, REFUNDED), date range, buyer
- Search by order ID, buyer email
- View order detail (buyer info, tracks purchased, amount, Stripe payment intent)
- View invoice
- Initiate refund from order detail
- Payment failure logs
- Stripe webhook delivery status

**Table Columns:**
- Order ID, Buyer, Tracks (count), Total Amount, Status, Stripe ID, Date, Actions

**Order Detail View:**
- Buyer profile info
- List of tracks purchased (with seller info per track)
- Total amount + platform commission breakdown
- Stripe Payment Intent ID + status
- Webhook delivery log
- Refund button (if COMPLETED)
- Dispute info (if dispute exists)

**APIs:**
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/orders/:id`

---

## Page 10 — Refunds

**Purpose:** Manage buyer refund requests and process Stripe refunds.

**Refund Flow:**
```
Buyer requests refund (from their account)
→ Refund request created with status: REQUESTED
→ Appears in admin Refunds queue
→ Admin reviews → Approve or Reject
→ If Approved: Stripe Refunds API called → Order status = REFUNDED → Buyer notified
→ If Rejected: Reason stored → Buyer notified
→ Audit log entry created
```

**Features:**
- Filter by status (Requested, Approved, Rejected)
- View refund reason from buyer
- View associated order detail
- Approve → triggers Stripe refund automatically
- Reject → reason required
- Partial refund support
- Stripe refund status tracking

**Table Columns:**
- Refund ID, Order ID, Buyer, Amount, Reason, Status, Requested Date, Actions

**APIs:**
- `GET /api/v1/admin/refunds`
- `POST /api/v1/admin/refunds/:id/approve`
- `POST /api/v1/admin/refunds/:id/reject`

---

## Page 11 — Disputes

**Purpose:** Handle buyer-seller conflicts and record admin resolution decisions.

**Dispute Flow:**
```
Buyer opens dispute on an order
→ Dispute created with status: OPEN
→ Appears in admin Disputes queue
→ Admin reviews buyer claim
→ Admin resolves: BUYER_FAVOR or SELLER_FAVOR
→ If BUYER_FAVOR: refund processed
→ If SELLER_FAVOR: funds released to seller
→ Both parties notified
→ Audit log entry created
```

**Features:**
- Filter by status (Open, Resolved)
- View buyer's claim description
- View order detail + track info
- View seller's response (if submitted)
- Resolve with outcome (Buyer Favor / Seller Favor / Partial Settlement)
- Add resolution notes
- Trigger refund if buyer favor

**Table Columns:**
- Dispute ID, Order ID, Buyer, Seller, Claim Summary, Status, Opened Date, Actions

**APIs:**
- `GET /api/v1/admin/disputes`
- `GET /api/v1/admin/disputes/:id`
- `POST /api/v1/admin/disputes/:id/resolve`

---

## Page 12 — Withdrawals

**Purpose:** Manage seller payout withdrawal requests.

**Withdrawal Flow:**
```
Seller requests withdrawal from their dashboard
→ Withdrawal request created with status: PENDING
→ Appears in admin Withdrawals queue
→ MASTER_ADMIN reviews → Approve or Reject
→ If Approved: Stripe Transfer API called → seller's Stripe account credited
→ Withdrawal status = PROCESSED, processedAt timestamp saved
→ Seller notified
→ Audit log entry created
```

**Features:**
- Filter by status (Pending, Processed, Rejected)
- View seller's Stripe Connect account status
- View seller's available balance
- Approve withdrawal → triggers Stripe transfer
- Reject withdrawal → reason required
- Bulk approve withdrawals (MASTER_ADMIN)
- Export withdrawal history as CSV

**Table Columns:**
- Withdrawal ID, Seller, Amount, Stripe Account, Status, Requested Date, Processed Date, Actions

**APIs:**
- `GET /api/v1/admin/withdrawals`
- `POST /api/v1/admin/withdrawals/:id/approve`
- `POST /api/v1/admin/withdrawals/:id/reject`

---

## Page 13 — Analytics

**Purpose:** Data-driven insights into platform performance.

**Charts & Metrics:**

**Revenue Analytics:**
- Daily revenue (last 30 days) — line chart
- Monthly revenue (last 12 months) — bar chart
- Platform commission earned vs seller payouts — stacked bar
- Revenue by genre — pie chart
- Top 10 earning tracks — table

**User Analytics:**
- Daily new registrations (last 30 days) — line chart
- User growth (monthly) — area chart
- Buyer vs Seller ratio — donut chart
- User retention (returning buyers) — metric card

**Track Analytics:**
- Total plays (all time + this month)
- Top 10 most played tracks — table
- Plays by genre — bar chart
- Upload rate (tracks per week) — line chart
- Approval rate (approved vs rejected %) — metric card

**Conversion Funnel:**
- Total visitors → Registered users → Added to wishlist → Completed purchase
- Funnel chart with drop-off percentages

**Listening Analytics:**
- Average listening duration per track
- Completion rate (% of preview listened)
- Most paused tracks (indicates quality issues)

**Date Range Filter:** Last 7 days / 30 days / 90 days / Custom range

**Export:** Download any chart data as CSV

**APIs:**
- `GET /api/v1/admin/analytics/revenue`
- `GET /api/v1/admin/analytics/users`
- `GET /api/v1/admin/analytics/plays`
- `GET /api/v1/admin/analytics/funnel`
- `GET /api/v1/admin/analytics/tracks`

---

## Page 14 — Gigs

**Purpose:** Manage custom production service listings by sellers (gigs = custom work orders).

**Features:**
- View all gig listings
- Filter by status (Active, Paused, Pending Review), category
- Approve / reject gig listings
- View gig orders (buyer hired seller for custom work)
- Manage gig disputes
- Suspend a gig listing
- View gig completion rate per seller

**Table Columns:**
- Gig Title, Seller, Category, Price, Status, Orders Count, Rating, Created Date, Actions

**Gig Order Detail:**
- Buyer + seller info
- Gig description + deliverables
- Order status (In Progress, Delivered, Completed, Disputed)
- Delivery deadline
- Communication thread (read-only for admin)
- Dispute resolution if applicable

**APIs:**
- `GET /api/v1/admin/gigs`
- `GET /api/v1/admin/gigs/:id`
- `POST /api/v1/admin/gigs/:id/approve`
- `POST /api/v1/admin/gigs/:id/reject`
- `GET /api/v1/admin/gig-orders`
- `GET /api/v1/admin/gig-orders/:id`

---

## Page 15 — Notifications

**Purpose:** Send platform-wide or targeted notifications to users.

**Features:**
- Compose and send broadcast notification
- Target by role (All Users, Buyers only, Sellers only, Specific user)
- Notification types: Info, Success, Warning, Alert
- View notification history (who sent what, when, to how many)
- View delivery stats (sent count, read count)
- Schedule notifications (send at specific time)
- Delete/recall a notification (marks as deleted for unread users)

**Compose Form:**
- Title (required)
- Message body (required)
- Type (Info / Success / Warning / Alert)
- Target audience (All / Buyers / Sellers / Specific User ID)
- Schedule (Send Now / Schedule for later)

**History Table Columns:**
- Title, Type, Target, Recipients, Sent By, Sent At, Read Rate

**Notification Events (auto-triggered, not manual):**
- New sale → seller notified
- Track approved → seller notified
- Track rejected → seller notified with reason
- KYC approved/rejected → seller notified
- Seller application approved/rejected → user notified
- Refund processed → buyer notified
- Dispute resolved → both parties notified
- Withdrawal processed → seller notified

**APIs:**
- `POST /api/v1/admin/notifications/broadcast`
- `GET /api/v1/admin/notifications/history`

---

## Page 16 — Content Management

**Purpose:** Control what appears on the platform's public-facing pages without code deployments.

**Content Blocks:**
- Hero section (title, subtitle, background video/image URL, CTA button text)
- Homepage featured tracks section (title, subtitle)
- Homepage announcement banner (text, color, link, show/hide toggle)
- "How It Works" section content
- Footer links and text

**Each Content Block Has:**
- Key (unique identifier)
- Title
- Body text
- Image/video URL
- Is Active toggle (show/hide on frontend)
- Last updated timestamp + updated by admin name

**UI:**
- List of all content blocks
- Click to edit inline
- Toggle active/inactive
- Preview changes before saving

**APIs:**
- `GET /api/v1/admin/content`
- `PATCH /api/v1/admin/content/:id`

---

## Page 17 — Feature Flags

**Purpose:** Enable or disable platform features at runtime without code deployments.

**Feature Flags List:**
- `enable_gigs` — Show/hide Gigs section on platform
- `enable_hero_video` — Show video or image in hero section
- `enable_seller_applications` — Open/close seller applications
- `enable_stripe_payments` — Enable/disable checkout
- `enable_withdrawals` — Allow/block seller withdrawal requests
- `maintenance_mode` — Put platform in maintenance mode (shows maintenance page to users)
- `enable_reviews` — Show/hide review system
- `enable_wishlist` — Show/hide wishlist feature

**Each Flag Has:**
- Name
- Description (what it controls)
- Enabled toggle (on/off)
- Last updated timestamp + updated by

**UI:**
- List of all flags with toggle switches
- Confirmation dialog before toggling critical flags (maintenance_mode, enable_stripe_payments)

**APIs:**
- `GET /api/v1/admin/feature-flags`
- `PATCH /api/v1/admin/feature-flags/:id`

---

## Page 18 — Audit Logs

**Purpose:** Complete history of every admin action taken on the platform.

**Every Log Entry Contains:**
- Admin ID + name
- Admin IP address
- Action type (e.g. USER_SUSPENDED, TRACK_APPROVED, REFUND_PROCESSED)
- Target entity type (User, Track, Order, etc.)
- Target entity ID
- Before state (JSON snapshot)
- After state (JSON snapshot)
- Timestamp

**Actions That Are Logged (examples):**
- User suspended / restored
- User role changed
- Track approved / rejected
- KYC approved / rejected
- Seller application approved / rejected
- Order refunded
- Dispute resolved
- Withdrawal approved / rejected
- Feature flag toggled
- Content block updated
- Commission rate changed
- Seller tier assigned
- Broadcast notification sent
- Admin login

**UI Features:**
- Paginated table (newest first)
- Filter by: date range, action type, admin user, target entity type
- Click row to see full before/after JSON diff
- Export logs as CSV (date range)

**APIs:**
- `GET /api/v1/admin/audit-logs`

---

## Page 19 — Settings

**Purpose:** Platform-wide configuration.

**Settings Sections:**

**Platform Settings:**
- Platform name
- Default commission rate (%)
- Maintenance mode toggle
- Max track file size (MB)
- Minimum track price ($)
- Maximum track price ($)

**Seller Tier Management:**
- View all tiers (name, commission rate, min sales required)
- Create new tier
- Edit existing tier
- Delete tier (only if no sellers assigned)

**Admin Account Management:**
- View all admin accounts
- Create new admin account
- Deactivate admin account
- Manage admin accounts

**APIs:**
- `GET /api/v1/admin/settings`
- `PATCH /api/v1/admin/settings`
- `GET /api/v1/admin/seller-tiers`
- `POST /api/v1/admin/seller-tiers`
- `PATCH /api/v1/admin/seller-tiers/:id`
- `DELETE /api/v1/admin/seller-tiers/:id`

---

## Page 20 — Seller Tiers

**Purpose:** Dedicated page for managing seller tier system and commission structure.

**Tier Configuration:**
- Tier name (e.g. New, Established, Premium)
- Commission rate (platform's cut %)
- Minimum sales count to qualify
- Description / perks
- Color/badge for display

**Default Tiers:**
- Tier 1 — New Seller → 36% platform commission
- Tier 2 — Established → 30% platform commission
- Tier 3 — Premium → 25% platform commission

**Features:**
- Create / edit / delete tiers
- View how many sellers are in each tier
- Auto-upgrade sellers based on sales count (configurable)
- Manual tier override per seller

---

## Page 21 — Global Search

**Purpose:** Search across all entities from one place.

**Search Scope:**
- Users (by name, email, username)
- Tracks (by title, genre, seller)
- Orders (by order ID, buyer email)
- Sellers (by name, email)
- KYC submissions
- Disputes
- Refunds

**UI:**
- Single search input at top of admin panel (always visible in header)
- Results grouped by entity type
- Click result → navigate to that entity's detail page
- Keyboard shortcut: Cmd/Ctrl + K to open search

**API:**
- `GET /api/v1/admin/search?q=query`

---

## Database Models Required

### New Models to Add to Prisma Schema

**AuditLog**
```
id, adminId (FK User), adminIp, actionType, targetEntity,
targetEntityId, beforeState (JSON), afterState (JSON), createdAt
```

**Dispute**
```
id, orderId (FK Order, unique), buyerId (FK User), sellerId (FK User),
claimDescription, resolution, outcome (BUYER_FAVOR / SELLER_FAVOR),
status (OPEN / RESOLVED), createdAt, resolvedAt
```

**FeatureFlag**
```
id, name (unique), description, enabled (default: false),
updatedBy (FK User), updatedAt
```

**ContentBlock**
```
id, key (unique), title, body, imageUrl, isActive (default: true),
updatedBy (FK User), createdAt, updatedAt
```

**SellerTier**
```
id, name (unique), commissionRate (Decimal), minSalesCount (Int),
description, createdAt
```

**SellerApplication**
```
id, userId (FK User, unique), artistName, genreSpecialization,
yearsExperience, portfolioLinks (JSON), bio, sampleTrackUrl,
status (PENDING / APPROVED / REJECTED), rejectionReason,
submittedAt, reviewedAt, reviewedBy (FK User)
```

### Modifications to Existing Models

**User model — add fields:**
```
suspendedAt (DateTime, nullable)
suspensionReason (String, nullable)
sellerTierId (FK SellerTier, nullable)
commissionRateOverride (Decimal, nullable)
```

**UserRole enum — add:**
```
MASTER_ADMIN
```

**Withdrawal model — already exists, no changes needed**

---

## Security Requirements

**Authentication:**
- All `/api/v1/admin/*` endpoints: JWT required + MASTER_ADMIN role
- Admin JWT stored in httpOnly cookie (not localStorage)
- Access token: 15 minutes
- Refresh token: 7 days
- Separate admin token secret from user token secret

**Rate Limiting:**
- Admin login: 5 attempts per 15 min per IP
- All admin endpoints: 60 requests per 15 min per IP
- Signed URL generation: 30 requests per 15 min per admin

**File Security:**
- All S3 file access via signed URLs only (never direct S3 URLs)
- Audio preview URLs: 15 min expiry
- KYC document URLs: 15 min expiry
- Signed URLs generated fresh on each request
- Original WAV files never exposed — only watermarked preview for moderation

**Audit Trail:**
- Every destructive action logged with before/after state
- Admin IP address logged on every action
- Admin login events logged
- Failed login attempts logged

---

## Complete Backend API List

```
# Auth
POST   /api/v1/admin/auth/login
POST   /api/v1/admin/auth/logout
POST   /api/v1/admin/auth/refresh

# Dashboard
GET    /api/v1/admin/stats

# Users
GET    /api/v1/admin/users
GET    /api/v1/admin/users/:id
PATCH  /api/v1/admin/users/:id/suspend
PATCH  /api/v1/admin/users/:id/restore
PATCH  /api/v1/admin/users/:id/role          [MASTER_ADMIN]
GET    /api/v1/admin/users/:id/history

# Seller Applications
GET    /api/v1/admin/seller-applications
GET    /api/v1/admin/seller-applications/:id
POST   /api/v1/admin/seller-applications/:id/approve
POST   /api/v1/admin/seller-applications/:id/reject

# Sellers
GET    /api/v1/admin/sellers
GET    /api/v1/admin/sellers/:id
PATCH  /api/v1/admin/sellers/:id/tier        [MASTER_ADMIN]
PATCH  /api/v1/admin/sellers/:id/commission  [MASTER_ADMIN]
GET    /api/v1/admin/sellers/:id/earnings

# Tracks
GET    /api/v1/admin/tracks
GET    /api/v1/admin/tracks/:id
GET    /api/v1/admin/tracks/:id/preview-url
POST   /api/v1/admin/tracks/review
POST   /api/v1/admin/tracks/bulk-action

# KYC
GET    /api/v1/admin/kyc
GET    /api/v1/admin/kyc/:id/document
POST   /api/v1/admin/kyc/review

# Orders
GET    /api/v1/admin/orders
GET    /api/v1/admin/orders/:id

# Refunds
GET    /api/v1/admin/refunds
POST   /api/v1/admin/refunds/:id/approve
POST   /api/v1/admin/refunds/:id/reject

# Disputes
GET    /api/v1/admin/disputes
GET    /api/v1/admin/disputes/:id
POST   /api/v1/admin/disputes/:id/resolve

# Withdrawals
GET    /api/v1/admin/withdrawals
POST   /api/v1/admin/withdrawals/:id/approve
POST   /api/v1/admin/withdrawals/:id/reject

# Analytics
GET    /api/v1/admin/analytics/revenue
GET    /api/v1/admin/analytics/users
GET    /api/v1/admin/analytics/plays
GET    /api/v1/admin/analytics/funnel
GET    /api/v1/admin/analytics/tracks

# Gigs
GET    /api/v1/admin/gigs
GET    /api/v1/admin/gigs/:id
POST   /api/v1/admin/gigs/:id/approve
POST   /api/v1/admin/gigs/:id/reject
GET    /api/v1/admin/gig-orders
GET    /api/v1/admin/gig-orders/:id

# Notifications
POST   /api/v1/admin/notifications/broadcast
GET    /api/v1/admin/notifications/history

# Content
GET    /api/v1/admin/content
PATCH  /api/v1/admin/content/:id

# Feature Flags
GET    /api/v1/admin/feature-flags
PATCH  /api/v1/admin/feature-flags/:id

# Audit Logs
GET    /api/v1/admin/audit-logs

# Settings
GET    /api/v1/admin/settings
PATCH  /api/v1/admin/settings
GET    /api/v1/admin/seller-tiers
POST   /api/v1/admin/seller-tiers
PATCH  /api/v1/admin/seller-tiers/:id
DELETE /api/v1/admin/seller-tiers/:id

# Search
GET    /api/v1/admin/search
```

---

## UI Design Principles

- Clean, minimal design — white/light background, blue primary accents
- Consistent card-based layout with rounded corners
- Data tables with sorting, filtering, pagination on every list page
- Status badges with color coding (amber = pending, green = approved, red = rejected)
- Confirmation dialogs for all destructive actions
- Toast notifications for all action results
- Loading skeletons (not spinners) for data fetching
- Responsive sidebar (collapsible on smaller screens)
- Breadcrumb navigation on all pages
- Empty states with helpful messages and action buttons
- Keyboard shortcuts for power users (moderation queue)

---

## Summary — Total Feature Count

| Category | Count |
|---|---|
| Pages | 21 |
| Backend API Endpoints | 52 |
| New Database Models | 6 |
| Modified Database Models | 2 |
| Admin Roles | 1 (MASTER_ADMIN) |
| Auto-triggered Notification Events | 9 |
| Feature Flags | 8 |
| Audit Log Action Types | 15+ |

---

*Document prepared for GhostBus Audio — Master Admin Panel v1.0*
