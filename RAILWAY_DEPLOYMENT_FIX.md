# Railway Deployment Fix

## 🔧 Issue
The Railway deployment is failing with:
```
Multiple services found. Please specify a service via the `--service` flag.
```

## ✅ Solution
We've updated the deployment workflow to use the `--service` flag, but you need to add the service name as a GitHub secret.

---

## 📋 Steps to Fix

### Step 1: Find Your Railway Service Name

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Open your project
3. Look at your services list - you should see your backend service
4. The service name is usually something like:
   - `backend`
   - `recipesharingwebapp-backend`
   - Or a custom name you set

**Alternative Method:**
Run this command locally (if you have Railway CLI installed):
```bash
railway status
```

This will show all your services.

---

### Step 2: Add GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add:
   - **Name:** `RAILWAY_SERVICE_NAME`
   - **Value:** `your-backend-service-name` (from Step 1)
5. Click **Add secret**

---

### Step 3: Verify Other Secrets

Make sure you also have these secrets configured:

#### Required Secrets:
- ✅ `RAILWAY_TOKEN` - Your Railway API token
- ✅ `RAILWAY_SERVICE_NAME` - Your backend service name (just added)
- ✅ `VERCEL_TOKEN` - Your Vercel token
- ✅ `VERCEL_ORG_ID` - Your Vercel organization ID
- ✅ `VERCEL_PROJECT_ID` - Your Vercel project ID
- ✅ `PRODUCTION_API_URL` - Your Railway backend URL

---

### Step 4: Re-run the Deployment

After adding the `RAILWAY_SERVICE_NAME` secret:

1. Go to **Actions** tab in GitHub
2. Find the failed deployment workflow
3. Click **Re-run failed jobs**

OR push a new commit:
```bash
git add .github/workflows/deploy.yml
git commit -m "fix: add service name to Railway deployment command"
git push origin main
```

---

## 🔍 How to Get Railway Service Name

### Method 1: Railway Dashboard
1. Go to https://railway.app/dashboard
2. Select your project
3. Look at the service list on the left
4. The service name is displayed there

### Method 2: Railway CLI (if installed)
```bash
cd backend
railway status
```

### Method 3: Check Railway Project Settings
1. Go to your Railway project
2. Click on your backend service
3. Go to **Settings** tab
4. The service name is shown at the top

---

## 📝 Common Service Names

Your service name is likely one of these:
- `backend`
- `recipesharingwebapp`
- `recipesharingwebapp-backend`
- `tastyhub-backend`

---

## ✅ After Fix

Once you add the `RAILWAY_SERVICE_NAME` secret and re-run the deployment, it should work correctly!

The deployment will now use:
```bash
railway up --service=your-service-name --detach
```

This explicitly tells Railway which service to deploy.
