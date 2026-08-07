# Requirements Document

## Introduction

The GhostBus Master Admin Panel is a comprehensive back-office interface for the platform's Master Admin to manage users, sellers, tracks, orders, refunds, disputes, content, analytics, notifications, audit logs, and platform settings. The panel is integrated into the existing React + TypeScript frontend at `/admin/*` routes and backed by new Express routes at `/api/v1/admin/*`. It introduces five new database models (AuditLog, Dispute, FeatureFlag, ContentBlock, SellerTier) and a single MASTER_ADMIN role, while reusing the existing JWT authentication, Prisma/PostgreSQL stack, shadcn/ui component library, and AWS S3 infrastructure.

---

## Glossary

- **Admin Panel**: The set of frontend pages and backend routes accessible only to users with the MASTER_ADMIN role, located at `/admin/*` and `/api/v1/admin/*` respectively.
- **Master Admin**: A user whose `role` field equals `MASTER_ADMIN` in the `users` table. The Master Admin has full access to all platform features, settings, and management functions.
- **AuditLog**: A database record capturing every destructive or sensitive admin action, including the acting admin's ID, IP address, action type, target entity, and before/after state snapshots.
- **Dispute**: A database record representing a buyer-initiated challenge against an order, containing the buyer's claim, the seller's response, and the admin's resolution decision.
- **FeatureFlag**: A database record representing a named boolean or string toggle that enables or disables platform features at runtime, editable only by Super Admins.
- **ContentBlock**: A database record representing a configurable piece of platform content such as a hero banner, promotional text, or featured section.
- **SellerTier**: A database record defining a named seller classification (e.g., Bronze, Silver, Gold) with associated commission rate and eligibility criteria.
- **KYC Submission**: A record in the `kyc_submissions` table representing a seller's identity verification document upload.
- **Moderation Queue**: The set of tracks with `status = PENDING` awaiting admin review.
- **Signed URL**: A time-limited, pre-authenticated AWS S3 URL granting temporary read access to a private file.
- **Rate Limit**: A per-IP request throttle applied to admin API endpoints to prevent abuse.
- **Stripe Connect**: The Stripe feature enabling sellers to receive payouts to their own Stripe accounts.
- **Commission Rate**: The platform's percentage cut taken from each sale, configurable per SellerTier or globally.
- **Broadcast Notification**: A notification sent by an admin to all users or a filtered subset of users simultaneously.

---

## Requirements

### Requirement 1: Authentication and Authorization

**User Story:** As a platform administrator, I want all admin routes to be protected by role-based access control, so that only authorized personnel can access sensitive management functions.

#### Acceptance Criteria

1. WHEN a request is made to any `/api/v1/admin/*` endpoint, THE Admin API SHALL verify a valid JWT Bearer token using the existing `authenticate` middleware before processing the request.
2. WHEN a request is made to any `/api/v1/admin/*` endpoint with a valid token, THE Admin API SHALL verify the authenticated user's `role` is `MASTER_ADMIN` using the existing `authorize` middleware before processing the request.
3. IF a request to any `/api/v1/admin/*` endpoint lacks a valid JWT token, THEN THE Admin API SHALL return HTTP 401 with an error message.
4. IF a request to any `/api/v1/admin/*` endpoint carries a valid token for a user whose `role` is `BUYER` or `SELLER`, THEN THE Admin API SHALL return HTTP 403 with an error message.
5. WHEN a user navigates to any `/admin/*` frontend route, THE Admin Panel SHALL verify the authenticated user's role is `MASTER_ADMIN` and redirect users with insufficient roles to the home page.

---

### Requirement 2: Rate Limiting on Admin Endpoints

**User Story:** As a platform operator, I want admin API endpoints to be rate-limited, so that brute-force and abuse attempts are mitigated.

#### Acceptance Criteria

1. WHILE the Admin API is running, THE Admin API SHALL apply a rate limit of 60 requests per 15-minute window per IP address to all `/api/v1/admin/*` endpoints.
2. IF a client exceeds the rate limit on any `/api/v1/admin/*` endpoint, THEN THE Admin API SHALL return HTTP 429 with a message indicating the limit has been exceeded and the time until the window resets.

---

### Requirement 3: Audit Logging

**User Story:** As a Super Admin, I want every destructive or sensitive admin action to be recorded in an audit log, so that I can review the history of changes made to the platform.

#### Acceptance Criteria

