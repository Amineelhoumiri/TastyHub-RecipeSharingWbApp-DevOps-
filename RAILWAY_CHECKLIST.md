# Railway Deployment Checklist

Quick reference checklist for deploying TastyHub to Railway.

## Pre-Deployment ✅

- [x] Frontend Dockerfile created
- [x] Backend Dockerfile verified
- [x] Next.js config updated for standalone output
- [x] .dockerignore files created
- [x] railway.json configuration file created

## Railway Setup Steps

### 1. Create Project

- [ ] Sign in to Railway (https://railway.app)
- [ ] Create new project
- [ ] Connect GitHub repository

### 2. PostgreSQL Database

- [ ] Add PostgreSQL service
- [ ] Note: DATABASE_URL will be auto-generated

### 3. Backend Service

- [ ] Add new service from GitHub repo
- [ ] Set root directory: `backend`
- [ ] Set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `JWT_SECRET=<generate-random-string>`
  - [ ] `FRONTEND_URL=<set-after-frontend-deploys>`
- [ ] Link PostgreSQL service (DATABASE_URL auto-injected)
- [ ] Generate domain for backend
- [ ] Copy backend URL

### 4. Frontend Service

- [ ] Add new service from GitHub repo
- [ ] Set root directory: `frontend`
- [ ] Set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `NEXT_PUBLIC_API_URL=<backend-url-from-step-3>`
- [ ] Generate domain for frontend
- [ ] Copy frontend URL

### 5. Update Backend CORS

- [ ] Update backend `FRONTEND_URL` variable with frontend domain
- [ ] Backend will auto-redeploy

### 6. Database Initialization

- [ ] Option A: Use Railway CLI
  ```bash
  railway run --service backend npm run db:sync
  ```
- [ ] Option B: Import SQL manually via Railway PostgreSQL admin

### 7. Verification

- [ ] Backend health check: `https://your-backend.railway.app/api/health`
- [ ] Frontend loads: `https://your-frontend.railway.app`
- [ ] Test login/registration
- [ ] Check browser console for errors
- [ ] Verify API calls work

## Environment Variables Quick Reference

### Backend

```
NODE_ENV=production
JWT_SECRET=<your-secret>
FRONTEND_URL=https://your-frontend.railway.app
DATABASE_URL=<auto-set-by-railway>
```

### Frontend

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

## Troubleshooting Quick Fixes

**Backend won't start:**

- Check logs in Railway dashboard
- Verify DATABASE_URL is set
- Ensure JWT_SECRET is set

**Frontend build fails:**

- Check NEXT_PUBLIC_API_URL is set
- Verify Dockerfile paths
- Check build logs

**CORS errors:**

- Verify FRONTEND_URL matches exactly (including https://)
- No trailing slashes

**Database connection fails:**

- Verify PostgreSQL service is running
- Check DATABASE_URL format
- Ensure services are linked

## Useful Railway Commands

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run command in service
railway run --service backend npm run db:sync

# Open service
railway open
```

## Next Steps After Deployment

- [ ] Set up custom domains (optional)
- [ ] Configure monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Test all features end-to-end
- [ ] Document production URLs
