# 🚀 GhostBus - Render Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Files Created:
- `render.yaml` - Render configuration
- `build.sh` - Build script
- `.gitignore` updated - .env file excluded

---

## 🔧 STEP 1: GitHub Repository Update

### 1.1 Commit New Files
```bash
cd Frontend
git add render.yaml build.sh .gitignore
git commit -m "Add Render deployment configuration"
git push origin main
```

### 1.2 Verify .env is NOT Pushed
```bash
# Check if .env is in .gitignore
cat .gitignore | grep .env

# Make sure .env is not tracked
git status
# .env should NOT appear in the list
```

---

## 🌐 STEP 2: Render Account Setup

### 2.1 Create Render Account
1. Go to: https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub account (recommended)
4. Authorize Render to access your repositories

### 2.2 Connect GitHub Repository
1. Dashboard → "New +" → "Web Service"
2. Select "Build and deploy from a Git repository"
3. Click "Connect" next to your `ghost-bus` repository
4. If not visible, click "Configure account" and grant access

---

## ⚙️ STEP 3: Configure Web Service

### 3.1 Basic Settings
```
Name: ghostbus-frontend
Region: Singapore (closest to India)
Branch: main
Root Directory: Frontend
```

### 3.2 Build Settings
```
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm run preview
```

### 3.3 Instance Type
```
Plan: Free (for testing)
- 512 MB RAM
- Shared CPU
- Auto-sleep after 15 min inactivity
- 750 hours/month free
```

---

## 🔐 STEP 4: Environment Variables

### 4.1 Add Environment Variables
Click "Advanced" → "Add Environment Variable"

Add these variables:

```
NODE_VERSION = 18.17.0

VITE_SUPABASE_URL = https://fdlwzepngnqbifhaucmn.supabase.co

VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbHd6ZXBuZ25xYmlmaGF1Y21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTk4NDgsImV4cCI6MjA5NDA5NTg0OH0.Qe1mMclB8dcAGmrCXouG8HL4RVMfBwFFFJ6H80z0A24
```

**⚠️ IMPORTANT:** 
- Do NOT add quotes around values
- Copy-paste exactly as shown above
- These are public keys (safe to expose)

---

## 🚀 STEP 5: Deploy

### 5.1 Create Web Service
1. Click "Create Web Service"
2. Render will start building your app
3. Wait 5-10 minutes for first deployment

### 5.2 Monitor Build Logs
- Watch the logs in real-time
- Look for "Build completed successfully!"
- Check for any errors

### 5.3 Deployment Status
```
✅ Build successful
✅ Deploy live
✅ Service running
```

---

## 🌍 STEP 6: Access Your Live Site

### 6.1 Get Your URL
Your site will be available at:
```
https://ghostbus-frontend.onrender.com
```

### 6.2 Test the Site
1. Open the URL in browser
2. Check if homepage loads
3. Test login/signup
4. Test track browsing
5. Test audio player

---

## 🔧 STEP 7: Custom Domain (Optional)

### 7.1 Add Custom Domain
1. Go to Settings → Custom Domains
2. Click "Add Custom Domain"
3. Enter your domain (e.g., ghostbus.com)
4. Follow DNS configuration instructions

### 7.2 DNS Settings
Add these records to your domain provider:
```
Type: CNAME
Name: www
Value: ghostbus-frontend.onrender.com
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: Build Fails
**Error:** "Module not found"
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Issue 2: Environment Variables Not Working
**Error:** "Supabase client error"
**Solution:**
1. Go to Render Dashboard → Your Service → Environment
2. Verify all variables are set correctly
3. Click "Manual Deploy" → "Clear build cache & deploy"

### Issue 3: Site Shows 404
**Error:** "Not Found"
**Solution:**
1. Check Root Directory is set to "Frontend"
2. Check Start Command is "npm run preview"
3. Redeploy

### Issue 4: Slow Loading
**Reason:** Free tier auto-sleeps after 15 min
**Solution:**
- Upgrade to Starter plan ($7/month) for always-on
- Or accept 30-second cold start on first visit

---

## 💰 PRICING

### Free Tier (Current)
```
✅ 512 MB RAM
✅ Shared CPU
✅ 750 hours/month
✅ Auto-sleep after 15 min
✅ Custom domain support
❌ Always-on
❌ Priority support

Cost: $0/month
```

### Starter Tier (Recommended for Production)
```
✅ 512 MB RAM
✅ Shared CPU
✅ Always-on (no sleep)
✅ Custom domain
✅ Email support
✅ Faster builds

Cost: $7/month (₹588/month)
```

### Standard Tier (For Scale)
```
✅ 2 GB RAM
✅ 1 CPU
✅ Always-on
✅ Priority support
✅ Faster performance

Cost: $25/month (₹2,100/month)
```

---

## 📊 MONITORING

### Check Site Status
1. Render Dashboard → Your Service
2. View metrics:
   - CPU usage
   - Memory usage
   - Request count
   - Response time

### View Logs
1. Click "Logs" tab
2. See real-time application logs
3. Filter by error/warning/info

### Set Up Alerts
1. Settings → Notifications
2. Add email for deployment failures
3. Add Slack webhook (optional)

---

## 🔄 CONTINUOUS DEPLOYMENT

### Auto-Deploy on Git Push
Render automatically deploys when you push to main branch:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Render will automatically:
# 1. Detect the push
# 2. Pull latest code
# 3. Run build
# 4. Deploy new version
```

### Manual Deploy
1. Render Dashboard → Your Service
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy" (if needed)

---

## ✅ POST-DEPLOYMENT CHECKLIST

### Test All Features:
- [ ] Homepage loads correctly
- [ ] Navbar works (search, dropdowns)
- [ ] Login/Signup works
- [ ] Track browsing works
- [ ] Audio player works
- [ ] Cart functionality works
- [ ] Seller dashboard accessible
- [ ] Admin panel accessible
- [ ] Real-time notifications work
- [ ] File uploads work (if testing)

### Performance Check:
- [ ] Page load time < 3 seconds
- [ ] Images load properly
- [ ] Audio files play smoothly
- [ ] No console errors
- [ ] Mobile responsive

### Share with Client:
- [ ] Send live URL
- [ ] Provide test credentials
- [ ] Share feature list
- [ ] Explain any limitations (free tier sleep)

---

## 🎯 ALTERNATIVE: VERCEL DEPLOYMENT

If Render doesn't work, try Vercel (easier for React apps):

### Vercel Setup:
1. Go to https://vercel.com
2. Import GitHub repository
3. Select `Frontend` folder
4. Add environment variables
5. Deploy (automatic)

### Vercel Advantages:
- Faster deployment
- Better for React/Vite apps
- Global CDN
- Free tier more generous
- No auto-sleep

---

## 📞 SUPPORT

### Render Support:
- Docs: https://render.com/docs
- Community: https://community.render.com
- Email: support@render.com

### Your Support:
- GitHub Issues: Create issue in your repo
- Email: Your email here

---

## 🎉 SUCCESS!

Your GhostBus platform is now live! 🚀

**Live URL:** https://ghostbus-frontend.onrender.com

**Next Steps:**
1. Test thoroughly
2. Share with client
3. Gather feedback
4. Iterate and improve

---

**Built with ❤️ using React + Supabase + Render**