1. THE Audit Log System SHALL record an `AuditLog` entry for every admin action that creates, updates, or deletes a resource, capturing: acting admin user ID, admin IP address, action type (string), target entity type, target entity ID, before-state snapshot (JSON), after-state snapshot (JSON), and timestamp.
2. WHEN an admin action completes successfully, THE Audit Log System SHALL persist the corresponding `AuditLog` entry to the database before returning the response to the client.
3. IF persisting an `AuditLog` entry fails, THEN THE Audit Log System SHALL log the failure to the server error log and SHALL NOT roll back the original admin action.
4. WHEN an admin requests the audit log list via `GET /api/v1/admin/audit-logs`, THE Admin API SHALL return a paginated list of `AuditLog` records ordered by timestamp descending, supporting filters for `adminId`, `actionType`, `targetEntity`, `startDate`, and `endDate`.
5. THE Admin Panel Audit Logs page SHALL display audit log entries in a table showing timestamp, admin username, action type, target entity, and target entity ID, with support for filtering by date range and action type.

---

### Requirement 4: Dashboard KPI Overview

**User Story:** As an admin, I want a dashboard showing key platform metrics at a glance, so that I can monitor the health and activity of the platform.

#### Acceptance Criteria

1. WHEN an admin loads the Admin Dashboard page, THE Admin Panel SHALL fetch and display the following KPIs from `GET /api/v1/admin/stats`: total registered users, total sellers with approved KYC, total platform revenue (sum of completed order amounts), count of tracks in the Moderation Queue, and count of open disputes.
2. WHEN `GET /api/v1/admin/stats` is called, THE Admin API SHALL compute and return all five KPI values from the PostgreSQL database within 2000ms.
3. THE Admin Panel Dashboard SHALL display each KPI in a distinct card component using the existing shadcn/ui Card component.

---

### Requirement 5: User Management

**User Story:** As an admin, I want to list, search, suspend, restore, and view the history of platform users, so that I can manage user accounts and enforce platform policies.

#### Acceptance Criteria

1. WHEN an admin requests `GET /api/v1/admin/users`, THE Admin API SHALL return a paginated list of users including `id`, `email`, `fullName`, `username`, `role`, `isVerified`, `kycStatus`, `createdAt`, and account suspension status, supporting query parameters `search` (matches email or username), `role`, and `page`.
2. WHEN an admin submits `PATCH /api/v1/admin/users/:id/suspend` with a `reason` field, THE Admin API SHALL set the target user's account to suspended status, persist the reason, and record an `AuditLog` entry for the action.
3. WHEN an admin submits `PATCH /api/v1/admin/users/:id/restore`, THE Admin API SHALL remove the target user's suspended status and record an `AuditLog` entry for the action.
4. IF an admin attempts to suspend or restore a user with `role = MASTER_ADMIN`, THEN THE Admin API SHALL return HTTP 403 with an error message.
5. WHEN the Master Admin submits `PATCH /api/v1/admin/users/:id/role` with a `role` field, THE Admin API SHALL update the target user's `role` to the specified value, record an `AuditLog` entry capturing the before and after role values, and return the updated user.
6. WHEN an admin requests `GET /api/v1/admin/users/:id/history`, THE Admin API SHALL return all `AuditLog` entries where `targetEntity = 'User'` and `targetEntityId = :id`, ordered by timestamp descending.
7. THE Admin Panel Users page SHALL display users in a searchable, filterable table with actions to suspend, restore, and (for Super Admins) change role, using existing shadcn/ui Table and Dialog components.

---

### Requirement 6: Seller Management

**User Story:** As an admin, I want to review KYC submissions, assign seller tiers, configure commission rates, and view Stripe Connect status for sellers, so that I can onboard and manage sellers effectively.

#### Acceptance Criteria

1. WHEN an admin requests `GET /api/v1/admin/kyc`, THE Admin API SHALL return a paginated list of `KYCSubmission` records with status `PENDING`, including the associated user's `id`, `email`, `fullName`, and `username`.
2. WHEN an admin submits `POST /api/v1/admin/kyc/review` with `submissionId`, `decision` (`APPROVED` or `REJECTED`), and optional `rejectionReason`, THE Admin API SHALL update the `KYCSubmission` status, update the associated user's `kycStatus` and `sellerVerified` fields accordingly, record an `AuditLog` entry, and return the updated submission.
3. WHEN an admin requests `GET /api/v1/admin/kyc/:submissionId/document`, THE Admin API SHALL return a signed S3 URL for the KYC document file, valid for 15 minutes.
4. WHEN the Master Admin submits `PATCH /api/v1/admin/sellers/:userId/tier` with a `tierId`, THE Admin API SHALL assign the specified `SellerTier` to the seller, record an `AuditLog` entry, and return the updated seller record.
5. WHEN the Master Admin submits `PATCH /api/v1/admin/sellers/:userId/commission` with a `commissionRate` (decimal between 0 and 1), THE Admin API SHALL update the seller's individual commission rate override, record an `AuditLog` entry, and return the updated seller record.
6. WHEN the Master Admin requests `GET /api/v1/admin/sellers`, THE Admin API SHALL return a paginated list of sellers including `userId`, `email`, `fullName`, `kycStatus`, `sellerTier`, `commissionRate`, `stripeAccountId`, and Stripe Connect onboarding status.
7. THE Admin Panel Sellers page SHALL display sellers in a table with columns for name, KYC status, tier, commission rate, and Stripe Connect status, with actions to review KYC, assign tier, and configure commission.

