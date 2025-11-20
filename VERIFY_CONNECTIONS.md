# Connection Verification Guide

This guide helps you verify that Frontend, Backend, and Database are all properly connected.

## 🔍 Quick Verification Steps

### Step 1: Verify Database Connection (Backend → Database)

```bash
cd backend
npm run test:connection
```

**Expected Output:**
```
✅ Database connection has been established successfully.
✅ Database query test successful: [timestamp]
📋 Found X tables in database:
   - users
   - recipes
   - ...
```

**If it fails:**
- Check PostgreSQL is running
- Verify `.env` file exists in `backend/` directory
- Ensure `DB_PASSWORD` is set correctly
- Check `DB_HOST` and `DB_PORT` match your PostgreSQL setup

### Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Database connection has been established successfully.
🚀 Server is live and running on http://localhost:5000
```

**If database connection fails:**
- Backend will show error message
- Check your `.env` file configuration
- Verify PostgreSQL is running and accessible

### Step 3: Verify Frontend → Backend Connection

1. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open Browser:**
   - Go to `http://localhost:3000` (or 3001)
   - Open Browser DevTools (F12) → Network tab

3. **Test API Calls:**
   - Try to login or register
   - Check Network tab for requests to `http://localhost:5000/api/...`
   - Requests should show status 200, 201, or 400 (not 404 or CORS errors)

### Step 4: Test Full Flow

1. **Register a User:**
   - Go to `/register`
   - Fill in form and submit
   - Should redirect to `/login` on success

2. **Login:**
   - Go to `/login`
   - Enter credentials
   - Should redirect to `/recipes` on success
   - Check `localStorage` in DevTools → Application tab for `token` and `user`

3. **View Recipes:**
   - Go to `/recipes`
   - Should load recipes from database
   - Check Network tab for `GET /api/recipes` request

## 📋 Connection Checklist

### Backend → Database ✅
- [ ] PostgreSQL is running
- [ ] Database `TastyHub` exists
- [ ] Schema imported (`backend/database/Tasty-Hub.sql`)
- [ ] `backend/.env` file exists with:
  - `DB_NAME=TastyHub`
  - `DB_USER=postgres`
  - `DB_PASSWORD=your_password`
  - `DB_HOST=localhost`
  - `DB_PORT=5500` (or your PostgreSQL port)
- [ ] `npm run test:connection` passes
- [ ] Backend server starts without database errors

### Frontend → Backend ✅
- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend configured to use `http://localhost:5000` (check `frontend/app/lib/api.js`)
- [ ] CORS configured in backend to allow frontend origin
- [ ] API calls from frontend reach backend (check Network tab)
- [ ] No CORS errors in browser console

### Authentication Flow ✅
- [ ] Registration creates user in database
- [ ] Login returns JWT token
- [ ] Token stored in `localStorage`
- [ ] Token included in authenticated API requests
- [ ] Protected routes work with valid token

## 🐛 Troubleshooting

### Database Connection Issues

**Error: "DB_PASSWORD environment variable is required"**
- Create `backend/.env` file
- Add `DB_PASSWORD=your_password`

**Error: "Unable to connect to the database"**
- Check PostgreSQL is running: `pg_isready` or check service status
- Verify database exists: `psql -U postgres -l` (look for TastyHub)
- Check connection details in `.env` match your PostgreSQL setup
- Try connecting manually: `psql -U postgres -h localhost -p 5500 -d TastyHub`

### Frontend → Backend Connection Issues

**Error: "Failed to fetch" or CORS errors**
- Check backend is running: `curl http://localhost:5000/api/recipes`
- Verify CORS configuration in `backend/index.js`
- Check `FRONTEND_URL` in backend `.env` matches frontend URL
- Try adding both ports to CORS: `http://localhost:3000` and `http://localhost:3001`

**Error: "Network request failed"**
- Backend server not running
- Wrong port in `NEXT_PUBLIC_API_URL`
- Firewall blocking connection

### Authentication Issues

**Token not being sent**
- Check `localStorage` has `token` key
- Verify `api.js` includes token in headers
- Check browser console for errors

**"Access denied" errors**
- Token expired (login again)
- Token not valid (check JWT_SECRET matches)
- Token not included in request headers

## 📝 Environment Variables Checklist

### Backend `.env` file (`backend/.env`):
```env
# Database
DB_NAME=TastyHub
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5500

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Frontend `.env.local` file (optional, `frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## ✅ Success Indicators

When everything is connected correctly, you should see:

1. **Backend Console:**
   ```
   ✅ Database connection has been established successfully.
   🚀 Server is live and running on http://localhost:5000
   ```

2. **Browser Network Tab:**
   - Requests to `http://localhost:5000/api/...`
   - Status codes: 200, 201, 400 (not 404, 500, or CORS errors)

3. **Browser Console:**
   - No CORS errors
   - No network errors
   - API responses logged (if debugging enabled)

4. **Application Functionality:**
   - Can register users
   - Can login
   - Can view recipes
   - Can create recipes (if authenticated)
   - Data persists in database




