# Recipe Sharing API - Backend Server

Backend API server for the Recipe Sharing web application built with Node.js, Express, and PostgreSQL.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [CI/CD Quick Start](#cicd-quick-start-github-actions-friendly)
- [Project Structure](#project-structure)
- [Development](#development)

## Features

- User authentication and authorization (JWT)
- Recipe CRUD operations
- Recipe likes and favorites
- Comments and reviews with ratings
- User profiles and preferences
- Pagination support
- Input validation and error handling
- Database transactions for data consistency
- Security best practices

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Testing:** Jest (unit & integration) + Cypress (API & E2E)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Set up your database:
   - Create a PostgreSQL database named `TastyHub` (or your preferred name)
   - Run the SQL schema from `RecipeApp-Database-main/RecipeApp-Database-main/Tasty-Hub.sql`

## Configuration

1. Create a `.env` file in the `server` directory:

```env
# Database Configuration
DB_NAME=TastyHub
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5500

# JWT Secret (CRITICAL - Use a strong random string!)
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters_long

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

2. Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important:** Never commit your `.env` file to git!

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## API Endpoints

### User Endpoints

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)
- `PUT /api/users/preferences` - Update user preferences (Protected)
- `GET /api/users/recipes` - Get user's recipes (Protected)
- `GET /api/users/favorites` - Get user's favorites (Protected)
- `GET /api/users/liked` - Get user's liked recipes (Protected)

### Recipe Endpoints

- `GET /api/recipes` - Get all recipes (with pagination)
- `GET /api/recipes/:recipeId` - Get recipe by ID
- `POST /api/recipes` - Create a new recipe (Protected)
- `PUT /api/recipes/:recipeId` - Update recipe (Protected, Owner only)
- `DELETE /api/recipes/:recipeId` - Delete recipe (Protected, Owner only)
- `POST /api/recipes/:recipeId/like` - Like/unlike recipe (Protected)
- `POST /api/recipes/:recipeId/favourite` - Favorite/unfavorite recipe (Protected)
- `POST /api/recipes/:recipeId/comments` - Create comment on recipe (Protected)

### Comment Endpoints

- `PUT /api/comments/:commentId` - Update comment (Protected, Owner only)
- `DELETE /api/comments/:commentId` - Delete comment (Protected, Owner only)

For detailed API documentation with examples, see `API_ENDPOINTS_TESTING.md`.

For comprehensive backend documentation including database schema, architecture, and detailed API reference, see `DOCUMENTATION.md`.

## Testing

We now have two layers of automated tests so you get fast feedback locally and realistic coverage before shipping.

### 1. Fast unit & integration tests (Jest)

These tests run entirely in Node.js, so they finish in seconds and don't need the server or database running. Use them while you build features or refactor controllers/middleware.

```bash
# Run the full Jest suite once (CI uses this command)
npm test

# Keep Jest watching while you code
npm run test:watch
```

- Config lives in `jest.config.js` and automatically loads your `.env`.
- Sample tests sit in `tests/` (e.g. `tests/userController.test.js`). Add new files here to cover controllers, middleware, and utility functions.

### 2. End-to-end & API tests (Cypress)

These tests hit the running API just like a real client. Make sure `npm run dev` (or `npm start`) is running in another terminal, then:

```bash
# Headless run of the whole Cypress suite
npm run test:e2e

# Launch the interactive Cypress runner
npm run test:e2e:open

# Only run the API specs in cypress/e2e/api
npm run test:api
```

- Specs live in `cypress/e2e/api/`, and shared helpers live under `cypress/support/`.
- Keep sensitive data (tokens, DB creds) in `.env`; Cypress reuses whatever the server is already using.

### When to run what

- **During development:** run Jest (`npm test` or `npm run test:watch`) after each change so logic bugs surface early.
- **Before pushing / in CI:** run `npm run lint`, `npm test`, then `npm run test:e2e` (or `npm run test:api`) for full confidence.

## CI/CD quick start (GitHub Actions friendly)

When you're ready to wire up automation, a simple pipeline order that plays nicely with both frameworks looks like:

1. **Install & cache dependencies**
2. **`npm run lint`** – fail fast on obvious issues
3. **`npm test`** – fast Jest layer
4. **Spin up the API (e.g., `npm run dev &`)**
5. **`npm run test:e2e`** (or the lighter `test:api`) – full Cypress pass

Because `server/index.js` now skips `app.listen` when `NODE_ENV=test`, Jest can import the Express app with zero port conflicts. In GitHub Actions you can express this with two jobs (unit + e2e) or one job with sequential steps; just remember to set `NODE_ENV=test` for the Jest step and keep your database service running before Cypress executes.

## Project Structure

```
server/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── userController.js    # User-related logic
│   ├── recipeController.js  # Recipe-related logic
│   └── commentController.js # Comment-related logic
├── middleware/
│   ├── authMiddleware.js    # JWT authentication
│   └── optionalAuthMiddleware.js # Optional authentication
├── models/
│   ├── userModel.js         # User model
│   ├── recipeModel.js       # Recipe model
│   └── ...                  # Other models
├── routes/
│   ├── userRoutes.js        # User routes
│   ├── recipeRoutes.js      # Recipe routes
│   └── commentRoutes.js     # Comment routes
├── cypress/
│   ├── e2e/api/             # API endpoint tests
│   └── support/             # Cypress custom commands
├── index.js                 # Server entry point
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Development

### Code Quality

#### Linting

```bash
npm run lint
```

#### Auto-fix Linting Issues

```bash
npm run lint:fix
```

#### Code Formatting

```bash
npm run format
```

#### Check Formatting

```bash
npm run format:check
```

### Environment Variables

All sensitive configuration is stored in `.env` file. Required variables:

- `DB_PASSWORD` - Database password (required)
- `JWT_SECRET` - Secret key for JWT tokens (required)
- `DB_NAME` - Database name (default: TastyHub)
- `DB_USER` - Database user (default: postgres)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5500)
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `NODE_ENV` - Environment mode (development/production/test)

### Security Features

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Input validation on all endpoints
- SQL injection protection via Sequelize ORM
- Environment variables for sensitive data
- CORS configuration for frontend access

### Error Handling

The API uses standardized error responses:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Run linter and formatter
6. Submit a pull request

## License

ISC
