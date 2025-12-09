import { api } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Utility', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  describe('getRecipes', () => {
    it('should fetch recipes successfully', async () => {
      const mockRecipes = {
        recipes: [
          {
            id: '1',
            title: 'Delicious Pasta',
            description: 'A wonderful pasta dish',
            imageUrl: 'pasta.jpg',
            cookingTime: 30,
            servings: 4,
            averageRating: 4.5,
            author: { username: 'chef123' },
            tags: ['dinner'],
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecipes,
      });

      const result = await api.getRecipes();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/recipes',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '1',
        title: 'Delicious Pasta',
        description: 'A wonderful pasta dish',
        image_url: 'pasta.jpg',
        cooking_time: 30,
        servings: 4,
        average_rating: 4.5,
        username: 'chef123',
        tags: ['dinner'],
      });
    });

    it('should include search parameter when provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ recipes: [] }),
      });

      await api.getRecipes('pasta');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/recipes?search=pasta',
        expect.any(Object)
      );
    });

    it('should include tag parameter when provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ recipes: [] }),
      });

      await api.getRecipes('', 'dinner');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/recipes?tag=dinner',
        expect.any(Object)
      );
    });

    it('should throw error when fetch fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(api.getRecipes()).rejects.toThrow('Failed to fetch recipes');
    });
  });

  describe('getRecipe', () => {
    it('should fetch a single recipe successfully', async () => {
      const mockRecipe = {
        recipe: {
          id: '1',
          title: 'Test Recipe',
          description: 'Test Description',
          imageUrl: 'test.jpg',
          ingredients: [],
          steps: [],
          reviews: [],
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecipe,
      });

      const result = await api.getRecipe('1');

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/recipes/1', expect.any(Object));
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('title', 'Test Recipe');
    });

    it('should throw error when fetch fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(api.getRecipe('1')).rejects.toThrow('Failed to fetch recipe');
    });
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const mockResponse = {
        token: 'test-token',
        user: { id: '1', username: 'testuser' },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.register('testuser', 'test@example.com', 'password123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/register',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error with message when registration fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      });

      await expect(api.register('testuser', 'test@example.com', 'password123')).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        token: 'test-token',
        user: { id: '1', username: 'testuser' },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.login('test@example.com', 'password123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when login fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      await expect(api.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('createRecipe', () => {
    it('should create a recipe successfully with auth token', async () => {
      localStorage.setItem('token', 'test-token');
      const mockRecipe = {
        recipe: {
          id: '1',
          title: 'New Recipe',
          description: 'Description',
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecipe,
      });

      const recipeData = {
        title: 'New Recipe',
        description: 'Description',
      };

      const result = await api.createRecipe(recipeData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/recipes',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify(recipeData),
        })
      );
      expect(result).toEqual(mockRecipe);
    });

    it('should throw error when creation fails', async () => {
      localStorage.setItem('token', 'test-token');
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(api.createRecipe({ title: 'Test' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('likeRecipe', () => {
    it('should like a recipe successfully', async () => {
      localStorage.setItem('token', 'test-token');
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Recipe liked' }),
      });

      const result = await api.likeRecipe('1');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/recipes/1/like',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual({ message: 'Recipe liked' });
    });
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      localStorage.setItem('token', 'test-token');
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ comment: { id: '1', comment: 'Great recipe!' } }),
      });

      const result = await api.createComment('1', 'Great recipe!', 5);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/recipes/1/comments',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify({
            comment: 'Great recipe!',
            rating: 5,
          }),
        })
      );
      expect(result).toHaveProperty('comment');
    });
  });
});
