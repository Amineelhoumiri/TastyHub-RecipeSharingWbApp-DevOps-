# Railway Deployment Guide - TastyHub

This guide walks you through deploying the TastyHub backend to Railway step by step.

## Deployment Architecture

- **Frontend:** Already deployed on Vercel ✅
- **Backend:** Deploying on Railway (this guide)
- **Database:** PostgreSQL on Railway

## Prerequisites

- GitHub account with your repository pushed
- Railway account (sign up at https://railway.app)
- Frontend already deployed on Vercel
- Basic understanding of environment variables

## Step-by-Step Deployment

### Step 1: Create Railway Project

1. Go to https://railway.app and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account if prompted
5. Select your `Recipesharingwebapp` repository
6. Railway will create a new project

### Step 2: Create PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically provision a PostgreSQL database
4. **Important:** Note that Railway will automatically provide a `DATABASE_URL` environment variable to linked services

### Step 3: Deploy Backend Service

1. In Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Railway will detect it's a new service
4. **Configure the service:**

   - **Name:** `backend` (or `tastyhub-backend`)
   - **Root Directory:** `backend`
   - **Build Command:** (leave empty - Dockerfile handles it)
   - **Start Command:** (leave empty - Dockerfile handles it)

5. **Set Environment Variables:**

   - Go to the backend service → **"Variables"** tab
   - Click **"+ New Variable"** button
   - Add the following variables one by one:
     ```
     NODE_ENV=production
     PORT=5000
     JWT_SECRET=<generate-a-strong-random-string>
     FRONTEND_URL=https://your-frontend-app.vercel.app
     ```
   - **Important:** Replace `https://your-frontend-app.vercel.app` with your actual Vercel frontend URL
   - **Note:** `DATABASE_URL` will be automatically set when you link the PostgreSQL service

6. **Link PostgreSQL Database:**

   - In backend service → **"Variables"** tab
   - Look for **"Add Reference"** option (or manually add `DATABASE_URL`)
   - **Option A (If "Add Reference" is available):**
     - Click **"Add Reference"**
     - Select your PostgreSQL service
     - Select `DATABASE_URL`
     - Railway will automatically inject the connection string
   - **Option B (If "Add Reference" is not available):**
     - Go to PostgreSQL service → **"Variables"** tab
     - Copy the `DATABASE_URL` value
     - Go back to backend service → **"Variables"** tab
     - Click **"+ New Variable"**
     - Name: `DATABASE_URL`
     - Value: Paste the copied connection string
     - Click **"Add"**

7. **Generate Backend Domain:**

   - In backend service → **"Settings"** tab
   - Scroll to **"Domains"** section
   - Click **"Generate Domain"**
   - Copy the generated domain (e.g., `tastyhub-backend.railway.app`)
   - **Save this URL** - you'll need it for Vercel configuration

### Step 4: Update Vercel Frontend Environment Variables

**Note:** Your frontend is already deployed on Vercel. Skip Railway frontend deployment.

1. Copy the backend domain URL from Step 3.7 (e.g., `https://tastyhub-backend.railway.app`)
2. Go to your Vercel project dashboard
3. Navigate to **Settings** → **Environment Variables**
4. Add or update `NEXT_PUBLIC_API_URL`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
   ```
   - Replace with your actual Railway backend URL
   - Make sure to include `https://` and NO trailing slash
5. Vercel will automatically rebuild and redeploy your frontend

### Step 5: Verify Backend CORS Configuration

1. Verify `FRONTEND_URL` in backend service → **"Variables"** tab matches your Vercel URL exactly
2. It should be: `https://your-frontend-app.vercel.app` (no trailing slash)
3. If it's incorrect, update it and Railway will automatically redeploy

### Step 6: Initialize Database Schema

Your backend needs to sync the database schema. You have two options:

**Option A: Use Railway CLI (Recommended)**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run database sync
railway run --service backend npm run db:sync
```

**Option B: Manual SQL Import**

1. Go to PostgreSQL service → **"Data"** tab
2. Use Railway's PostgreSQL admin interface
3. Import `backend/database/Tasty-Hub.sql` manually

### Step 7: Verify Deployment

1. **Check Backend Health:**

   - Visit: `https://your-backend-domain.railway.app/api/health`
   - Should return: `{"status":"ok","database":"connected",...}`

2. **Check Frontend:**

   - Visit your Vercel frontend URL
   - Should load the TastyHub homepage

3. **Test API Connection:**
   - Open browser console on frontend
   - Try logging in or registering
   - Check for CORS errors (should be none)

## Environment Variables Reference

### Backend Service

| Variable       | Required | Description                              | Example                       |
| -------------- | -------- | ---------------------------------------- | ----------------------------- |
| `NODE_ENV`     | Yes      | Environment mode                         | `production`                  |
| `PORT`         | Auto     | Server port (Railway sets automatically) | `5000`                        |
| `DATABASE_URL` | Auto     | PostgreSQL connection (auto-injected)    | `postgresql://...`            |
| `JWT_SECRET`   | Yes      | Secret for JWT tokens                    | `your-secret-key`             |
| `FRONTEND_URL` | Yes      | Frontend domain for CORS (Vercel URL)    | `https://tastyhub.vercel.app` |
| `SENTRY_DSN`   | No       | Sentry error tracking URL                | `https://...`                 |

### Frontend Service (Vercel)

| Variable              | Required | Description                       | Example                                |
| --------------------- | -------- | --------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend API URL (Railway backend) | `https://tastyhub-backend.railway.app` |

**Note:** Set this in Vercel → Settings → Environment Variables

### PostgreSQL Service

- Railway automatically manages connection details
- `DATABASE_URL` is automatically available to linked services

## Troubleshooting

### Backend Issues

**Database Connection Failed:**

- Verify PostgreSQL service is running
- Check `DATABASE_URL` is set in backend variables
- Ensure services are linked (backend → PostgreSQL)
- Check backend logs for connection errors

**CORS Errors:**

- Verify `FRONTEND_URL` in Railway backend matches your Vercel frontend URL exactly (including `https://`)
- Check backend logs for CORS rejection messages
- Ensure no trailing slashes in URLs
- Example: `https://your-app.vercel.app` ✅ (not `https://your-app.vercel.app/` ❌)

**Build Failures:**

- Check Dockerfile paths are correct
- Verify `package.json` exists in backend directory
- Review build logs for specific errors

### Frontend Issues (Vercel)

**API Connection Errors:**

- Verify `NEXT_PUBLIC_API_URL` in Vercel matches Railway backend domain exactly
- Check browser console for CORS errors
- Ensure Railway backend is running and healthy
- Verify `FRONTEND_URL` in Railway backend matches your Vercel URL

**Environment Variable Issues:**

- Check Vercel → Settings → Environment Variables
- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- After updating, Vercel will rebuild automatically

### General Issues

**Services Not Starting:**

- Check Railway logs for each service
- Verify environment variables are set correctly
- Ensure Dockerfiles are in correct locations

**Port Conflicts:**

- Railway automatically sets `PORT` environment variable
- Ensure your code uses `process.env.PORT` (which both services do)

## Custom Domains

To use your own domain:

1. Go to service → **"Settings"** → **"Custom Domain"**
2. Add your domain (e.g., `api.yourdomain.com`)
3. Railway will provide DNS records to add
4. Update DNS at your domain registrar
5. Wait for SSL certificate provisioning (automatic)

## Monitoring & Logs

- **View Logs:** Service → **"Deployments"** → Click deployment → **"Logs"**
- **Metrics:** Service → **"Metrics"** tab shows CPU, memory, network usage
- **Health Checks:** Backend includes `/api/health` endpoint for monitoring

## Database Backups

Railway PostgreSQL includes automatic backups:

- Go to PostgreSQL service → **"Data"** tab
- Backups are automatic and retained for 7 days
- You can download backups manually if needed

## Cost Management

- Railway offers a free tier with $5/month credit
- Monitor usage in Railway dashboard
- Set up usage alerts if needed
- Consider upgrading plan for production workloads

## Next Steps

After successful deployment:

1. Set up custom domains (optional)
2. Configure monitoring/alerting
3. Set up CI/CD for automatic deployments
4. Configure database backups
5. Add error tracking (Sentry)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: Check your repository's issue tracker
