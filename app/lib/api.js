// API service layer - handles all communication with the backend
// This keeps our API calls organized and reusable across components

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to make API calls with proper error handling
async function apiCall(endpoint, options = {}) {
  // Get the auth token from localStorage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Set up headers with authentication if we have a token
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Parse the response
    const data = await response.json();

    // If the response isn't ok, throw an error with the message from the server
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    // Re-throw the error so components can handle it
    throw error;
  }
}

// User-related API calls
export const userAPI = {
  // Register a new user account
  register: async (userData) => {
    return apiCall('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login with email and password
  login: async (credentials) => {
    return apiCall('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Get the current user's profile
  getProfile: async () => {
    return apiCall('/users/profile');
  },

  // Update the current user's profile
  updateProfile: async (userData) => {
    return apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Get all recipes created by the current user
  getUserRecipes: async () => {
    return apiCall('/users/recipes');
  },

  // Get all recipes favorited by the current user
  getFavorites: async () => {
    return apiCall('/users/favorites');
  },

  // Get all recipes liked by the current user
  getLiked: async () => {
    return apiCall('/users/liked');
  },

  // Update user preferences (like units, dark mode, etc.)
  updatePreferences: async (preferences) => {
    return apiCall('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
};

// Recipe-related API calls
export const recipeAPI = {
  // Get all recipes with pagination support
  getAll: async (page = 1, pageSize = 10) => {
    return apiCall(`/recipes?page=${page}&pageSize=${pageSize}`);
  },

  // Get a single recipe by its ID
  getById: async (id) => {
    return apiCall(`/recipes/${id}`);
  },

  // Create a new recipe (requires authentication)
  create: async (recipeData) => {
    return apiCall('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });
  },

  // Update an existing recipe (requires authentication and ownership)
  update: async (id, recipeData) => {
    return apiCall(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipeData),
    });
  },

  // Delete a recipe (requires authentication and ownership)
  delete: async (id) => {
    return apiCall(`/recipes/${id}`, {
      method: 'DELETE',
    });
  },

  // Like or unlike a recipe (toggles like status)
  like: async (id) => {
    return apiCall(`/recipes/${id}/like`, {
      method: 'POST',
    });
  },

  // Favorite or unfavorite a recipe (toggles favorite status)
  favorite: async (id) => {
    return apiCall(`/recipes/${id}/favourite`, {
      method: 'POST',
    });
  },

  // Add a comment to a recipe
  addComment: async (id, commentData) => {
    return apiCall(`/recipes/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },
};

// Comment-related API calls
export const commentAPI = {
  // Update an existing comment (requires authentication and ownership)
  update: async (id, commentData) => {
    return apiCall(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(commentData),
    });
  },

  // Delete a comment (requires authentication and ownership)
  delete: async (id) => {
    return apiCall(`/comments/${id}`, {
      method: 'DELETE',
    });
  },
};

