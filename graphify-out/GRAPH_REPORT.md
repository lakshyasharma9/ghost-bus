# Graph Report - ghostbus-sound-forge-main  (2026-05-19)

## Corpus Check
- 87 files · ~45,762 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1077 nodes · 1307 edges · 54 communities (46 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ad60a012`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 23 edges
2. `successResponse()` - 19 edges
3. `compilerOptions` - 17 edges
4. `useAuthContext()` - 17 edges
5. `🎵 GhostBus - Premium Ghost Production Marketplace` - 17 edges
6. `useAudio` - 13 edges
7. `useCart` - 13 edges
8. `🚀 DEPLOYMENT SOLUTION - NETLIFY (BEST FOR TANSTACK START)` - 13 edges
9. `🏠 GhostBus - Local Development Setup` - 12 edges
10. `🚀 GhostBus - Complete Setup Guide` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Favorites()` --calls--> `useWishlist`  [EXTRACTED]
  Frontend/src/routes/account.favorites.tsx → Frontend/src/store/index.ts
- `cn()` --calls--> `clsx`  [INFERRED]
  Frontend/src/lib/utils.ts → Frontend/package.json
- `ProtectedRoute()` --calls--> `useAuthContext()`  [EXTRACTED]
  Frontend/src/components/auth/ProtectedRoute.tsx → Frontend/src/contexts/AuthContext.tsx
- `CartDrawer()` --calls--> `useCart`  [EXTRACTED]
  Frontend/src/components/cart/CartDrawer.tsx → Frontend/src/store/index.ts
- `Navbar()` --calls--> `useCart`  [EXTRACTED]
  Frontend/src/components/layout/Navbar.tsx → Frontend/src/store/index.ts

## Communities (54 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.27
Nodes (11): GlobalAudioPlayer(), Props, Waveform(), Track, Route, TrackDetail(), useAudio, useCart (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (60): dependencies, axios, class-variance-authority, @cloudflare/vite-plugin, cmdk, date-fns, embla-carousel-react, framer-motion (+52 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (28): ProtectedRoute(), ProtectedRouteProps, SellerModeToggle(), AuthContext, AuthContextType, AuthProvider(), useAuthContext(), UserProfile (+20 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (33): useAdminKYC(), useAdminReviewKYC(), useAdminReviewTrack(), useAdminStats(), useAdminTracks(), useDeleteTrack(), useMyKYC(), useMyTracks() (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (45): 1. **Removed Supabase Auth Completely**, 1. Start Both Servers, 2. **Backend (Express + Node.js)**, 2. Open Browser, 3. **Frontend (React + TanStack)**, 3. Test Signup, 4. **Database**, 4. Test Login (+37 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (46): Admin, Admin, 📝 Backend Endpoints Needed, code:block1 (✅ Frontend/src/integrations/supabase/ (DELETED)), code:block10 (GET    /api/v1/sellers/stats), code:block11 (GET    /api/v1/services), code:block12 (GET    /api/v1/kyc/my-kyc), code:block13 (GET    /api/v1/admin/tracks) (+38 more)

### Community 6 - "Community 6"
Cohesion: 0.04
Nodes (45): **1. Frontend Development:**, **2. Database Changes:**, **3. Testing Authentication:**, **4. Viewing Database:**, 🗄️ AWS S3 Setup (For File Uploads), **Before deploying:**, code:bash (cd Backend), code:bash (# Go to Supabase Dashboard) (+37 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (56): app, limiter, prisma, getProfile(), login(), logout(), refreshToken(), signup() (+48 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (42): Backend, Backend (Database & API), Backend Deployment (Supabase), ✅ Backend Features, Backend Issues, 🎯 Client Demo Instructions, code:block1 (ghostbus-sound-forge-main/), code:bash (cd Frontend) (+34 more)

### Community 9 - "Community 9"
Cohesion: 0.05
Nodes (42): 🔐 Authentication Flow, Auto-Login, Backend, Backend (.env.local), Backend not starting?, Backend Setup, code:bash (cd Backend), code:bash (cd Backend) (+34 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (41): 1. **Replaced use-api.ts**, 1. Search, 2. **Disabled use-auth.tsx**, 2. Notifications, 3. File Upload, 3. **Made Supabase Client Optional**, 4. **Disabled Components**, 🎉 All Done! (+33 more)

### Community 11 - "Community 11"
Cohesion: 0.05
Nodes (40): 1. Rename files back, 2. Replace Supabase calls with Express API, 3. Test and deploy!, Active Routes (No Supabase), code:block1 (✅ use-api.ts → use-api.old.ts (replaced with clean version)), code:block10 (Frontend/src/), code:bash (cd Frontend/src/routes), code:typescript (// Old) (+32 more)

### Community 12 - "Community 12"
Cohesion: 0.05
Nodes (40): 1. CartDrawer.tsx, 2. services.tsx, 3. account.profile.tsx, After, ✅ All Working Routes, Before, 📊 Before vs After, code:block1 (❌ Frontend/src/integrations/supabase/ (DELETED)) (+32 more)

### Community 13 - "Community 13"
Cohesion: 0.06
Nodes (30): Advantages:, ✅ BEST SOLUTION: NETLIFY, code:block1 (Base directory: Frontend), code:block2 (VITE_SUPABASE_URL), code:block3 (https://[random-name].netlify.app), code:block4 (✅ 100GB bandwidth/month), code:block5 (https://netlify.com), code:block6 (Base directory: Frontend) (+22 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (29): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bcryptjs, compression, cors, dotenv, express (+21 more)

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (27): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+19 more)

### Community 16 - "Community 16"
Cohesion: 0.07
Nodes (26): 🎯 CLIENT DEMO - LOCAL SETUP (WORKING SOLUTION), code:bash (cd Frontend), code:block2 (http://localhost:5173), code:block3 (https://pages.cloudflare.com), code:block4 (VITE_SUPABASE_URL=https://fdlwzepngnqbifhaucmn.supabase.co), code:bash (cd e:\ghostbus-sound-forge-main\Frontend), code:block6 (http://localhost:5173), code:bash (cd Frontend) (+18 more)

### Community 17 - "Community 17"
Cohesion: 0.07
Nodes (24): 🎉 All Done!, Buyer Mode (sellerModeEnabled = false), 🔑 Code Highlights, code:block1 (┌─────────────────────────┐), code:block2 (Seller Mode ON:), Conditional Rendering, Desktop Dropdown, ✅ Dynamic Navbar Menu Fixed! (+16 more)

### Community 18 - "Community 18"
Cohesion: 0.08
Nodes (25): 📝 ALTERNATIVE: FIX RENDER (Advanced), code:bash (cd Frontend), code:block2 (Framework Preset: Other), code:block3 (VITE_SUPABASE_URL), code:block4 (https://ghost-bus-[random].vercel.app), code:block5 (✅ Unlimited deployments), code:block6 (✅ Everything in Free), code:json ("scripts": {) (+17 more)

### Community 19 - "Community 19"
Cohesion: 0.08
Nodes (23): 🎉 All Done!, 🔑 API Endpoints, Backend (Modified), Backend (New), code:bash (cd Backend), code:bash (cd Frontend), code:http (POST /api/v1/users/toggle-seller-mode), code:json ({) (+15 more)

### Community 20 - "Community 20"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (16): 🚀 5-Minute Deployment Guide, Build Fails?, code:bash (cd Frontend), code:block2 (VITE_SUPABASE_URL = https://fdlwzepngnqbifhaucmn.supabase.co), code:bash (# Clear cache and redeploy), ✅ DONE!, 🐛 If Something Goes Wrong, ⚠️ Important Notes (+8 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (16): code:block1 (Missing Supabase environment variable(s): SUPABASE_URL, SUPA), code:bash (cd Backend), code:bash (cd Frontend), ✅ Current Status, 📝 Files Modified, 🚀 How to Run Now, 🔄 Next Steps (Optional), Problem (+8 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (16): **Backend:**, **Backend `.env.local` (Already configured):**, code:bash (cd Frontend), code:bash (cd Backend), code:env (VITE_SUPABASE_URL="https://uyliudqpsuvqywuoefnu.supabase.co"), code:env (# Supabase), code:bash (cd Frontend), code:block6 (VITE v7.3.1  ready in 500 ms) (+8 more)

### Community 24 - "Community 24"
Cohesion: 0.13
Nodes (14): 🚀 BENEFITS OF REMOVING TANSTACK START, 📊 COMPARISON, ✅ Deployment Benefits:, ✅ Development Benefits:, 💡 HONEST ANSWER, 🎯 IMPACT OF REMOVING TANSTACK START, 🚀 NEXT STEPS, 🎯 RECOMMENDATION (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (5): FILE_SLOTS, FileSlot, KEYS, Route, STEPS

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (12): Backend, code:bash (cd Backend), code:bash (cd Frontend), 📚 Documentation, ✅ Features, Frontend, 🎵 GhostBus - Premium Ghost Production Marketplace, 🚀 Quick Start (2 Steps) (+4 more)

### Community 27 - "Community 27"
Cohesion: 0.13
Nodes (11): ARTWORKS, DEMO_AUDIO_URLS, GENRES, KEYS, LABELS, LABELS_LIST, PRODUCERS, TITLES (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.18
Nodes (11): **1. JWT Authentication**, **2. Password Security**, **3. Row Level Security (RLS)**, **4. Protected Routes**, **5. Real-time Sync**, code:block10 (✅ /account - Requires authentication), code:block11 (✅ Profile updates sync instantly), code:block7 (✅ Supabase handles JWT tokens) (+3 more)

### Community 29 - "Community 29"
Cohesion: 0.20
Nodes (10): **1. Database Schema (002_role_management.sql)**, **2. Authentication Context**, **3. Protected Routes**, **4. Seller Mode Toggle UI**, **5. Updated Pages**, **account.index.tsx (Buyer Dashboard)**, **dashboard.index.tsx (Seller Dashboard)**, 🎉 Kya Kya Implement Ho Gaya (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.20
Nodes (10): code:block4 (Full Name: Test User), code:block5 (role = 'buyer'), code:block6 (seller_mode_enabled = true), **Test 1: New User Signup**, **Test 2: Check Database**, **Test 3: Enable Seller Mode**, **Test 4: Check Database Again**, **Test 5: Disable Seller Mode** (+2 more)

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (4): BUYER, FAQ, Route, SELLER

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (7): ✅ Authentication System - Complete Implementation Done!, ✅ Final Checklist, 🚀 Next Action, **Security Level:**, 🎉 Summary, **What's NOT Implemented (Future):**, **What's Working:**

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (7): **Buyer → Seller Switch:**, code:block12 (1. User visits /login), code:block13 (1. User in Buyer Dashboard), code:block14 (1. User in Seller Dashboard), 📊 Complete User Flow, **New User Journey:**, **Seller → Buyer Switch:**

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (7): 🚀 Ab Kya Karna Hai (Final Steps), code:block1 (✅ Role management system updated!), code:bash (cd Frontend), code:bash (npm run dev), **STEP 1: Run Database Migration**, **STEP 2: Install Missing Dependencies (if needed)**, **STEP 3: Start Frontend**

### Community 35 - "Community 35"
Cohesion: 0.40
Nodes (3): buyerFAQs, Route, sellerFAQs

### Community 36 - "Community 36"
Cohesion: 0.40
Nodes (5): code:sql (-- Columns prepared:), code:tsx (const handleToggle = async (checked: boolean) => {), **Database Already Ready:**, **Future Implementation:**, 🔮 Future: Seller Verification (NOT IMPLEMENTED YET)

### Community 37 - "Community 37"
Cohesion: 0.40
Nodes (5): 📝 Code Usage Examples, code:tsx (import { useAuthContext } from '@/contexts/AuthContext'), code:tsx (import { ProtectedRoute } from '@/components/auth/ProtectedR), **Protect a Route:**, **Use Auth in Any Component:**

### Community 38 - "Community 38"
Cohesion: 0.15
Nodes (6): CartDrawer(), SmoothScroll(), GENRE_COLS, Navbar(), SERVICES_MENU, Route

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (4): TRACKS, Favorites(), Route, Route

### Community 52 - "Community 52"
Cohesion: 0.29
Nodes (5): DAYS, maxPlays, Route, TOP_TRACKS, WEEKLY_PLAYS

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (4): AudioState, CartItem, CartState, WishlistState

## Knowledge Gaps
- **552 isolated node(s):** `name`, `version`, `description`, `main`, `type` (+547 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 1` to `Community 40`, `Community 15`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `useAuthContext()` connect `Community 2` to `Community 3`, `Community 38`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _552 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.03333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07200929152148665 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05388471177944862 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._