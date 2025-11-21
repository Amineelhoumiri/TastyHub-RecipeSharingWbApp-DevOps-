// API utilities for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const api = {
  getRecipes: async (search = '', tag = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    
    const url = `${API_BASE_URL}/api/recipes${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch recipes');
    const data = await response.json();
    
    // Transform backend response to match frontend format
    if (data.recipes && Array.isArray(data.recipes)) {
      return data.recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.imageUrl || recipe.image_url,
        cooking_time: recipe.cookingTime || recipe.cooking_time,
        servings: recipe.servings,
        average_rating: (() => {
          const rating = recipe.averageRating || recipe.average_rating;
          if (rating === null || rating === undefined) return 0;
          const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
          return isNaN(numRating) ? 0 : numRating;
        })(),
        username: recipe.author?.username || recipe.username || 'Unknown',
        tags: recipe.tags || []
      }));
    }
    return Array.isArray(data) ? data : [];
  },

  getRecipe: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch recipe');
    const data = await response.json();
    
    if (data.recipe) {
      const recipe = data.recipe;
      return {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.imageUrl || recipe.image_url,
        cooking_time: recipe.cookingTime || recipe.cooking_time,
        servings: recipe.servings,
        average_rating: (() => {
          const rating = recipe.averageRating || recipe.average_rating;
          if (rating === null || rating === undefined) return 0;
          const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
          return isNaN(numRating) ? 0 : numRating;
        })(),
        username: recipe.author?.username || recipe.username || 'Unknown',
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        reviews: (recipe.reviews || recipe.Reviews || []).map(review => ({
          id: review.id,
          comment: review.comment,
          rating: review.rating,
          createdAt: review.createdAt,
          User: review.User || review.user || {},
          username: review.User?.username || review.user?.username || review.username || 'Anonymous'
        })),
        total_likes: recipe.totalLikes || recipe.total_likes || 0,
        isLiked: recipe.isLiked || false,
        isFavorited: recipe.isFavorited || false
      };
    }
    return data;
  },

  createRecipe: async (recipeData) => {
    const response = await fetch(`${API_BASE_URL}/api/recipes`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(recipeData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to create recipe');
    
    // Handle Sequelize model format
    if (data.recipe) {
      if (!data.recipe.id) {
        if (data.recipe.dataValues && data.recipe.dataValues.id) {
          data.recipe.id = data.recipe.dataValues.id;
        } else if (data.recipe.get && typeof data.recipe.get === 'function') {
          try {
            data.recipe.id = data.recipe.get('id') || data.recipe.id;
          } catch (e) {
            console.warn('Could not extract id from Sequelize model:', e);
          }
        }
      }
      
      if (data.recipe.id && typeof data.recipe.id !== 'string') {
        data.recipe.id = String(data.recipe.id);
      }
    }
    
    return data;
  },

  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Registration failed');
    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Login failed');
    return data;
  },

  likeRecipe: async (recipeId) => {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/like`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to like recipe');
    return data;
  },

  createComment: async (recipeId, comment, rating = null) => {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/comments`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ comment, rating }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to create comment');
    return data;
  },
};