---

### Requirement 7: Track Management

**User Story:** As an admin, I want to view and filter all tracks on the platform, so that I can monitor the track catalogue and take action on individual tracks.

#### Acceptance Criteria

1. WHEN an admin requests `GET /api/v1/admin/tracks`, THE Admin API SHALL return a paginated list of all tracks including `id`, `title`, `genre`, `bpm`, `price`, `status`, `sellerId`, seller username, `playsCount`, and `createdAt`, supporting query parameters `status`, `genre`, `sellerId`, and `page`.
2. THE Admin Panel Tracks page SHALL display tracks in a filterable table with columns for title, seller, genre, BPM, price, status, plays, and upload date, using existing shadcn/ui Table and Select components.

---

### Requirement 8: Moderation Queue

**User Story:** As an admin, I want to review pending tracks with an inline audio player and approve or reject them with a reason, so that only quality content is published on the platform.

#### Acceptance Criteria

1. WHEN an admin requests `GET /api/v1/admin/tracks?status=PENDING`, THE Admin API SHALL return all tracks with `status = PENDING` including a signed S3 URL for the audio file, valid for 15 minutes.
2. WHEN an admin submits `POST /api/v1/admin/tracks/review` with `trackId`, `decision` (`APPROVED` or `REJECTED`), and optional `rejectionReason`, THE Admin API SHALL update the track's `status` and `rejectionReason` fields, record an `AuditLog` entry, and return the updated track.
3. IF an admin submits a review decision of `REJECTED` without a `rejectionReason`, THEN THE Admin API SHALL return HTTP 400 with a validation error message.
4. THE Admin Panel Moderation Queue page SHALL display each pending track with an inline HTML5 audio player loaded from the signed S3 URL, and SHALL provide Approve and Reject buttons with a rejection reason input field using existing shadcn/ui components.
5. WHEN an admin approves or rejects a track in the Moderation Queue, THE Admin Panel SHALL optimistically remove the track from the queue display and show a success toast notification.

---

### Requirement 9: Order Management

**User Story:** As an admin, I want to list and filter all platform orders and view order details, so that I can monitor transaction activity and support buyers and sellers.

#### Acceptance Criteria

1. WHEN an admin requests `GET /api/v1/admin/orders`, THE Admin API SHALL return a paginated list of orders including `id`, `buyerId`, buyer email, `totalAmount`, `status`, `stripePaymentIntentId`, `createdAt`, and the list of order items with track titles, supporting query parameters `status`, `buyerId`, `startDate`, `endDate`, and `page`.
2. WHEN an admin requests `GET /api/v1/admin/orders/:id`, THE Admin API SHALL return the full order detail including all order items, buyer profile, and associated dispute if one exists.
3. THE Admin Panel Orders page SHALL display orders in a filterable table with columns for order ID, buyer, total amount, status, and date, with a detail view accessible per row.

---

### Requirement 10: Refund Management

**User Story:** As an admin, I want to review refund requests, approve or reject them, and trigger Stripe refunds for approved requests, so that buyer disputes are resolved fairly and promptly.

#### Acceptance Criteria

1. WHEN an admin requests `GET /api/v1/admin/refunds`, THE Admin API SHALL return a paginated list of refund requests including `id`, `orderId`, `buyerId`, buyer email, `amount`, `reason`, `status`, and `createdAt`, supporting query parameters `status` and `page`.
2. WHEN an admin submits `POST /api/v1/admin/refunds/:id/approve`, THE Admin API SHALL call the Stripe Refunds API with the associated `stripePaymentIntentId` and `amount`, update the refund request status to `APPROVED`, update the associated order status to `REFUNDED`, record an `AuditLog` entry, and return the updated refund record.
3. IF the Stripe Refunds API call fails during refund approval, THEN THE Admin API SHALL return HTTP 502 with the Stripe error message and SHALL NOT update the refund or order status.
4. WHEN an admin submits `POST /api/v1/admin/refunds/:id/reject` with a `reason`, THE Admin API SHALL update the refund request status to `REJECTED`, record an `AuditLog` entry, and return the updated refund record.
5. THE Admin Panel Refunds page SHALL display refund requests in a table with columns for order ID, buyer, amount, reason, status, and date, with Approve and Reject action buttons per row.

