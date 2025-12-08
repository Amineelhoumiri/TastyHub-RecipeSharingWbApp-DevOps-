// API client for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Export API_BASE_URL for use in Google OAuth and other external redirects
export { API_BASE_URL };

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
  getRecipes: async (search = '', tag = '', limit = null) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    if (limit) params.append('pageSize', limit);

    const url = `${API_BASE_URL}/api/recipes${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch recipes');
    const data = await response.json();

    // Filter out test recipes
    const isTestRecipe = (recipe) => {
      const username = recipe.author?.username || recipe.username || '';
      const title = recipe.title || '';

      const usernameLower = username.toLowerCase();
      const titleLower = title.toLowerCase();

      // 1. Filter out users that are clearly test users
      if (usernameLower.includes('test') ||
        usernameLower.includes('dummy') ||
        usernameLower.includes('mock')) {
        return true;
      }

      // 2. Filter out obvious "automated" test recipes
      if (/^(my )?recipe\s*\d{5,}/i.test(title)) {
        return true;
      }

      // Matches titles that are just a long number (timestamp)
      if (/^\d{10,}$/.test(title)) {
        return true;
      }

      // Matches "Test Recipe" or "Demo Recipe" exactly or with numbers
      if (/^(test|demo)\s*recipe/i.test(title)) {
        return true;
      }

      return false;
    };

    // Transform and filter recipes
    if (data.recipes && Array.isArray(data.recipes)) {
      return data.recipes
        .filter(recipe => !isTestRecipe(recipe))
        .map(recipe => ({
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
          userId: recipe.author?.id || recipe.userId || recipe.user_id || null,
          tags: recipe.tags || []
        }));
    }
    return Array.isArray(data) ? data.filter(recipe => !isTestRecipe(recipe)) : [];
  },

  getPopularTags: async () => {
    const response = await fetch(`${API_BASE_URL}/api/recipes/tags/popular`, {
      headers: getHeaders(false),
    });
    if (!response.ok) throw new Error('Failed to fetch popular tags');
    const data = await response.json();
    return data.tags || [];
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
        userId: recipe.author?.id || recipe.userId || recipe.user_id || null,
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        reviews: (recipe.reviews || recipe.Reviews || []).map(review => ({
          id: review.id,
          comment: review.comment,
          rating: review.rating,
          createdAt: review.createdAt,
          User: review.User || review.user || {},
          username: review.User?.username || review.user?.username || review.username || 'Anonymous',
          userId: review.User?.id || review.user?.id || review.userId || null
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

  updateComment: async (recipeId, commentId, comment, rating = null) => {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/comments/${commentId}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ comment, rating }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to update comment');
    return data;
  },

  deleteComment: async (recipeId, commentId) => {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to delete comment');
    return data;
  },

  favoriteRecipe: async (recipeId) => {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/favourite`, {
      method: 'POST',
      headers: getHeaders(true),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response. Status: ${response.status}. ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to toggle favorite');
    }
    return data;
  },

  unfavoriteRecipe: async (recipeId) => {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/favourite`, {
      method: 'POST',
      headers: getHeaders(true),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response. Status: ${response.status}. ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to toggle favorite');
    }
    return data;
  },

  updateRecipe: async (recipeId, recipeData) => {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(recipeData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to update recipe');
    return data;
  },

  deleteRecipe: async (recipeId) => {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to delete recipe');
    return data;
  },

  getUserProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to fetch profile');
    return data.user || data;
  },

  getUserProfileById: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      headers: getHeaders(false),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response. Status: ${response.status}. ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch user profile');
    }
    return data.user || data;
  },

  updateUserProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to update profile');
    return data;
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile/picture`, {
      method: 'PUT',
      headers,
      body: formData,
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response. Status: ${response.status}. ${text.substring(0, 100)}`);
    }

    const data = await response.json();

    if (response.status === 501) {
      throw new Error('Profile picture upload is not yet implemented on the backend. Please contact the development team.');
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to upload profile picture');
    }
    return data;
  },

  uploadRecipeImage: async (file) => {
    const formData = new FormData();
    formData.append('recipeImage', file);

    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/recipes/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response. Status: ${response.status}. ${text.substring(0, 100)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to upload recipe image');
    }
    return data;
  },

  getUserRecipes: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/recipes`, {
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to fetch user recipes');
    return Array.isArray(data.recipes) ? data.recipes : Array.isArray(data) ? data : [];
  },

  getUserFavorites: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/favorites`, {
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to fetch favorites');
    return Array.isArray(data.recipes) ? data.recipes : Array.isArray(data) ? data : [];
  },

  updateUserPreferences: async (preferences) => {
    const response = await fetch(`${API_BASE_URL}/api/users/preferences`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(preferences),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to update preferences');
    return data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to change password');
    return data;
  },

  // --- Admin Routes ---

  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to fetch users');
    return data;
  },

  createUserAdmin: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to create user');
    return data;
  },

  getAllRecipesAdmin: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/recipes`, {
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to fetch recipes');
    return data;
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to delete user');
    return data;
  },

  updateUserAdmin: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to update user');
    return data;
  },

  deleteRecipeAdmin: async (recipeId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/recipes/${recipeId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to delete recipe');
    return data;
  },

  deleteCommentAdmin: async (commentId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to delete comment');
    return data;
  }
};
