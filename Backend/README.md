# 🔧 GhostBus Backend

## Backend Architecture

This folder contains all backend-related code:
- Supabase database migrations
- Edge Functions (Stripe integration)
- Database schema
- API configurations

---

## 📁 Structure

```
Backend/
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── create-checkout/
│   │   ├── create-service-checkout/
│   │   └── stripe-webhook/
│   ├── migrations/         # Database migrations
│   │   ├── ghostbus_full_schema.sql
│   │   └── seed_mock_tracks.sql
│   └── config.toml         # Supabase config
```

---

## 🚀 Setup Instructions

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link Project
```bash
cd Backend
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Run Migrations
```bash
supabase db push
```

### 5. Deploy Edge Functions
```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy create-service-checkout
```

### 6. Set Secrets
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🔐 Environment Variables

Required for Edge Functions:
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

---

## 📊 Database Schema

The database includes:
- **profiles** - User accounts
- **tracks** - Music tracks
- **orders** - Purchase records
- **messages** - Direct messaging
- **notifications** - Real-time notifications
- **kyc_submissions** - Identity verification
- **services** - Gig marketplace
- **reviews** - User reviews
- **withdrawals** - Payout requests

---

## 🔄 Deployment

Backend is already deployed on Supabase:
- Database: https://fdlwzepngnqbifhaucmn.supabase.co
- Edge Functions: Auto-deployed via Supabase CLI

---

## 📝 Notes

- Backend is separate from Frontend
- Frontend connects via Supabase client
- All API calls go through Supabase
- Edge Functions handle Stripe payments