---

### Requirement 11: Dispute Management

**User Story:** As an admin, I want to view buyer disputes and record resolution decisions, so that conflicts between buyers and sellers are handled transparently.

#### Acceptance Criteria

1. WHEN an admin requests `GET /api/v1/admin/disputes`, THE Admin API SHALL return a paginated list of `Dispute` records including `id`, `orderId`, `buyerId`, buyer email, `sellerId`, seller email, `claimDescription`, `status`, and `createdAt`, supporting query parameters `status` and `page`.
2. WHEN an admin submits `POST /api/v1/admin/disputes/:id/resolve` with `resolution` (string) and `outcome` (`BUYER_FAVOR` or `SELLER_FAVOR`), THE Admin API SHALL update the `Dispute` status to `RESOLVED`, persist the resolution text and outcome, record an `AuditLog` entry, and return the updated dispute.
3. THE Admin Panel Disputes page SHALL display disputes in a table with columns for dispute ID, order ID, buyer, seller, status, and date, with a resolution form accessible per row using existing shadcn/ui Dialog and Textarea components.

---

### Requirement 12: Analytics

**User Story:** As an admin, I want to view revenue charts, user growth trends, track play counts, and conversion funnel metrics, so that I can make data-driven decisions about the platform.

#### Acceptance Criteria

1. WHEN an admin requests `GET /api/v1/admin/analytics/revenue` with query parameters `startDate` and `endDate`, THE Admin API SHALL return daily revenue totals (sum of completed order amounts grouped by date) for the specified date range.
2. WHEN an admin requests `GET /api/v1/admin/analytics/users` with query parameters `startDate` and `endDate`, THE Admin API SHALL return daily new user registration counts grouped by date for the specified date range.
3. WHEN an admin requests `GET /api/v1/admin/analytics/plays` with query parameters `startDate` and `endDate`, THE Admin API SHALL return the total track play count and the top 10 most-played tracks by play count for the specified date range.
4. WHEN an admin requests `GET /api/v1/admin/analytics/funnel`, THE Admin API SHALL return the counts for each conversion funnel stage: total registered users, users who have added at least one item to a wishlist, users who have completed at least one order.
5. THE Admin Panel Analytics page SHALL render revenue and user growth data as line charts and SHALL display the conversion funnel as a step chart, using a charting library already present in the frontend project.

---

### Requirement 13: Content Management

**User Story:** As a Super Admin, I want to configure hero banners, promotional content blocks, and feature flags, so that I can control the platform's public-facing content and feature availability without code deployments.

#### Acceptance Criteria

1. WHEN a Super Admin requests `GET /api/v1/admin/content`, THE Admin API SHALL return all `ContentBlock` records including `id`, `key`, `title`, `body`, `imageUrl`, `isActive`, and `updatedAt`.
2. WHEN a Super Admin submits `PATCH /api/v1/admin/content/:id` with updated fields, THE Admin API SHALL update the specified `ContentBlock`, record an `AuditLog` entry, and return the updated record.
3. WHEN a Super Admin requests `GET /api/v1/admin/feature-flags`, THE Admin API SHALL return all `FeatureFlag` records including `id`, `name`, `description`, `enabled`, and `updatedAt`.
4. WHEN a Super Admin submits `PATCH /api/v1/admin/feature-flags/:id` with an `enabled` boolean value, THE Admin API SHALL update the specified `FeatureFlag`'s `enabled` field, record an `AuditLog` entry, and return the updated record.
5. THE Admin Panel Content Management page SHALL display content blocks in an editable list and feature flags as a list of labeled toggles, accessible to the Master Admin, using existing shadcn/ui Switch and Input components.

---

### Requirement 14: Notifications

**User Story:** As an admin, I want to send broadcast notifications to all users or a filtered subset and view notification history, so that I can communicate platform updates and announcements effectively.

#### Acceptance Criteria

1. WHEN an admin submits `POST /api/v1/admin/notifications/broadcast` with `title`, `message`, `type`, and optional `targetRole` filter, THE Admin API SHALL create a `Notification` record for each matching user, record an `AuditLog` entry with the count of recipients, and return the count of notifications created.
2. WHEN an admin requests `GET /api/v1/admin/notifications/history`, THE Admin API SHALL return a paginated list of past broadcast events including `id`, `title`, `message`, `type`, `targetRole`, `recipientCount`, `sentByAdminId`, and `createdAt`, ordered by `createdAt` descending.
3. THE Admin Panel Notifications page SHALL provide a form to compose and send a broadcast notification with fields for title, message, type, and optional role filter, and SHALL display a history table of past broadcasts below the form.

