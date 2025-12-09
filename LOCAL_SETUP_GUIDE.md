# 🚀 TastyHub Local Development Guide

## Quick Start (5 Minutes)

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed and running
- ✅ npm installed

---

## Step 1: Database Setup

### Create the database:
```sql
CREATE DATABASE TastyHub;
```

### Import the schema:
```bash
cd backend
psql -U postgres -d TastyHub -f database/Tasty-Hub.sql
```

---

## Step 2: Backend Configuration

### Create `.env` file in `backend/` folder:

```env
# Database
DB_NAME=TastyHub
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_HOST=localhost
DB_PORT=5500

# JWT Secret (generate a secure one!)
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters_long

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Install dependencies and run:
```bash
cd backend
npm install
npm run dev
```

✅ Backend should now be running on **http://localhost:5000**

---

## Step 3: Frontend Configuration

### Create `.env.local` file in `frontend/` folder:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Optional: Leave empty for local development
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_HOTJAR_ID=
```

### Install dependencies and run:
```bash
cd frontend
npm install
npm run dev
```

✅ Frontend should now be running on **http://localhost:3000**

---

## Step 4: Open Your Browser

Navigate to: **http://localhost:3000**

You should see the TastyHub homepage! 🎉

---

## Common Commands

### Backend
```bash
cd backend

# Development mode
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

### Frontend
```bash
cd frontend

# Development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

---

## Troubleshooting

### Backend won't start
- ✅ Check PostgreSQL is running
- ✅ Verify database credentials in `.env`
- ✅ Ensure database `TastyHub` exists
- ✅ Check port 5000 is not in use

### Frontend can't connect to backend
- ✅ Ensure backend is running on port 5000
- ✅ Check `NEXT_PUBLIC_API_URL` in `.env.local`
- ✅ Clear browser cache and restart frontend

### Database connection errors
- ✅ Verify PostgreSQL is running: `psql -U postgres`
- ✅ Check DB_PORT matches your PostgreSQL port
- ✅ Ensure DB_PASSWORD is correct

### Port already in use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different ports in .env files
```

---

## Testing the Setup

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"ok","database":"connected"}`

### Test Frontend
Open browser to `http://localhost:3000` - you should see the homepage

---

## Next Steps

1. **Create an account** - Register a new user
2. **Browse recipes** - View existing recipes
3. **Create a recipe** - Add your own recipe
4. **Test features** - Try liking, commenting, favoriting

---

## Development Tips

### Hot Reload
Both backend and frontend support hot reload:
- **Backend**: Changes auto-restart server (nodemon)
- **Frontend**: Changes auto-refresh browser (Next.js)

### Database Changes
After modifying database schema:
```bash
cd backend
psql -U postgres -d TastyHub -f database/Tasty-Hub.sql
```

### Clear All Data
To reset database:
```sql
DROP DATABASE TastyHub;
CREATE DATABASE TastyHub;
```
Then re-import schema.

---

## Need Help?

- 📖 Backend docs: `backend/README.md`
- 📖 Frontend docs: `frontend/README.md`
- 🐛 Check logs in `backend/logs/` folder
- 🔍 Check browser console for frontend errors

---

**Happy Coding! 🚀**
