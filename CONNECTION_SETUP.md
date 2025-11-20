# TastyHub Connection Setup Verification

## ✅ Frontend → Backend Connection

### Configuration:
- **Frontend API Base URL**: `http://localhost:5000` (configurable via `NEXT_PUBLIC_API_URL`)
- **Backend CORS**: Configured to allow requests from:
  - `http://localhost:3000`
  - `http://localhost:3001`
  - Custom `FRONTEND_URL` from environment variables

### API Utility (`frontend/app/lib/api.js`):
- ✅ All API calls point to backend Express server
- ✅ Authentication tokens automatically included in requests
- ✅ Error handling implemented

### Endpoints Connected:
- ✅ `POST /api/users/register` - User registration
- ✅ `POST /api/users/login` - User login
- ✅ `GET /api/recipes` - Fetch recipes
- ✅ `GET /api/recipes/:id` - Fetch single recipe

## ✅ Backend → Database Connection

### Configuration (`backend/config/database.js`):
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Connection**: Uses environment variables:
  - `DB_NAME` (default: TastyHub)
  - `DB_USER` (default: postgres)
  - `DB_PASSWORD` (required)
  - `DB_HOST` (default: localhost)
  - `DB_PORT` (default: 5500)

### Connection Status:
- Backend automatically connects to database on startup
- Error handling for missing `DB_PASSWORD`
- Connection pool configured for optimal performance

## ✅ Authentication Flow

### Frontend:
1. User logs in via `api.login()`
2. Token stored in `localStorage` as `token`
3. Token automatically included in API requests via `Authorization: Bearer <token>` header

### Backend:
1. JWT tokens generated on login/register
2. `authMiddleware` validates tokens for protected routes
3. User info attached to `req.user` for authenticated requests

## 🎨 Login Page Theme

### Black Theme Applied:
- ✅ Background: Black (`bg-black`)
- ✅ Card: Dark gray (`bg-gray-900`) with border
- ✅ Text: White and light gray
- ✅ Inputs: Dark gray (`bg-gray-800`) with gray borders
- ✅ Error messages: Dark red theme
- ✅ Links: Orange accent color

## 📋 Setup Checklist

### Backend Setup:
- [ ] Create `backend/.env` file with:
  ```env
  DB_NAME=TastyHub
  DB_USER=postgres
  DB_PASSWORD=your_password
  DB_HOST=localhost
  DB_PORT=5500
  JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
  PORT=5000
  FRONTEND_URL=http://localhost:3000
  NODE_ENV=development
  ```
- [ ] Run `npm install` in `backend/` directory
- [ ] Start backend: `npm run dev` (should run on port 5000)

### Database Setup:
- [ ] PostgreSQL running and accessible
- [ ] Database `TastyHub` created
- [ ] Schema imported from `backend/database/Tasty-Hub.sql`

### Frontend Setup:
- [ ] Run `npm install` in `frontend/` directory
- [ ] Optional: Create `frontend/.env.local`:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000
  ```
- [ ] Start frontend: `npm run dev` (runs on port 3000 or 3001)

## 🔍 Testing Connections

### Test Backend → Database:
```bash
cd backend
npm run dev
# Should see: "✅ Database connection has been established successfully."
```

### Test Frontend → Backend:
1. Open browser to `http://localhost:3000` (or 3001)
2. Open browser DevTools → Network tab
3. Try to login or fetch recipes
4. Check that requests go to `http://localhost:5000/api/...`

### Test Authentication:
1. Register a new user
2. Login with credentials
3. Check `localStorage` for `token` and `user`
4. Make authenticated API calls (should include `Authorization` header)




