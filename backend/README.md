# TastyHub Backend API

Express.js REST API for the TastyHub recipe sharing platform.

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5
- **Database:** PostgreSQL 14
- **ORM:** Sequelize 6
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Testing:** Jest (unit), Cypress (E2E/API)
- **Code Quality:** ESLint, Prettier

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the `backend` directory:

```env
# Database
DB_NAME=TastyHub
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5500

# JWT Secret (minimum 32 characters)
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters_long

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

**Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE TastyHub;
```

2. Import schema:
```bash
psql -U postgres -d TastyHub -f database/Tasty-Hub.sql
```

## Running the Server

```bash
npm run dev      # Development mode
npm start        # Production mode
```

Server runs on `http://localhost:5000` (or configured PORT).

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user

### User Management
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update profile (Protected)
- `PUT /api/users/preferences` - Update preferences (Protected)
- `GET /api/users/recipes` - Get user's recipes (Protected)
- `GET /api/users/favorites` - Get user's favorites (Protected)
- `GET /api/users/liked` - Get user's liked recipes (Protected)

### Recipes
- `GET /api/recipes` - Get all recipes (pagination)
- `GET /api/recipes/:recipeId` - Get recipe by ID
- `POST /api/recipes` - Create recipe (Protected)
- `PUT /api/recipes/:recipeId` - Update recipe (Protected, Owner only)
- `DELETE /api/recipes/:recipeId` - Delete recipe (Protected, Owner only)
- `POST /api/recipes/:recipeId/like` - Like/unlike recipe (Protected)
- `POST /api/recipes/:recipeId/favourite` - Favorite/unfavorite recipe (Protected)

### Comments
- `POST /api/recipes/:recipeId/comments` - Create comment (Protected)
- `PUT /api/comments/:commentId` - Update comment (Protected, Owner only)
- `DELETE /api/comments/:commentId` - Delete comment (Protected, Owner only)

**Protected endpoints** require `Authorization: Bearer <token>` header.

## Testing

### Unit Tests (Jest)

```bash
npm test              # Run all tests
npm run test:unit     # Same as above
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

Tests are located in `tests/` directory.

### API Tests (Cypress)

**Prerequisites:** Server must be running (`npm run dev`)

```bash
npm run test:api      # Run API tests (headless)
npm run test:e2e      # Run all Cypress tests
npm run test:e2e:open # Interactive test runner
```

Tests are located in `cypress/e2e/api/`.

## Code Quality

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # Sequelize configuration
├── controllers/
│   ├── userController.js
│   ├── recipeController.js
│   └── commentController.js
├── middleware/
│   ├── authMiddleware.js
│   └── optionalAuthMiddleware.js
├── models/
│   ├── userModel.js
│   ├── recipeModel.js
│   └── ...                  # Other models
├── routes/
│   ├── userRoutes.js
│   ├── recipeRoutes.js
│   └── commentRoutes.js
├── database/
│   ├── Tasty-Hub.sql        # PostgreSQL schema
│   └── ER DIAGRAM.jpg       # Database diagram
├── tests/
│   ├── setup.js             # Jest configuration
│   └── controllers/         # Unit tests
├── cypress/
│   ├── e2e/api/             # API endpoint tests
│   └── support/             # Custom commands
├── index.js                 # Server entry point
├── jest.config.js
├── cypress.config.js
├── eslint.config.js
└── package.json
```

## Error Handling

Standardized error responses:

```json
{
  "message": "Error description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation on all endpoints
- SQL injection protection via Sequelize ORM
- Environment variables for sensitive data
- CORS configuration

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `JWT_SECRET` | Yes | Secret key for JWT (min 32 chars) |
| `DB_NAME` | No | Database name (default: TastyHub) |
| `DB_USER` | No | Database user (default: postgres) |
| `DB_HOST` | No | Database host (default: localhost) |
| `DB_PORT` | No | Database port (default: 5500) |
| `PORT` | No | Server port (default: 5000) |
| `FRONTEND_URL` | No | Frontend URL for CORS |
| `NODE_ENV` | No | Environment (development/production/test) |

## License

ISC
