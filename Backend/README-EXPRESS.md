# 🚀 GhostBus Backend - Express + Node.js

**Production-Grade REST API**

---

## 📦 **Quick Setup**

### **Step 1: Clear Disk Space**

```bash
# Clear npm cache
npm cache clean --force

# Delete temp files from:
# C:\Users\HP\AppData\Local\Temp
# C:\Users\HP\AppData\Local\npm-cache
```

### **Step 2: Install Dependencies**

```bash
cd Backend

# Use Express package.json
mv package.json package-nestjs-backup.json
mv package-express.json package.json

# Install (minimal dependencies)
npm install
```

### **Step 3: Setup Database**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### **Step 4: Configure Environment**

Update `.env.local`:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.uyliudqpsuvqywuoefnu.supabase.co:5432/postgres"
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### **Step 5: Start Server**

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server: **http://localhost:3000**

---

## 📁 **Project Structure**

```
Backend/
├── server.js              # Main Express server
├── config/
│   └── database.js        # Prisma connection
├── routes/
│   ├── auth.routes.js     # Auth endpoints
│   ├── user.routes.js     # User endpoints
│   └── track.routes.js    # Track endpoints
├── controllers/
│   ├── auth.controller.js # Auth logic
│   └── user.controller.js # User logic
├── middleware/
│   ├── auth.middleware.js # JWT verification
│   └── validate.js        # Input validation
├── utils/
│   ├── jwt.js             # JWT helpers
│   └── bcrypt.js          # Password hashing
├── prisma/
│   └── schema.prisma      # Database schema
├── .env.local             # Environment variables
└── package.json
```

---

## 🔐 **Authentication Flow**

### **Signup:**
```
POST /api/v1/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

### **Login:**
```
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### **Protected Route:**
```
GET /api/v1/users/profile
Headers: {
  Authorization: "Bearer <token>"
}
```

---

## ✅ **Next Steps**

1. ✅ Server setup complete
2. ⏳ Implement Auth routes (signup, login)
3. ⏳ Implement User routes
4. ⏳ Implement Track routes
5. ⏳ Add file upload (S3)
6. ⏳ Add Stripe payments

---

**Ready to implement Authentication module!** 🚀
