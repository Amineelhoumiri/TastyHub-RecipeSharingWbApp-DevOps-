# API Endpoints Testing Guide

## Base URL

```
http://localhost:5000
```

## Important Notes

- For **Protected** endpoints, you need to include this header:
  ```
  Authorization: Bearer <your_token_here>
  ```
- Get your token from the **Register** or **Login** response
- All request bodies should be sent as **JSON** with `Content-Type: application/json`

---

## USER ENDPOINTS

### 1. Register User (Public)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/users/register`  
**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:** Returns token and user data

---

### 2. Login User (Public)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/users/login`  
**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:** Returns token and user data

---

### 3. Get User Profile (Protected)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/users/profile`  
**Headers:**

```
Authorization: Bearer <your_token_here>
```

**Body:** None

---

### 4. Update User Profile (Protected)

**Method:** `PUT`  
**URL:** `http://localhost:5000/api/users/profile`  
**Headers:**

```
Authorization: Bearer <your_token_here>
Content-Type: application/json
```

**Body:**

```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

_Note: You can provide just `username` OR just `email`, or both_

---

### 5. Update User Preferences (Protected)

**Method:** `PUT`  
**URL:** `http://localhost:5000/api/users/preferences`  
**Headers:**

```
Authorization: Bearer <your_token_here>
Content-Type: application/json
```

**Body:**

```json
{
  "darkMode": true,
  "units": "metric"
}
```

---

### 6. Get User's Recipes (Protected)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/users/recipes`  
**Headers:**

```
Authorization: Bearer <your_token_here>
```

**Body:** None

---

### 7. Get User's Favorites (Protected)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/users/favorites`  
**Headers:**

```
Authorization: Bearer <your_token_here>
```

**Body:** None

---

### 8. Get User's Liked Recipes (Protected)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/users/liked`  
**Headers:**

```
Authorization: Bearer <your_token_here>
```

**Body:** None

---

## 🍳 RECIPE ENDPOINTS

### 9. Get All Recipes (Public)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/recipes`  
**Headers:** None (optional: Authorization for logged-in users)  
**Body:** None

---

### 10. Get Recipe by ID (Public)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/recipes/:recipeId`  
**Example:** `http://localhost:5000/api/recipes/010dc286-e0a6-4a9c-985d-2b3ba8134023`  
**Headers:** None (optional: Authorization for logged-in users)  
**Body:** None

---

### 11. Create Recipe (Protected)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/recipes`  
**Headers:**

```
Authorization: Bearer <your_token_here>
Content-Type: application/json
```

**Body (Minimal - only title required):**

```json
{
  "title": "Chocolate Cake",
  "description": "A delicious chocolate cake recipe",
  "cookingTime": 45,
  "servings": 8,
  "imageUrl": "https://example.com/cake.jpg"
}
```

**Body (Full - with ingredients and steps):**

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
    },
    {
      "name": "Cocoa Powder",
      "quantity": 0.75,
      "unit": "cup",
      "notes": "Unsweetened"
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
      "instruction": "Mix dry ingredients together in a large bowl"
    },
    {
      "stepNumber": 3,
      "instruction": "Add wet ingredients and mix until smooth"
    }
  ],
  "tags": ["dessert", "chocolate", "cake"]
}
```

_Note: Only `title` is required. All other fields are optional._

---

### 12. Update Recipe (Protected)

**Method:** `PUT`  
**URL:** `http://localhost:5000/api/recipes/:recipeId`  
**Example:** `http://localhost:5000/api/recipes/010dc286-e0a6-4a9c-985d-2b3ba8134023`  
**Headers:**

```
Authorization: Bearer <your_token_here>
Content-Type: application/json
```

**Body:**

```json
{
  "title": "Updated Recipe Title",
  "description": "Updated description",
  "cookingTime": 60,
  "servings": 10,
  "imageUrl": "https://example.com/new-image.jpg"
}
```

_Note: All fields are optional - only include what you want to update_

---

### 13. Delete Recipe (Protected)

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/recipes/:recipeId`  
**Example:** `http://localhost:5000/api/recipes/010dc286-e0a6-4a9c-985d-2b3ba8134023`  
**Headers:**

```
Authorization: Bearer <your_token_here>
```

**Body:** None

---

