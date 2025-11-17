# TastyHub Backend API - Complete Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Authentication & Security](#authentication--security)
6. [Error Handling](#error-handling)
7. [Development Workflow](#development-workflow)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

The TastyHub Backend API is a RESTful API built with Node.js and Express.js that powers a recipe sharing web application. It provides endpoints for user management, recipe CRUD operations, social interactions (likes, favorites, comments), and user preferences.

### Key Features

- **User Authentication**: JWT-based authentication system
- **Recipe Management**: Full CRUD operations for recipes with ingredients and steps
- **Social Features**: Likes, favorites, and comments/reviews with ratings
- **User Profiles**: User profile management and preferences
- **Pagination**: Efficient data retrieval with pagination support
- **Data Integrity**: Database transactions for atomic operations
- **Security**: Input validation, password hashing, SQL injection protection

### Technology Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js (v5.1.0)
- **Database**: PostgreSQL (v12+)
- **ORM**: Sequelize (v6.37.7)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Testing**: Cypress
- **Code Quality**: ESLint, Prettier

---

## Architecture Overview

### System Architecture

The backend follows a **MVC (Model-View-Controller)** architecture pattern:

```
┌─────────────┐
│   Client    │ (Frontend/Postman)
└──────┬──────┘
       │ HTTP Requests
       ▼
┌─────────────────────────────────┐
│      Express.js Server           │
│  ┌───────────────────────────┐  │
│  │   Routes Layer            │  │ (userRoutes, recipeRoutes, commentRoutes)
│  └───────────┬───────────────┘  │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │  Middleware Layer         │  │ (authMiddleware, optionalAuthMiddleware)
│  └───────────┬───────────────┘  │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │  Controllers Layer         │  │ (userController, recipeController, commentController)
│  └───────────┬───────────────┘  │
└──────────────┼──────────────────┘
               ▼
┌─────────────────────────────────┐
│      Sequelize ORM               │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│      PostgreSQL Database         │
└─────────────────────────────────┘
```

### Project Structure

```
server/
├── config/
│   └── database.js              # Database connection configuration
├── controllers/
│   ├── userController.js        # User-related business logic
│   ├── recipeController.js      # Recipe-related business logic
│   └── commentController.js     # Comment/review-related business logic
├── middleware/
│   ├── authMiddleware.js        # JWT authentication middleware
│   └── optionalAuthMiddleware.js # Optional authentication for public routes
├── models/
│   ├── index.js                 # Model relationships and exports
│   ├── userModel.js             # User model
│   ├── recipeModel.js           # Recipe model
│   ├── recipeIngredientsModel.js # Recipe ingredients model
│   ├── recipeStepModel.js       # Recipe steps model
│   ├── reviewModel.js           # Review/comment model
│   ├── likeModel.js             # Like model
│   ├── favoriteModel.js         # Favorite model
│   ├── tagModel.js              # Tag model
│   ├── recipeTagModel.js        # Recipe-Tag junction model
│   └── activityLogModel.js      # Activity log model
├── routes/
│   ├── userRoutes.js             # User endpoints
│   ├── recipeRoutes.js          # Recipe endpoints
│   └── commentRoutes.js         # Comment endpoints
├── cypress/
│   ├── e2e/api/                 # API endpoint tests
│   └── support/                 # Cypress custom commands
├── index.js                     # Server entry point
├── package.json                 # Dependencies and scripts
├── README.md                     # Quick start guide
├── API_ENDPOINTS_TESTING.md     # Testing guide
└── DOCUMENTATION.md             # This file
```

### Design Decisions

1. **Sequelize ORM**: Chosen for its robust PostgreSQL support, migrations, and relationship management
2. **JWT Authentication**: Stateless authentication suitable for RESTful APIs
3. **Database Transactions**: Used for critical operations (like/favorite toggles) to prevent race conditions
4. **Pagination**: Implemented to handle large datasets efficiently
5. **Input Validation**: Client-side and server-side validation for data integrity
6. **Error Handling**: Centralized error handling middleware for consistent responses

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│   User   │────────▶│  Recipe  │────────▶│  Review  │
└──────────┘ 1    *  └──────────┘ 1    *  └──────────┘
     │                    │                    │
     │                    │                    │
     │ *                  │ *                  │
     │                    │                    │
     ▼                    ▼                    │
┌──────────┐         ┌──────────┐              │
│   Like   │         │ Favorite │              │
└──────────┘         └──────────┘              │
     │                    │                    │
     │                    │                    │
     └────────────────────┴────────────────────┘
                          │
                          ▼
                   ┌──────────┐
                   │ Activity │
                   │   Log    │
                   └──────────┘

┌──────────┐         ┌──────────┐
│  Recipe  │────────▶│ Ingredient│
└──────────┘ 1    *  └──────────┘

┌──────────┐         ┌──────────┐
│  Recipe  │────────▶│   Step   │
└──────────┘ 1    *  └──────────┘

┌──────────┐         ┌──────────┐         ┌──────────┐
│  Recipe  │────────▶│RecipeTag │────────▶│   Tag   │
└──────────┘ *    *  └──────────┘ *    1  └──────────┘
```

### Tables

#### 1. `users`

Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique user identifier |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL | User's display name (3-100 chars) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address (validated) |
| `password_hash` | TEXT | NOT NULL | Hashed password (bcrypt) |
| `profile_picture` | TEXT | NULL | URL to profile picture |
| `created_at` | TIMESTAMP | NOT NULL | Account creation timestamp |

**Relationships:**
- One-to-Many: `User` → `Recipe` (user_id)
- One-to-Many: `User` → `Review` (user_id)
- One-to-Many: `User` → `ActivityLog` (user_id)
- Many-to-Many: `User` ↔ `Recipe` (through `Like`)
- Many-to-Many: `User` ↔ `Recipe` (through `Favorite`)

#### 2. `recipes`

Stores recipe information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique recipe identifier |
| `user_id` | UUID | FOREIGN KEY, NOT NULL | Recipe creator (references users.id) |
| `title` | VARCHAR(255) | NOT NULL | Recipe title |
| `description` | TEXT | NULL | Recipe description |
| `cooking_time` | INTEGER | NULL | Cooking time in minutes |
| `servings` | INTEGER | NULL | Number of servings |
| `total_likes` | INTEGER | DEFAULT 0 | Total number of likes |
| `total_downloads` | INTEGER | DEFAULT 0 | Total number of downloads |
| `total_shares` | INTEGER | DEFAULT 0 | Total number of shares |
| `average_rating` | NUMERIC(2,1) | DEFAULT 0.0 | Average rating (1.0-5.0) |
| `image_url` | TEXT | NULL | URL to recipe image |
| `created_at` | TIMESTAMP | NOT NULL | Recipe creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Relationships:**
- Many-to-One: `Recipe` → `User` (user_id)
- One-to-Many: `Recipe` → `Review` (recipe_id)
- One-to-Many: `Recipe` → `RecipeIngredient` (recipe_id)
- One-to-Many: `Recipe` → `RecipeStep` (recipe_id)
- One-to-Many: `Recipe` → `ActivityLog` (recipe_id)
- Many-to-Many: `Recipe` ↔ `User` (through `Like`)
- Many-to-Many: `Recipe` ↔ `User` (through `Favorite`)
- Many-to-Many: `Recipe` ↔ `Tag` (through `RecipeTag`)

#### 3. `reviews`

Stores user reviews/comments on recipes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique review identifier |
| `user_id` | UUID | FOREIGN KEY, NOT NULL | Review author (references users.id) |
| `recipe_id` | UUID | FOREIGN KEY, NOT NULL | Reviewed recipe (references recipes.id) |
| `rating` | INTEGER | CHECK (1-5) | Rating value (1-5) |
| `comment` | TEXT | NULL | Review comment text |
| `created_at` | TIMESTAMP | NOT NULL | Review creation timestamp |

**Relationships:**
- Many-to-One: `Review` → `User` (user_id)
- Many-to-One: `Review` → `Recipe` (recipe_id)

#### 4. `recipe_ingredients`

Stores ingredients for each recipe.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique ingredient identifier |
| `recipe_id` | UUID | FOREIGN KEY, NOT NULL | Recipe (references recipes.id) |
| `ingredient_name` | VARCHAR(150) | NOT NULL | Ingredient name |
| `quantity` | NUMERIC(10,2) | NOT NULL | Ingredient quantity |
| `unit` | VARCHAR(50) | CHECK | Unit of measurement (see valid units below) |
| `notes` | TEXT | NULL | Additional notes about ingredient |

**Valid Units:**
- `teaspoon`, `tablespoon`, `cup`, `gram`, `kilogram`, `ml`, `liter`, `piece`, `pinch`, `other`

**Relationships:**
- Many-to-One: `RecipeIngredient` → `Recipe` (recipe_id)

#### 5. `recipe_steps`

Stores cooking steps for each recipe.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique step identifier |
| `recipe_id` | UUID | FOREIGN KEY, NOT NULL | Recipe (references recipes.id) |
| `step_number` | INTEGER | NOT NULL | Step order number |
| `instruction` | TEXT | NOT NULL | Step instruction text |
| `step_image` | TEXT | NULL | URL to step image |

**Relationships:**
- Many-to-One: `RecipeStep` → `Recipe` (recipe_id)

#### 6. `likes`

Junction table for user-recipe likes (Many-to-Many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PRIMARY KEY, FOREIGN KEY | User (references users.id) |
| `recipe_id` | UUID | PRIMARY KEY, FOREIGN KEY | Recipe (references recipes.id) |
| `created_at` | TIMESTAMP | NOT NULL | Like timestamp |

**Composite Primary Key:** (`user_id`, `recipe_id`)

#### 7. `favorites`

Junction table for user-recipe favorites (Many-to-Many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PRIMARY KEY, FOREIGN KEY | User (references users.id) |
| `recipe_id` | UUID | PRIMARY KEY, FOREIGN KEY | Recipe (references recipes.id) |
| `created_at` | TIMESTAMP | NOT NULL | Favorite timestamp |

**Composite Primary Key:** (`user_id`, `recipe_id`)

#### 8. `tags`

Stores recipe tags/categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique tag identifier |
| `tag_name` | VARCHAR(100) | UNIQUE, NOT NULL | Tag name |

**Relationships:**
- Many-to-Many: `Tag` ↔ `Recipe` (through `RecipeTag`)

#### 9. `recipe_tags`

Junction table for recipe-tag relationships (Many-to-Many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `recipe_id` | UUID | PRIMARY KEY, FOREIGN KEY | Recipe (references recipes.id) |
| `tag_id` | UUID | PRIMARY KEY, FOREIGN KEY | Tag (references tags.id) |

**Composite Primary Key:** (`recipe_id`, `tag_id`)

#### 10. `activity_log`

Logs user activities (downloads, shares).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique log entry identifier |
| `user_id` | UUID | FOREIGN KEY, NOT NULL | User (references users.id) |
| `recipe_id` | UUID | FOREIGN KEY, NOT NULL | Recipe (references recipes.id) |
| `action_type` | VARCHAR(50) | CHECK | Action type: `download` or `share` |
| `created_at` | TIMESTAMP | NOT NULL | Activity timestamp |

**Relationships:**
- Many-to-One: `ActivityLog` → `User` (user_id)
- Many-to-One: `ActivityLog` → `Recipe` (recipe_id)

---

## API Reference

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require authentication via JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained from the `/api/users/register` or `/api/users/login` endpoints and are valid for 30 days.

### Common Response Formats

#### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

#### Error Response
```json
{
  "message": "Error description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |
| 503 | Service Unavailable (database connection error) |

---

### User Endpoints

#### 1. Register User

**Endpoint:** `POST /api/users/register`  
**Access:** Public  
**Description:** Create a new user account

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Validation Rules:**
- `username`: Required, 3-100 characters, unique
- `email`: Required, valid email format, unique, normalized to lowercase
- `password`: Required, 8-128 characters

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation error, email/username already exists
- `500`: Server error

---

#### 2. Login User

**Endpoint:** `POST /api/users/login`  
**Access:** Public  
**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Validation Rules:**
- `email`: Required, valid email format, normalized to lowercase
- `password`: Required

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400`: Invalid email or password
- `401`: Invalid credentials

---

#### 3. Get User Profile

**Endpoint:** `GET /api/users/profile`  
**Access:** Protected  
**Description:** Get authenticated user's profile

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "profilePicture": "https://example.com/pic.jpg",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `404`: User not found

---

#### 4. Update User Profile

**Endpoint:** `PUT /api/users/profile`  
**Access:** Protected  
**Description:** Update authenticated user's profile

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

**Validation Rules:**
- `username`: 3-100 characters, unique (if provided)
- `email`: Valid email format, unique (if provided)

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid-here",
    "username": "newusername",
    "email": "newemail@example.com"
  }
}
```

**Error Responses:**
- `400`: Validation error, email/username already taken
- `401`: Missing or invalid token

---

#### 5. Update User Preferences

**Endpoint:** `PUT /api/users/preferences`  
**Access:** Protected  
**Description:** Update user preferences (dark mode, units)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "darkMode": true,
  "units": "metric"
}
```

**Validation Rules:**
- `darkMode`: Boolean (true/false)
- `units`: String, must be `"metric"` or `"imperial"`

**Success Response (200):**
```json
{
  "message": "Preferences updated successfully"
}
```

**Error Responses:**
- `400`: Invalid units value (must be "metric" or "imperial")
- `401`: Missing or invalid token

**Note:** Preferences are currently stored in the response but require database columns for persistence.

---

#### 6. Get User's Recipes

**Endpoint:** `GET /api/users/recipes`  
**Access:** Protected  
**Description:** Get all recipes created by authenticated user

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "recipes": [
    {
      "id": "uuid-here",
      "title": "Chocolate Cake",
      "description": "Delicious cake recipe",
      "cookingTime": 45,
      "servings": 8,
      "totalLikes": 10,
      "averageRating": 4.5,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### 7. Get User's Favorites

**Endpoint:** `GET /api/users/favorites`  
**Access:** Protected  
**Description:** Get all recipes favorited by authenticated user

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "favorites": [
    {
      "id": "uuid-here",
      "title": "Pasta Carbonara",
      "description": "Classic Italian pasta",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### 8. Get User's Liked Recipes

**Endpoint:** `GET /api/users/liked`  
**Access:** Protected  
**Description:** Get all recipes liked by authenticated user

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "likedRecipes": [
    {
      "id": "uuid-here",
      "title": "Chocolate Chip Cookies",
      "description": "Soft and chewy cookies",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Recipe Endpoints

#### 9. Get All Recipes

**Endpoint:** `GET /api/recipes`  
**Access:** Public (optional auth for enhanced data)  
**Description:** Get paginated list of all recipes

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `pageSize` (optional): Items per page (default: 20, min: 1, max: 100)

**Example:**
```
GET /api/recipes?page=1&pageSize=20
```

**Headers (optional):**
```
Authorization: Bearer <token>  // Provides additional user-specific data
```

**Success Response (200):**
```json
{
  "recipes": [
    {
      "id": "uuid-here",
      "title": "Chocolate Cake",
      "description": "Delicious cake recipe",
      "cookingTime": 45,
      "servings": 8,
      "totalLikes": 10,
      "averageRating": 4.5,
      "imageUrl": "https://example.com/cake.jpg",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "User": {
        "id": "uuid-here",
        "username": "chef123"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalRecipes": 150,
    "totalPages": 8
  }
}
```

**Error Responses:**
- `400`: Invalid pagination parameters

---

#### 10. Get Recipe by ID

**Endpoint:** `GET /api/recipes/:recipeId`  
**Access:** Public (optional auth for enhanced data)  
**Description:** Get detailed recipe information

**URL Parameters:**
- `recipeId`: UUID of the recipe

**Example:**
```
GET /api/recipes/010dc286-e0a6-4a9c-985d-2b3ba8134023
```

**Headers (optional):**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "recipe": {
    "id": "uuid-here",
    "title": "Chocolate Cake",
    "description": "Delicious cake recipe",
    "cookingTime": 45,
    "servings": 8,
    "totalLikes": 10,
    "averageRating": 4.5,
    "imageUrl": "https://example.com/cake.jpg",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "User": {
      "id": "uuid-here",
      "username": "chef123"
    },
    "ingredients": [
      {
        "id": "uuid-here",
        "ingredientName": "Flour",
        "quantity": 2.0,
        "unit": "cup",
        "notes": "All-purpose"
      }
    ],
    "steps": [
      {
        "id": "uuid-here",
        "stepNumber": 1,
        "instruction": "Preheat oven to 350°F",
        "stepImage": null
      }
    ],
    "Reviews": [
      {
        "id": "uuid-here",
        "rating": 5,
        "comment": "Amazing recipe!",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "User": {
          "username": "reviewer123"
        }
      }
    ]
  }
}
```

**Error Responses:**
- `404`: Recipe not found

---

#### 11. Create Recipe

**Endpoint:** `POST /api/recipes`  
**Access:** Protected  
**Description:** Create a new recipe

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (minimal - only title required):**
```json
{
  "title": "Chocolate Cake",
  "description": "A delicious chocolate cake recipe",
  "cookingTime": 45,
  "servings": 8,
  "imageUrl": "https://example.com/cake.jpg"
}
```

**Request Body (full - with ingredients and steps):**
```json
{
  "title": "Chocolate Cake",
  "description": "A delicious chocolate cake recipe",
  "cookingTime": 45,
  "servings": 8,
  "imageUrl": "https://example.com/cake.jpg",
  "ingredients": [
    {
      "name": "Flour",
      "quantity": 2,
      "unit": "cup",
      "notes": "All-purpose flour"
    },
    {
      "name": "Sugar",
      "quantity": 1.5,
      "unit": "cup"
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Preheat oven to 350°F",
      "stepImage": null
    },
    {
      "stepNumber": 2,
      "instruction": "Mix dry ingredients together"
    }
  ],
  "tags": ["dessert", "chocolate", "cake"]
}
```

**Validation Rules:**
- `title`: Required, string
- `cookingTime`: Optional, integer (minutes)
- `servings`: Optional, integer
- `ingredients[].name`: Required if ingredients provided
- `ingredients[].quantity`: Required if ingredients provided, numeric
- `ingredients[].unit`: Required if ingredients provided, must be valid unit
- `steps[].stepNumber`: Required if steps provided, integer
- `steps[].instruction`: Required if steps provided, string

**Success Response (201):**
```json
{
  "message": "Recipe created successfully",
  "recipe": {
    "id": "uuid-here",
    "title": "Chocolate Cake",
    "description": "A delicious chocolate cake recipe",
    "cookingTime": 45,
    "servings": 8,
    "totalLikes": 0,
    "averageRating": 0.0,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation error
- `401`: Missing or invalid token
- `500`: Server error

**Note:** Uses database transactions to ensure atomicity when creating recipe with ingredients/steps.

---

#### 12. Update Recipe

**Endpoint:** `PUT /api/recipes/:recipeId`  
**Access:** Protected (Owner only)  
**Description:** Update an existing recipe

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `recipeId`: UUID of the recipe

**Request Body (all fields optional):**
```json
{
  "title": "Updated Recipe Title",
  "description": "Updated description",
  "cookingTime": 60,
  "servings": 10,
  "imageUrl": "https://example.com/new-image.jpg"
}
```

**Success Response (200):**
```json
{
  "message": "Recipe updated successfully",
  "recipe": {
    "id": "uuid-here",
    "title": "Updated Recipe Title",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `403`: Not the recipe owner
- `404`: Recipe not found

---

#### 13. Delete Recipe

**Endpoint:** `DELETE /api/recipes/:recipeId`  
**Access:** Protected (Owner only)  
**Description:** Delete a recipe

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `recipeId`: UUID of the recipe

**Success Response (200):**
```json
{
  "message": "Recipe deleted successfully"
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `403`: Not the recipe owner
- `404`: Recipe not found

---

#### 14. Like/Unlike Recipe

**Endpoint:** `POST /api/recipes/:recipeId/like`  
**Access:** Protected  
**Description:** Toggle like status for a recipe

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `recipeId`: UUID of the recipe

**Success Response (200):**
```json
{
  "message": "Recipe liked successfully",
  "liked": true,
  "totalLikes": 11
}
```

**Or if unliking:**
```json
{
  "message": "Recipe unliked successfully",
  "liked": false,
  "totalLikes": 10
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `404`: Recipe not found

**Note:** Uses database transactions and row-level locking to prevent race conditions.

---

#### 15. Favorite/Unfavorite Recipe

**Endpoint:** `POST /api/recipes/:recipeId/favourite`  
**Access:** Protected  
**Description:** Toggle favorite status for a recipe

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `recipeId`: UUID of the recipe

**Success Response (200):**
```json
{
  "message": "Recipe favorited successfully",
  "favorited": true
}
```

**Or if unfavoriting:**
```json
{
  "message": "Recipe unfavorited successfully",
  "favorited": false
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `404`: Recipe not found

**Note:** Uses database transactions and row-level locking to prevent race conditions.

---

#### 16. Create Comment/Review

**Endpoint:** `POST /api/recipes/:recipeId/comments`  
**Access:** Protected  
**Description:** Add a comment/review to a recipe

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `recipeId`: UUID of the recipe

**Request Body:**
```json
{
  "rating": 5,
  "comment": "This recipe is amazing! Highly recommend."
}
```

**Validation Rules:**
- `rating`: Required, integer between 1 and 5
- `comment`: Optional, string

**Success Response (201):**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": "uuid-here",
    "rating": 5,
    "comment": "This recipe is amazing! Highly recommend.",
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "recipe": {
    "averageRating": 4.5
  }
}
```

**Error Responses:**
- `400`: Invalid rating (must be 1-5)
- `401`: Missing or invalid token
- `404`: Recipe not found

**Note:** Automatically recalculates recipe's average rating using database aggregation.

---

### Comment Endpoints

#### 17. Update Comment

**Endpoint:** `PUT /api/comments/:commentId`  
**Access:** Protected (Owner only)  
**Description:** Update a comment/review

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `commentId`: UUID of the comment

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated comment text"
}
```

**Validation Rules:**
- `rating`: Optional, integer between 1 and 5
- `comment`: Optional, string

**Success Response (200):**
```json
{
  "message": "Comment updated successfully",
  "comment": {
    "id": "uuid-here",
    "rating": 4,
    "comment": "Updated comment text"
  },
  "recipe": {
    "averageRating": 4.3
  }
}
```

**Error Responses:**
- `400`: Invalid rating
- `401`: Missing or invalid token
- `403`: Not the comment owner
- `404`: Comment not found

**Note:** Automatically recalculates recipe's average rating.

---

#### 18. Delete Comment

**Endpoint:** `DELETE /api/comments/:commentId`  
**Access:** Protected (Owner only)  
**Description:** Delete a comment/review

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `commentId`: UUID of the comment

**Success Response (200):**
```json
{
  "message": "Comment deleted successfully",
  "recipe": {
    "averageRating": 4.2
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `403`: Not the comment owner
- `404`: Comment not found

**Note:** Automatically recalculates recipe's average rating.

---

## Authentication & Security

### JWT Authentication Flow

1. **Registration/Login**: User provides credentials
2. **Token Generation**: Server generates JWT token with user ID
3. **Token Storage**: Client stores token (localStorage/sessionStorage)
4. **Token Usage**: Client includes token in `Authorization` header for protected routes
5. **Token Validation**: Server validates token on each request
6. **Token Expiration**: Tokens expire after 30 days

### Security Measures

1. **Password Hashing**: All passwords are hashed using bcryptjs before storage
2. **JWT Tokens**: Stateless authentication with 30-day expiration
3. **Input Validation**: All user inputs are validated on the server
4. **SQL Injection Protection**: Sequelize ORM prevents SQL injection
5. **Environment Variables**: Sensitive data (DB password, JWT secret) stored in `.env`
6. **CORS Configuration**: Configured to allow only frontend origin
7. **Error Messages**: Generic error messages to prevent information leakage
8. **Database Transactions**: Used for critical operations to ensure data consistency
9. **Row-Level Locking**: Prevents race conditions in like/favorite operations

### Environment Variables

Required environment variables (stored in `.env` file):

```env
# Database Configuration
DB_NAME=TastyHub
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5500

# JWT Secret (CRITICAL - Must be strong and random!)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

**Security Notes:**
- `DB_PASSWORD` and `JWT_SECRET` are **required** - server will exit if missing
- Never commit `.env` file to version control
- Generate strong JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "message": "Human-readable error message"
}
```

In development mode, additional error details may be included:

```json
{
  "message": "Error description",
  "stack": "Error stack trace (development only)"
}
```

### Error Types

#### Validation Errors (400)
- Missing required fields
- Invalid data format
- Data constraints violated
- Example: "Username must be at least 3 characters long"

#### Authentication Errors (401)
- Missing token
- Invalid token
- Expired token
- Example: "Access denied. No valid token provided."

#### Authorization Errors (403)
- User lacks permission
- Not resource owner
- Example: "You don't have permission to update this recipe"

#### Not Found Errors (404)
- Resource doesn't exist
- Example: "Recipe not found"

#### Server Errors (500)
- Database connection issues
- Unexpected server errors
- Example: "Something went wrong on the server"

#### Service Unavailable (503)
- Database connection failed
- Example: "Database connection failed. Please try again later."

### Error Handling Middleware

The server uses centralized error handling middleware that:
- Catches all errors from route handlers
- Formats errors consistently
- Logs errors for debugging
- Prevents server crashes
- Provides user-friendly error messages

---

## Development Workflow

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup

1. **Clone repository and navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up database:**
   - Create PostgreSQL database: `TastyHub`
   - Run SQL schema: `RecipeApp-Database-main/RecipeApp-Database-main/Tasty-Hub.sql`

4. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

### Code Quality Tools

#### Linting
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting issues
```

#### Formatting
```bash
npm run format        # Format all code
npm run format:check  # Check formatting
```

### Testing

#### Prerequisites
1. Start the server: `npm run dev`
2. Run tests in a separate terminal

#### Run Tests
```bash
npm test              # Run all tests (headless)
npm run test:open     # Open Cypress test runner (interactive)
npm run test:api      # Run only API endpoint tests
```

#### Test Structure
- Test files: `cypress/e2e/api/`
- Custom commands: `cypress/support/e2e.js`
- Coverage: All API endpoints (users, recipes, comments)

### Git Workflow

1. Create feature branch from `develop`
2. Make changes
3. Write/update tests
4. Run linter and formatter
5. Ensure all tests pass
6. Submit pull request

---

## Deployment

> **Note:** This section will be expanded after DevOps integration.

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique `JWT_SECRET`
- [ ] Use secure database credentials
- [ ] Configure CORS for production frontend URL
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Configure SSL/TLS
- [ ] Set up environment variables securely
- [ ] Test all endpoints in production environment

### Environment Variables (Production)

```env
NODE_ENV=production
DB_PASSWORD=<secure_production_password>
JWT_SECRET=<strong_random_secret>
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error:**
```
❌ Unable to connect to the database: ...
```

**Solutions:**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `TastyHub`
- Verify `DB_PORT` matches PostgreSQL port
- Check firewall settings

#### 2. JWT_SECRET Not Set

**Error:**
```
❌ ERROR: JWT_SECRET environment variable is required!
```

**Solutions:**
- Add `JWT_SECRET` to `.env` file
- Generate secure secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Restart server after adding

#### 3. DB_PASSWORD Not Set

**Error:**
```
❌ ERROR: DB_PASSWORD environment variable is required!
```

**Solutions:**
- Add `DB_PASSWORD` to `.env` file
- Use your PostgreSQL password
- Restart server after adding

#### 4. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
- Change `PORT` in `.env` to different port
- Or stop the process using port 5000
- Check: `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)

#### 5. Validation Errors

**Error:**
```
400 Bad Request - Validation error
```

**Solutions:**
- Check request body format (must be JSON)
- Verify required fields are present
- Check data types match expected format
- Review validation rules in API documentation

#### 6. Authentication Errors

**Error:**
```
401 Unauthorized - Access denied. No valid token provided.
```

**Solutions:**
- Ensure token is included in `Authorization` header
- Format: `Authorization: Bearer <token>`
- Verify token hasn't expired (30 days)
- Re-login to get new token

#### 7. CORS Errors (Frontend)

**Error:**
```
Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions:**
- Verify `FRONTEND_URL` in `.env` matches frontend URL
- Check CORS configuration in `index.js`
- Ensure credentials are enabled if using cookies

#### 8. Test Failures

**Error:**
```
Cypress tests failing
```

**Solutions:**
- Ensure server is running: `npm run dev`
- Check database connection
- Verify test data hasn't been modified
- Clear database and re-run tests
- Check Cypress configuration in `cypress.config.js`

### Debugging Tips

1. **Enable Debug Logging:**
   - Set `NODE_ENV=development` in `.env`
   - Check console for detailed error messages

2. **Check Database:**
   - Verify tables exist: `\dt` in PostgreSQL
   - Check data: `SELECT * FROM users LIMIT 5;`

3. **Test Endpoints:**
   - Use Postman or similar tool
   - Check `API_ENDPOINTS_TESTING.md` for examples
   - Verify request format matches documentation

4. **Check Logs:**
   - Server logs show request details in development
   - Check for error stack traces
   - Verify middleware execution order

---

## Additional Resources

- **Quick Start Guide**: See `README.md`
- **API Testing Guide**: See `API_ENDPOINTS_TESTING.md`
- **API Endpoints JSON**: See `API_ENDPOINTS.json`

---

## Version History

- **v1.0.0** (Current): Initial release with full CRUD operations, authentication, and social features

---

## License

ISC

---

**Last Updated:** January 2025








