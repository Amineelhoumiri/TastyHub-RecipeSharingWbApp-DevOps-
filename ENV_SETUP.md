# Environment Variables Configuration Guide

## 🔧 Backend Environment Variables

### Local Development (.env file in backend/)

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tastyhub
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_URL=http://localhost:3000

# Backend URL (for OAuth callbacks)
BACKEND_URL=http://localhost:5000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/users/auth/google/callback
```

### Production (Railway)

Set these environment variables in your Railway dashboard:

```bash
# Database (automatically provided by Railway PostgreSQL)
DATABASE_URL=<automatically-set-by-railway>

# JWT Secret
JWT_SECRET=<your-production-jwt-secret>

# Server Configuration
PORT=5000
NODE_ENV=production

# URLs
FRONTEND_URL=https://recipesharingwebapp.vercel.app
BACKEND_URL=https://recipesharingwebapp-production.up.railway.app

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://recipesharingwebapp-production.up.railway.app/api/users/auth/google/callback
```

---

## 🎨 Frontend Environment Variables

### Local Development (.env.local file in frontend/)

Create a `.env.local` file in the `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Production (Vercel)

Set this environment variable in your Vercel project settings:

```bash
NEXT_PUBLIC_API_URL=https://recipesharingwebapp-production.up.railway.app
```

---

## 🔐 Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project
3. Click on your OAuth 2.0 Client ID
4. Copy the **Client ID** and **Client Secret**
5. Add them to your environment variables (both local and production)

---

## ✅ Authorized URLs in Google Console

### JavaScript Origins:
- `http://localhost:3000` (local)
- `https://recipesharingwebapp.vercel.app` (production)

### Redirect URIs:
- `http://localhost:5000/api/users/auth/google/callback` (local)
- `https://recipesharingwebapp-production.up.railway.app/api/users/auth/google/callback` (production)

---

## 🚀 After Setting Environment Variables

1. **Railway**: Redeploy your backend after adding variables
2. **Vercel**: Redeploy your frontend after adding variables
3. **Local**: Restart both dev servers (`npm run dev`)

---

## 🧪 Testing OAuth Flow

### Local:
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to `http://localhost:3000/login`
4. Click "Sign in with Google"

### Production:
1. Go to `https://recipesharingwebapp.vercel.app/login`
2. Click "Sign in with Google"
3. Should redirect to Google, then back to your app with authentication

---

## 🔍 Troubleshooting

### "redirect_uri_mismatch" error:
- Verify the callback URL in Google Console exactly matches your environment variable
- Check for trailing slashes or typos

### "Google authentication failed":
- Check Railway logs for errors
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
- Ensure `FRONTEND_URL` is set correctly for the redirect

### OAuth works locally but not in production:
- Verify all production environment variables are set in Railway
- Check that Google Console has the production callback URL
- Redeploy Railway after adding variables
