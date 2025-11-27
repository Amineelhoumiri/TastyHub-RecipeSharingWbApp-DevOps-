# TastyHub - Recipe Sharing Application

A full-stack recipe sharing platform built with Next.js frontend and Express.js backend, featuring PostgreSQL database, comprehensive testing, and CI/CD automation.

## Architecture

```
frontend/          - Next.js application (app router + public assets)
backend/           - Express.js API (REST endpoints, Sequelize ORM)
  └── database/    - PostgreSQL schema and ER diagram
.github/           - GitHub Actions CI/CD workflows
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

Or from root: `npm run dev`

### Backend

```bash
cd backend
npm install

# Create .env file (see backend/README.md for details)
npm run dev          # http://localhost:5000
```

Or from root: `npm run dev:backend`

### Database Setup

Import `backend/database/Tasty-Hub.sql` into PostgreSQL. See `backend/README.md` for configuration details.

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

- [Backend API Documentation](backend/README.md) - Complete backend API reference
- [Frontend Documentation](frontend/README.md) - Frontend setup and features guide
- [Frontend Testing Guide](frontend/TESTING.md) - Frontend testing documentation
- Database schema: `backend/database/Tasty-Hub.sql`

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository and create a branch from `develop`
2. Make your changes
3. Run tests and linter to make sure everything works
4. Commit with clear, descriptive messages
5. Open a pull request to `develop` for review

For more details, check out our contribution guidelines in the repository.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
