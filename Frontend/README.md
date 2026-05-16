# 🎨 GhostBus Frontend

## Frontend-Only Application

This is the **client-side only** application. Backend is in separate `/Backend` folder.

---

## 📁 Structure

```
Frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── routes/          # Page routes
│   ├── hooks/           # Custom hooks
│   ├── store/           # State management
│   ├── lib/             # Utilities
│   └── integrations/    # Supabase client
├── package.json
└── vite.config.ts
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Frontend
npm install
```

### 2. Setup Environment Variables
Create `.env` file:
```env
VITE_SUPABASE_URL=https://fdlwzepngnqbifhaucmn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### 3. Run Development Server
```bash
npm run dev
```

Open: http://localhost:5173

---

## 📦 Build for Production

```bash
npm run build
```

Output: `dist/client/` folder

---

## 🌐 Deploy to Netlify

### Option 1: Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option 2: Netlify Dashboard
1. Go to https://netlify.com
2. Import from GitHub
3. Set build command: `npm run build`
4. Set publish directory: `dist/client`
5. Add environment variables
6. Deploy!

---

## 🔧 Tech Stack

- **React 19** - UI library
- **TanStack Router** - Routing
- **TanStack Query** - Data fetching
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **Supabase Client** - Backend connection

---

## 🔐 Environment Variables

Required:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key

---

## 📝 Features

- ✅ Music marketplace
- ✅ Audio player with waveform
- ✅ Shopping cart
- ✅ User authentication
- ✅ Seller dashboard
- ✅ Admin panel
- ✅ Real-time notifications
- ✅ Messaging system

---

## 🎯 Backend Connection

Frontend connects to backend via Supabase client:
- Database queries via Supabase
- Authentication via Supabase Auth
- File storage via Supabase Storage
- Real-time via Supabase Realtime

Backend code is in `/Backend` folder.

---

## 📱 Demo

Live URL: https://ghost-bus.netlify.app

---

## 🐛 Troubleshooting

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working
- Make sure variables start with `VITE_`
- Restart dev server after changing `.env`

### Supabase Connection Error
- Verify `VITE_SUPABASE_URL` is correct
- Verify `VITE_SUPABASE_PUBLISHABLE_KEY` is correct
- Check network connection

---

## 📞 Support

For backend issues, see `/Backend/README.md`
