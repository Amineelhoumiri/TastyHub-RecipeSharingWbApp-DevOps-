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
- **Testing:** Cypress

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

## Testing

We use **Cypress** for API endpoint testing. Make sure your server is running before executing tests.

### Prerequisites
1. Start your server:
```bash
npm run dev
```

2. In a separate terminal, run Cypress tests.

### Run All Tests (Headless)
```bash
npm test
```

### Open Cypress Test Runner (Interactive)
```bash
npm run test:open
```

### Run Only API Tests
```bash
npm run test:api
```

### Test Structure
- Test files are located in `cypress/e2e/api/`
- Custom commands for authentication are in `cypress/support/e2e.js`
- Tests cover all API endpoints: users, recipes, and comments

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




