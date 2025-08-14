# 🚀 Kaskrout App Deployment Guide

## Quick Deploy Options (Recommended)

### Option 1: Railway (Easiest & Cheapest)
**Cost**: ~$5-10/month for both frontend + backend

### Option 2: Render (Alternative)
**Cost**: ~$7-15/month

### Option 3: Vercel + Railway (Most Flexible)
**Cost**: ~$5-10/month

---

## 🚀 Railway Deployment (Recommended)

### Step 1: Prepare Your Code
1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Set Up Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### Step 3: Deploy Backend
1. **Add Backend Service**:
   - Click "New Service" → "GitHub Repo"
   - Select your repository
   - Choose the `backend` folder
   - Railway will auto-detect Node.js

2. **Add PostgreSQL Database**:
   - Click "New Service" → "Database" → "PostgreSQL"
   - Railway will auto-link it to your backend

3. **Set Environment Variables**:
   ```env
   DATABASE_URL=postgresql://... (Railway will provide this)
   JWT_SECRET=your_super_secret_key_here_change_this_in_production
   PORT=5000
   NODE_ENV=production
   ```

4. **Deploy**:
   - Railway will auto-deploy when you push changes
   - Check logs for any errors

### Step 4: Deploy Frontend
1. **Add Frontend Service**:
   - Click "New Service" → "GitHub Repo"
   - Select your repository again
   - Choose the `frontend` folder

2. **Set Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

3. **Deploy**:
   - Railway will build and deploy your React app

### Step 5: Get Your URLs
- Backend: `https://your-backend-name.railway.app`
- Frontend: `https://your-frontend-name.railway.app`

---

## 🔧 Alternative: Render Deployment

### Step 1: Backend on Render
1. Go to [render.com](https://render.com)
2. Create account and new "Web Service"
3. Connect GitHub repo, select `backend` folder
4. Set environment variables:
   ```env
   DATABASE_URL=postgresql://... (from Render PostgreSQL)
   JWT_SECRET=your_secret_key
   PORT=5000
   NODE_ENV=production
   ```

### Step 2: Frontend on Render
1. Create new "Static Site" service
2. Connect same repo, select `frontend` folder
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variable:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

---

## 🔧 Alternative: Vercel + Railway

### Step 1: Backend on Railway
Follow Railway steps above for backend only.

### Step 2: Frontend on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Set root directory to `frontend`
4. Set environment variable:
   ```env
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

---

## 🗄️ Database Setup

### Option A: Railway PostgreSQL (Recommended)
- Railway provides PostgreSQL automatically
- No additional setup needed

### Option B: Neon PostgreSQL (Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Create free account
3. Create new project
4. Copy connection string to your environment variables

### Option C: Supabase (Free Tier)
1. Go to [supabase.com](https://supabase.com)
2. Create free account
3. Create new project
4. Use connection string in environment variables

---

## 🔐 Security Checklist

### Before Deploying:
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update `VITE_API_URL` to your production backend URL
- [ ] Test all features locally with production environment variables

### After Deploying:
- [ ] Test login/registration
- [ ] Test all CRUD operations
- [ ] Check database connections
- [ ] Verify file uploads (if any)

---

## 📊 Monitoring & Maintenance

### Railway Dashboard:
- Monitor CPU/Memory usage
- Check deployment logs
- Set up alerts for downtime

### Database:
- Regular backups (Railway handles this)
- Monitor connection limits
- Check query performance

---

## 💰 Cost Optimization

### Railway:
- **Free Tier**: $5/month credit
- **Paid**: Pay per usage (~$5-10/month for small apps)

### Render:
- **Free Tier**: Available but limited
- **Paid**: $7/month for web services

### Vercel:
- **Free Tier**: Generous for frontend
- **Paid**: $20/month for Pro features

---

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Node.js version (should be ≥18)
   - Verify all dependencies in package.json
   - Check build logs for specific errors

2. **Database Connection Fails**:
   - Verify DATABASE_URL format
   - Check if database is accessible
   - Ensure Prisma migrations ran

3. **Frontend Can't Connect to Backend**:
   - Verify VITE_API_URL is correct
   - Check CORS settings
   - Ensure backend is running

4. **Environment Variables Not Working**:
   - Restart services after adding variables
   - Check variable names (case-sensitive)
   - Verify no extra spaces

---

## 📞 Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test locally with production settings
4. Check platform documentation

---

**Recommended for your use case**: Railway (Option 1) - Simple, reliable, and cost-effective for a restaurant management system.