### 14. Like Recipe (Protected)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/recipes/:recipeId/like`  
**Example:** `http://localhost:5000/api/recipes/010dc286-e0a6-4a9c-985d-2b3ba8134023/like`  
**Headers:**

```
Authorization: Bearer <your_token_here>
```

**Body:** None  
_Note: This toggles the like (if already liked, it unlikes)_

---

### 15. Favorite Recipe (Protected)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/recipes/:recipeId/favourite`  
**Example:** `http://localhost:5000/api/recipes/010dc286-e0a6-4a9c-985d-2b3ba8134023/favourite`  
**Headers:**

```
Authorization: Bearer <your_token_here>
```

**Body:** None  
_Note: This toggles the favorite (if already favorited, it unfavorites)_

---

### 16. Create Comment on Recipe (Protected)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/recipes/:recipeId/comments`  
**Example:** `http://localhost:5000/api/recipes/010dc286-e0a6-4a9c-985d-2b3ba8134023/comments`  
**Headers:**

```
Authorization: Bearer <your_token_here>
Content-Type: application/json
```

**Body:**

```json
{
  "comment": "This recipe is amazing!",
  "rating": 5
}
```

_Note: `comment` is required. `rating` is optional (1-5)_

---

## 💬 COMMENT ENDPOINTS

### 17. Update Comment (Protected)

**Method:** `PUT`  
**URL:** `http://localhost:5000/api/comments/:commentId`  
**Example:** `http://localhost:5000/api/comments/0a80fa14-db5e-4f5f-a88f-4ad082af7705`  
**Headers:**

```
Authorization: Bearer <your_token_here>
Content-Type: application/json
```

**Body:**

```json
{
  "comment": "Updated comment text",
  "rating": 4
}
```

_Note: Both fields are optional - include what you want to update_

---

### 18. Delete Comment (Protected)

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/comments/:commentId`  
**Example:** `http://localhost:5000/api/comments/0a80fa14-db5e-4f5f-a88f-4ad082af7705`  
**Headers:**

```
Authorization: Bearer <your_token_here>
```

**Body:** None

---

## 📝 Testing Workflow

### Step 1: Register a User

1. Use endpoint #1 (Register)
2. Copy the `token` from the response

### Step 2: Test Protected Endpoints

1. Use the token from Step 1
2. Add header: `Authorization: Bearer <token>`
3. Test any protected endpoint

### Step 3: Create a Recipe

1. Use endpoint #11 (Create Recipe) with your token
2. Copy the `recipe.id` from the response

### Step 4: Test Recipe Interactions

1. Use the recipe ID from Step 3
2. Test Like (#14), Favorite (#15), Comment (#16)

### Step 5: Test Other Endpoints

- Get all recipes (#9) - no auth needed
- Get recipe by ID (#10) - use recipe ID from Step 3
- Update/Delete your recipe (#12, #13)

---

## 🔧 Common Issues & Solutions

### Issue: "Request body is missing"

**Solution:**

- Make sure you're using the **BODY** tab in your REST client
- Select **JSON** format (not form-data or x-www-form-urlencoded)
- Add header: `Content-Type: application/json`

### Issue: "Access denied. No valid token provided"

**Solution:**

- Make sure you're logged in first (use Login endpoint)
- Copy the token from the login/register response
- Add header: `Authorization: Bearer <your_exact_token>`
- Make sure there's a space after "Bearer"

### Issue: "User with this email already exists"

**Solution:**

- Use a different email address
- Or use the Login endpoint instead

### Issue: "Recipe not found" or "Comment not found"

**Solution:**

- Make sure you're using a valid ID
- Get the ID from a previous response (create recipe/comment first)

---

## 📋 Quick Reference

**Public Endpoints (No Auth Required):**

- POST /api/users/register
- POST /api/users/login
- GET /api/recipes
- GET /api/recipes/:recipeId

**Protected Endpoints (Auth Required):**

- All other endpoints need `Authorization: Bearer <token>` header

**Units for Ingredients:**

- `"teaspoon"`, `"tablespoon"`, `"cup"`, `"gram"`, `"kilogram"`, `"ml"`, `"liter"`, `"piece"`, `"pinch"`, `"other"`

**Rating Range:**

- Must be between 1 and 5 (integer)

---

## All Endpoints Tested and Working!

All 18 endpoints have been tested and are functioning correctly. Happy testing! 🚀

