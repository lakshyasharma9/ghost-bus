# 🎵 GhostBus - Premium Ghost Production Marketplace

**Full-stack marketplace for exclusive ghost-produced music tracks with complete rights transfer.**

---

## 📁 Project Structure

```
ghostbus-sound-forge-main/
├── Frontend/          # Client-side React application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
│
├── Backend/           # Server-side code & database
│   └── supabase/      # Supabase backend
│       ├── functions/ # Edge Functions (Stripe)
│       └── migrations/# Database schema
│
└── README.md          # This file
```

---

## 🚀 Quick Start

### Frontend (Client Demo)

```bash
cd Frontend
npm install
npm run dev
```

Open: http://localhost:5173

### Backend (Database & API)

Backend is already deployed on Supabase.
See `/Backend/README.md` for setup instructions.

---

## 🌐 Live Demo

**Frontend:** https://ghost-bus.netlify.app
**Backend:** Supabase (https://fdlwzepngnqbifhaucmn.supabase.co)

---

## 🎯 What's Built

### ✅ Frontend Features
- Music marketplace with filters
- Audio player with waveform preview
- Shopping cart & checkout
- User authentication (login/signup)
- Seller dashboard (upload, earnings, analytics)
- Admin panel (track review, KYC, users)
- Real-time notifications
- Messaging system

### ✅ Backend Features
- PostgreSQL database (14 tables)
- Row-Level Security (RLS)
- Supabase Auth
- Supabase Storage (audio files)
- Supabase Realtime (notifications)
- Edge Functions (Stripe integration)
- Database migrations

---

## 🔧 Tech Stack

### Frontend
- React 19
- TanStack Router
- TanStack Query
- Tailwind CSS v4
- Framer Motion
- Zustand

### Backend
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Edge Functions (Deno)
- Stripe API

---

## 📦 Deployment

### Frontend Deployment (Netlify)

1. **Connect GitHub:**
   - Go to https://netlify.com
   - Import `ghost-bus` repository
   - Base directory: `Frontend`

2. **Configure Build:**
   ```
   Build command: npm run build
   Publish directory: dist/client
   ```

3. **Environment Variables:**
   ```
   VITE_SUPABASE_URL=https://fdlwzepngnqbifhaucmn.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_key
   ```

4. **Deploy!**

### Backend Deployment (Supabase)

Backend is already deployed. To update:

```bash
cd Backend
supabase link --project-ref fdlwzepngnqbifhaucmn
supabase db push
supabase functions deploy
```

---

## 🎨 Features Overview

### For Buyers
- Browse exclusive tracks
- Preview with waveform
- Add to cart
- Secure checkout (Stripe)
- Instant download
- Full rights transfer

### For Sellers
- Upload tracks (5-step wizard)
- Track management
- Earnings dashboard
- Analytics & insights
- KYC verification
- Withdraw earnings
- Messaging with buyers

### For Admins
- Track review (A&R queue)
- KYC verification
- User management
- Platform analytics
- Audit logs

---

## 🔐 Security

- Row-Level Security (RLS) on all tables
- Supabase Auth with JWT
- Stripe Checkout (PCI compliant)
- KYC verification for payouts
- Webhook signature verification
- Environment variables for secrets

---

## 📊 Database Schema

14 tables:
- `profiles` - User accounts
- `tracks` - Music tracks
- `orders` - Purchases
- `messages` - Direct messaging
- `notifications` - Real-time alerts
- `kyc_submissions` - Identity verification
- `services` - Gig marketplace
- `reviews` - User reviews
- `withdrawals` - Payout requests
- `admin_actions` - Audit log
- `wishlists` - Saved tracks
- `seller_stats` - Analytics view

---

## 🎯 Client Demo Instructions

### Show Client the Frontend:

1. **Live URL:**
   ```
   https://ghost-bus.netlify.app
   ```

2. **Features to Demo:**
   - Homepage with video background
   - Track marketplace with filters
   - Audio player (click any track)
   - Shopping cart
   - Login/Signup
   - Seller dashboard (after signup)
   - Admin panel (admin account)

3. **Test Credentials:**
   - Create new account via signup
   - Or use existing Supabase users

---

## 📝 Documentation

- **Frontend Setup:** `/Frontend/README.md`
- **Backend Setup:** `/Backend/README.md`
- **Deployment Guide:** `/DEPLOYMENT_GUIDE.md`
- **API Documentation:** See Supabase dashboard

---

## 💰 Pricing

### Netlify (Frontend)
- **Free Tier:** 100GB bandwidth/month
- **Paid:** $19/month (Pro features)

### Supabase (Backend)
- **Free Tier:** 500MB database, 1GB storage
- **Pro:** $25/month (8GB database, 100GB storage)

---

## 🐛 Troubleshooting

### Frontend Issues
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend Issues
```bash
cd Backend
supabase db reset
supabase db push
```

### Environment Variables
- Frontend: Must start with `VITE_`
- Backend: Set via `supabase secrets set`

---

## 📞 Support

- **Frontend Issues:** Check `/Frontend/README.md`
- **Backend Issues:** Check `/Backend/README.md`
- **Deployment Issues:** Check `/DEPLOYMENT_GUIDE.md`

---

## ✅ Project Status

- ✅ Frontend: Complete & deployed
- ✅ Backend: Complete & deployed
- ✅ Database: Fully configured
- ✅ Authentication: Working
- ✅ Payments: Stripe integrated
- ✅ Real-time: Notifications working
- ✅ File uploads: Supabase Storage
- ✅ Admin panel: Functional

---

## 🎉 Ready for Client Demo!

**Live URL:** https://ghost-bus.netlify.app

**All features working:**
- ✅ Browse tracks
- ✅ Audio preview
- ✅ User authentication
- ✅ Shopping cart
- ✅ Seller dashboard
- ✅ Admin panel
- ✅ Real-time notifications

---

**Built with ❤️ using React + Supabase + Stripe**
