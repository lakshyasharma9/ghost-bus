# 🚀 GhostBus - Complete Setup Guide

## ✅ What's Fixed

1. **Removed Supabase Auth** - Now using custom Express JWT authentication
2. **Updated Frontend** - Using AuthContext with Express backend API
3. **Fixed Navbar** - Properly displays logged-in user
4. **Updated .env files** - Backend API URL configured

---

## 📦 Installation

### Backend Setup

```bash
cd Backend
npm install
npx prisma generate
npx prisma db push
```

### Frontend Setup

```bash
cd Frontend
npm install
```

---

## 🏃 Running the Application

### Step 1: Start Backend (Terminal 1)

```bash
cd Backend
npm run dev
```

Backend will run on: **http://localhost:3000**

### Step 2: Start Frontend (Terminal 2)

```bash
cd Frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 🔐 Authentication Flow

### Signup
1. User fills signup form
2. POST `/api/v1/auth/signup` with `{ email, password, fullName }`
3. Backend creates user with hashed password
4. Returns `accessToken` and `refreshToken`
5. Frontend stores tokens in localStorage
6. AuthContext fetches user profile
7. Navbar displays user info

### Login
1. User fills login form
2. POST `/api/v1/auth/login` with `{ email, password }`
3. Backend validates credentials
4. Returns `accessToken` and `refreshToken`
5. Frontend stores tokens in localStorage
6. AuthContext fetches user profile
7. Redirects to home page

### Auto-Login
1. On page load, AuthContext checks for `accessToken`
2. If found, calls GET `/api/v1/auth/profile`
3. Backend validates token and returns user data
4. User is automatically logged in

### Token Refresh
1. When API returns 401, axios interceptor triggers
2. Calls POST `/api/v1/auth/refresh` with `refreshToken`
3. Gets new `accessToken`
4. Retries original request

---

## 🗄️ Database Schema

Using **Prisma ORM** with **PostgreSQL** (Supabase)

### Main Tables:
- `users` - User accounts (BUYER, SELLER, ADMIN)
- `tracks` - Music tracks
- `orders` - Purchases
- `order_items` - Order details
- `messages` - Direct messaging
- `notifications` - Real-time alerts
- `wishlists` - Saved tracks
- `reviews` - User reviews
- `kyc_submissions` - Identity verification
- `withdrawals` - Payout requests

---

## 🔑 Environment Variables

### Backend (.env.local)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:GhostBus2026!@db.xhbmotmdpspuwawzcpic.supabase.co:5432/postgres"
JWT_SECRET=ghostbus-super-secret-jwt-key-2026-production
JWT_REFRESH_SECRET=ghostbus-super-secret-refresh-key-2026-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:3000/api/v1"
```

---

## 🧪 Testing

### Test Signup
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Profile (with token)
```bash
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📁 Key Files Changed

### Backend
- ✅ `server.js` - Express server with CORS
- ✅ `controllers/auth.controller.js` - Auth logic
- ✅ `routes/auth.routes.js` - Auth endpoints
- ✅ `middleware/auth.middleware.js` - JWT verification
- ✅ `utils/jwt.js` - Token generation
- ✅ `.env.local` - Environment config

### Frontend
- ✅ `.env` - Backend API URL
- ✅ `routes/login.tsx` - Using authAPI
- ✅ `components/layout/Navbar.tsx` - Using AuthContext
- ✅ `contexts/AuthContext.tsx` - Custom auth state
- ✅ `lib/api-client.ts` - Axios with interceptors

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
cd Backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npm run dev
```

### Frontend not connecting?
1. Check Backend is running on port 3000
2. Check `.env` has correct `VITE_API_URL`
3. Restart frontend: `npm run dev`

### Login not working?
1. Open DevTools Console
2. Check Network tab for API calls
3. Verify tokens in localStorage
4. Check Backend logs for errors

### User not showing in Navbar?
1. Check localStorage has `accessToken`
2. Open DevTools Console
3. Check AuthContext is fetching profile
4. Verify `/api/v1/auth/profile` returns user data

---

## ✅ Success Checklist

- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:5173
- [ ] Can signup new user
- [ ] Can login existing user
- [ ] User shows in Navbar after login
- [ ] Can logout
- [ ] Tokens stored in localStorage
- [ ] API calls include Authorization header

---

## 🎉 You're Ready!

Open http://localhost:5173 and test:
1. Click "Sign up" → Create account
2. After signup, you'll be redirected to home
3. Check Navbar - your name/email should appear
4. Click profile dropdown - see account options
5. Click "Sign out" - you'll be logged out

---

**Built with ❤️ using Express + React + Prisma + PostgreSQL**
