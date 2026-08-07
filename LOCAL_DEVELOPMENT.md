# 🏠 GhostBus - Local Development Setup

## ✅ Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm or bun installed
- ✅ Supabase project created (ghostbus-production)
- ✅ Database schema executed

---

## 🚀 Quick Start (Local Development)

### **Step 1: Install Dependencies**

#### **Frontend:**
```bash
cd Frontend
npm install
```

#### **Backend:**
```bash
cd Backend
npm install
```

---

### **Step 2: Configure Environment Variables**

#### **Frontend `.env` (Already configured):**
```env
VITE_SUPABASE_URL="https://uyliudqpsuvqywuoefnu.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGc..."
VITE_SUPABASE_PROJECT_ID="uyliudqpsuvqywuoefnu"
```

#### **Backend `.env.local` (Already configured):**
```env
# Supabase
SUPABASE_URL="https://uyliudqpsuvqywuoefnu.supabase.co"
SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# AWS S3 (Add after AWS setup)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_AUDIO=ghostbus-tracks-audio
AWS_S3_BUCKET_COVERS=ghostbus-tracks-covers
AWS_S3_BUCKET_AVATARS=ghostbus-avatars
```

---

### **Step 3: Start Frontend (Development Server)**

```bash
cd Frontend
npm run dev
```

**Output:**
```
VITE v7.3.1  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Open:** http://localhost:5173

---

### **Step 4: Backend is Already Running!**

Your backend is **Supabase Cloud** - already running at:
```
https://uyliudqpsuvqywuoefnu.supabase.co
```

**No need to start a separate backend server!**

---

## 🗂️ Project Structure

```
ghostbus-sound-forge-main/
├── Frontend/              # React Frontend
│   ├── src/
│   │   ├── components/   # UI Components
│   │   ├── routes/       # Pages/Routes
│   │   ├── lib/          # Utilities
│   │   └── hooks/        # Custom Hooks
│   ├── .env              # Frontend config
│   └── package.json
│
├── Backend/              # Backend Configuration
│   ├── supabase/
│   │   ├── migrations/   # Database migrations
│   │   └── functions/    # Edge Functions
│   ├── utils/
│   │   └── s3.ts         # AWS S3 helpers
│   ├── .env.local        # Backend config
│   └── package.json
```

---

## 🔧 Development Workflow

### **1. Frontend Development:**

```bash
cd Frontend
npm run dev
```

**Features:**
- ✅ Hot reload enabled
- ✅ Auto-refresh on file changes
- ✅ React DevTools support
- ✅ TanStack Router DevTools

**Access:**
- Frontend: http://localhost:5173
- DevTools: http://localhost:5173/__devtools__

---

### **2. Database Changes:**

**Option A: Direct SQL (Quick)**
1. Go to: https://supabase.com/dashboard/project/uyliudqpsuvqywuoefnu/sql
2. Write SQL query
3. Click "Run"

**Option B: Migrations (Recommended)**
```bash
cd Backend
supabase migration new add_new_feature
# Edit the migration file
supabase db push
```

---

### **3. Testing Authentication:**

**Create Test User:**
```bash
# Go to Supabase Dashboard
https://supabase.com/dashboard/project/uyliudqpsuvqywuoefnu/auth/users

# Click "Add user" → "Create new user"
Email: test@ghostbus.com
Password: Test123456!
Auto Confirm: ON
```

**Or signup via frontend:**
1. Open http://localhost:5173
2. Click "Sign Up"
3. Fill form and submit

---

### **4. Viewing Database:**

**Supabase Dashboard:**
https://supabase.com/dashboard/project/uyliudqpsuvqywuoefnu/editor

**Or use SQL Editor:**
```sql
-- View all users
SELECT * FROM profiles;

-- View all tracks
SELECT * FROM tracks;

-- View orders
SELECT * FROM orders;
```

---

## 🗄️ AWS S3 Setup (For File Uploads)

### **If you want to use AWS S3:**

1. **Follow:** `Backend/AWS_S3_SETUP.md`
2. **Create S3 buckets**
3. **Add credentials to `.env.local`**
4. **Use S3 helpers:** `Backend/utils/s3.ts`

### **Or use Supabase Storage (Simpler):**

**Already configured in Supabase:**
- No additional setup needed
- Built-in CDN
- Automatic backups

**To use Supabase Storage:**
```typescript
import { supabase } from './lib/supabase'

// Upload file
const { data, error } = await supabase.storage
  .from('tracks-audio')
  .upload(`tracks/${userId}/${fileName}`, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('tracks-covers')
  .getPublicUrl(filePath)
```

---

## 🧪 Testing Locally

### **Test Authentication:**
```bash
# Open frontend
http://localhost:5173

# Try:
1. Sign up with new account
2. Login
3. Check profile in Supabase dashboard
```

### **Test Database:**
```sql
-- In Supabase SQL Editor
SELECT * FROM profiles WHERE email = 'test@ghostbus.com';
```

### **Test File Upload (if S3 configured):**
```typescript
import { uploadAudioTrack } from '../utils/s3'

const s3Uri = await uploadAudioTrack(fileBuffer, 'track.mp3', userId)
console.log('Uploaded to:', s3Uri)
```

---

## 🐛 Troubleshooting

### **Issue: Frontend won't start**
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **Issue: Can't connect to Supabase**
```bash
# Check .env file
cat Frontend/.env

# Verify URL and keys are correct
# Should match: https://uyliudqpsuvqywuoefnu.supabase.co
```

### **Issue: Database query fails**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Temporarily disable RLS (dev only!)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

### **Issue: CORS error**
```bash
# Add your domain to Supabase
# Go to: Authentication → URL Configuration
# Add: http://localhost:5173/**
```

---

## 📊 Monitoring (Development)

### **Frontend Console:**
- Open DevTools (F12)
- Check Console for errors
- Network tab for API calls

### **Supabase Logs:**
https://supabase.com/dashboard/project/uyliudqpsuvqywuoefnu/logs/explorer

**Filter by:**
- Database queries
- Auth events
- Storage operations
- Edge Functions

---

## 🚀 Ready for Production?

### **Before deploying:**

- [ ] Test all features locally
- [ ] Enable email confirmation (Supabase Auth)
- [ ] Configure custom SMTP
- [ ] Set up Stripe (if using payments)
- [ ] Configure AWS S3 (if using)
- [ ] Update CORS settings
- [ ] Test with production data
- [ ] Set up monitoring/alerts

### **Deploy Frontend:**
```bash
cd Frontend
npm run build

# Deploy to Netlify
netlify deploy --prod
```

### **Deploy Backend:**
```bash
cd Backend
supabase db push
supabase functions deploy
```

---

## ✅ Current Status

- ✅ Database schema created
- ✅ Environment variables configured
- ✅ Frontend ready to run
- ✅ Backend (Supabase) running
- ⏳ AWS S3 (optional - follow AWS_S3_SETUP.md)
- ⏳ Stripe (optional - for payments)

---

## 🎯 Next Steps

1. **Start Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

2. **Open:** http://localhost:5173

3. **Test signup/login**

4. **Start building features!**

---

**Everything is ready for local development! 🎉**

**Start with:** `cd Frontend && npm run dev`
