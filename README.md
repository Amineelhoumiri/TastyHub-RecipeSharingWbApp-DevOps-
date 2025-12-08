# 🍳 TastyHub - Recipe Sharing Application

**Live Demo:** [Click here to view on Vercel](INSERT_VERCEL_LINK_HERE)

Welcome to TastyHub! 👋 We're building a community-driven recipe sharing platform where food lovers can discover, share, and celebrate amazing recipes from around the world.

This is a full-stack application built with modern web technologies - Next.js for a beautiful, responsive frontend, Express.js powering a robust backend API, and PostgreSQL keeping everything organized. We've also set up comprehensive testing and automated deployments so you can focus on what matters: creating great features!

## 🏗️ How It's Built

```
frontend/          - Next.js application (beautiful UI with app router)
backend/           - Express.js API (handles all the data magic)
  └── database/    - PostgreSQL schema and ER diagram
.github/           - Automated testing and deployment workflows
```

## 🚀 Quick Start

Ready to get cooking? Here's how to get TastyHub running on your machine!

### What You'll Need

- Node.js 18 or newer
- PostgreSQL 14 or newer
- npm (comes with Node.js)

### Setting Up the Frontend

```bash
cd frontend
npm install
npm run dev          # Opens at http://localhost:3000
```

**Tip:** You can also run `npm run dev` from the root directory!

### Setting Up the Backend

```bash
cd backend
npm install

# Don't forget to create your .env file! 
# Check backend/README.md for all the details
npm run dev          # Starts at http://localhost:5000
```

**Tip:** Run `npm run dev:backend` from the root if you prefer!

### Getting the Database Ready

Import the schema file `backend/database/Tasty-Hub.sql` into your PostgreSQL database. Head over to `backend/README.md` for step-by-step instructions!

## CI/CD

### Backend Pipeline

`.github/workflows/backend-ci.yml` runs on push/PR to `main` or `develop`:

- Installs dependencies
- Sets up PostgreSQL service
- Seeds database schema
- Runs ESLint
- Runs Jest unit tests
- Runs Cypress API tests

### Frontend Pipeline

`.github/workflows/frontend-ci.yml` runs on push/PR to `main` or `develop`:

- Installs dependencies
- Runs ESLint
- Runs Jest unit tests with coverage
- Builds Next.js application

## Testing

### Backend

```bash
cd backend
npm test              # Jest unit tests
npm run test:api      # Cypress API tests (requires server running)
npm run lint          # ESLint
```

### Frontend

```bash
cd frontend
npm test              # Jest unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run lint          # ESLint
```

Or from root:

```bash
npm run test:frontend
npm run test:frontend:watch
npm run test:frontend:coverage
```

### Frontend E2E Tests

We use Cypress for end-to-end testing of the frontend. See `cypress/README.md` for detailed testing documentation.

**Quick Start:**

```bash
# Make sure both servers are running first!
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm run dev

# Then run tests from root
npm run test:e2e:open  # Interactive mode
npm run test:e2e       # Headless mode
```

**Test Coverage:**

- Home page navigation and content
- User login and registration
- Recipes listing and detail pages
- Navigation between pages
- Authentication state management

See `frontend/TESTING.md` for detailed frontend testing documentation.

## Branch Strategy

- **`main`** - Production-ready code
- **`develop`** - Development integration branch

**Feature branches:** `feature/<name>` → merge to `develop`  
**Bugfix branches:** `bugfix/<description>` → merge to `develop`  
**Hotfix branches:** `hotfix/<description>` → merge to `main` and `develop`

## Technology Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Node.js, Express.js, Sequelize ORM
- **Database:** PostgreSQL 14
- **Testing:** Jest (unit), Cypress (E2E/API), React Testing Library
- **CI/CD:** GitHub Actions
- **Code Quality:** ESLint, Prettier

## Project Structure

```
├── frontend/
│   ├── app/              # Next.js app router
│   │   ├── lib/          # API utilities
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   └── recipes/      # Recipe pages
│   ├── public/           # Static assets
│   ├── __tests__/        # Unit tests
│   └── package.json
├── backend/
│   ├── controllers/      # Request handlers
│   ├── models/           # Sequelize models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & validation
│   ├── database/         # Schema & ER diagram
│   ├── tests/            # Jest unit tests
│   ├── cypress/         # Cypress E2E/API tests
│   └── package.json
└── .github/
    └── workflows/        # CI/CD pipelines
```

## Documentation

### Core Documentation
- [Project README](README.md) - This file - project overview and quick start
- [Backend API Documentation](backend/README.md) - Complete backend API reference
- [Frontend Documentation](frontend/README.md) - Frontend architecture and features
- [Frontend Testing Guide](frontend/TESTING.md) - Frontend testing documentation

### Security Documentation
- [Security Policy](SECURITY.md) - Security policy and vulnerability reporting
- [Security Pipeline](docs/SECURITY_PIPELINE.md) - Security implementation details
- [Security Tools](docs/SECURITY_TOOLS.md) - Security tools overview and quick reference
- [Security Implementation](docs/SECURITY_IMPLEMENTATION.md) - Implementation summary

### Project Management
- [Project Structure Audit](docs/PROJECT_STRUCTURE_AUDIT.md) - Project organization and documentation status
- [Project Cleanup Summary](docs/PROJECT_CLEANUP_SUMMARY.md) - Cleanup and organization summary

### Database
- Database schema: `backend/database/Tasty-Hub.sql`
- ER Diagram: `backend/database/ER DIAGRAM.jpg`

## 🤝 Contributing

We'd love your help making TastyHub even better! Whether you're fixing a bug, adding a feature, or improving documentation, every contribution matters.

Here's how to get started:

1. **Fork the repo** and create your branch from `develop`
2. **Make your magic happen** - add features, fix bugs, improve docs
3. **Test everything** - run the tests and linter to make sure it all works
4. **Write a clear commit message** - help us understand what you did
5. **Open a pull request** to `develop` - we'll review it together!

New to open source? No worries! Check out our contribution guidelines, and don't hesitate to ask questions. We're here to help! 💪

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