---

### Requirement 15: Audit Logs Page

**User Story:** As a Super Admin, I want to browse the full audit log with filtering capabilities, so that I can investigate any admin action taken on the platform.

#### Acceptance Criteria

1. THE Admin Panel Audit Logs page SHALL fetch audit log data from `GET /api/v1/admin/audit-logs` and display entries in a table with columns for timestamp, admin username, action type, target entity type, and target entity ID.
2. THE Admin Panel Audit Logs page SHALL provide filter controls for date range (start and end date pickers) and action type (dropdown), and SHALL re-fetch data when filters change.
3. WHEN an admin clicks an audit log row, THE Admin Panel SHALL display a detail view showing the full before-state and after-state JSON snapshots using a formatted code block.

---

### Requirement 16: Platform Settings

**User Story:** As a Super Admin, I want to configure platform-wide settings including global commission rates and admin account management, so that I can control the platform's operational parameters.

#### Acceptance Criteria

1. WHEN a Super Admin requests `GET /api/v1/admin/settings`, THE Admin API SHALL return the current platform settings including `defaultCommissionRate`, `platformName`, `maintenanceMode` (boolean), and `maxTrackFileSizeMb`.
2. WHEN a Super Admin submits `PATCH /api/v1/admin/settings` with one or more setting fields, THE Admin API SHALL update the specified settings, record an `AuditLog` entry capturing the before and after values, and return the full updated settings object.
3. WHEN a Super Admin requests `GET /api/v1/admin/seller-tiers`, THE Admin API SHALL return all `SellerTier` records including `id`, `name`, `commissionRate`, `minSalesCount`, and `description`.
4. WHEN a Super Admin submits `POST /api/v1/admin/seller-tiers` with `name`, `commissionRate`, `minSalesCount`, and `description`, THE Admin API SHALL create a new `SellerTier` record, record an `AuditLog` entry, and return the created record.
5. WHEN a Super Admin submits `PATCH /api/v1/admin/seller-tiers/:id` with updated fields, THE Admin API SHALL update the specified `SellerTier`, record an `AuditLog` entry, and return the updated record.
6. THE Admin Panel Settings page SHALL display and allow editing of platform settings and seller tier definitions, accessible only to Super Admin users, using existing shadcn/ui Form and Input components.

---

### Requirement 17: New Database Models

**User Story:** As a backend developer, I want the five new Prisma models and the SUPER_ADMIN role to be defined in the schema, so that the admin panel features have the required data persistence layer.

#### Acceptance Criteria

1. THE Prisma Schema SHALL define an `AuditLog` model with fields: `id` (UUID), `adminId` (FK to User), `adminIp` (String), `actionType` (String), `targetEntity` (String), `targetEntityId` (String), `beforeState` (Json, nullable), `afterState` (Json, nullable), `createdAt` (DateTime).
2. THE Prisma Schema SHALL define a `Dispute` model with fields: `id` (UUID), `orderId` (FK to Order, unique), `buyerId` (FK to User), `sellerId` (FK to User), `claimDescription` (String), `resolution` (String, nullable), `outcome` (enum: `BUYER_FAVOR`, `SELLER_FAVOR`, nullable), `status` (enum: `OPEN`, `RESOLVED`), `createdAt` (DateTime), `resolvedAt` (DateTime, nullable).
3. THE Prisma Schema SHALL define a `FeatureFlag` model with fields: `id` (UUID), `name` (String, unique), `description` (String, nullable), `enabled` (Boolean, default false), `updatedAt` (DateTime).
4. THE Prisma Schema SHALL define a `ContentBlock` model with fields: `id` (UUID), `key` (String, unique), `title` (String), `body` (String, nullable), `imageUrl` (String, nullable), `isActive` (Boolean, default true), `createdAt` (DateTime), `updatedAt` (DateTime).
5. THE Prisma Schema SHALL define a `SellerTier` model with fields: `id` (UUID), `name` (String, unique), `commissionRate` (Decimal), `minSalesCount` (Int), `description` (String, nullable).
6. THE Prisma Schema SHALL add `SUPER_ADMIN` to the `UserRole` enum.
7. THE Prisma Schema SHALL add a `suspendedAt` (DateTime, nullable) and `suspensionReason` (String, nullable) field to the `User` model to support account suspension.
