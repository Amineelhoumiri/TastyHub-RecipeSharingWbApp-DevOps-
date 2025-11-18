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

**Note:** Cypress API tests run locally (`npm run test:api` in backend). E2E tests will be added to frontend pipeline.

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
npm run lint          # ESLint
```

## Branch Strategy

- **`main`** - Production-ready code
- **`develop`** - Development integration branch

**Feature branches:** `feature/<name>` → merge to `develop`  
**Bugfix branches:** `bugfix/<description>` → merge to `develop`  
**Hotfix branches:** `hotfix/<description>` → merge to `main` and `develop`

## Technology Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Node.js, Express.js, Sequelize ORM
- **Database:** PostgreSQL 14
- **Testing:** Jest (unit), Cypress (E2E/API)
- **CI/CD:** GitHub Actions
- **Code Quality:** ESLint, Prettier

## Project Structure

```
├── frontend/
│   ├── app/              # Next.js app router
│   ├── public/           # Static assets
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

- [Backend API Documentation](backend/README.md)
- Database schema: `backend/database/Tasty-Hub.sql`
- ER diagram: `backend/database/ER DIAGRAM.jpg`

## Contributing

1. Branch from `develop`
2. Make changes
3. Run tests and linter
4. Commit with descriptive messages
5. Open PR to `develop`

## License

ISC
