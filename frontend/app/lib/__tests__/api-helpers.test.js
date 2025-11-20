import { api } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Helper Functions', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    // Reset module to clear any cached values
    jest.resetModules();
  });

  describe('Authentication headers', () => {
    it('should include Authorization header when token exists', async () => {
      localStorage.setItem('token', 'test-token-123');
      
      // Re-import to get fresh module with updated localStorage
      const { api: freshApi } = require('../api');
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ recipes: [] }),
      });

      await freshApi.getRecipes();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
    });

    it('should not include Authorization header when token does not exist', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ recipes: [] }),
      });

      await api.getRecipes();

      const callArgs = fetch.mock.calls[0];
      const headers = callArgs[1].headers;
      
      expect(headers).not.toHaveProperty('Authorization');
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getRecipes()).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(api.getRecipes()).rejects.toThrow();
    });
  });

  describe('Data transformation', () => {
    it('should transform recipe data correctly', async () => {
      const mockData = {
        recipes: [
          {
            id: '1',
            title: 'Test',
            imageUrl: 'test.jpg',
            cookingTime: 30,
            averageRating: null,
            author: null,
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.getRecipes();

      expect(result[0]).toMatchObject({
        id: '1',
        title: 'Test',
        image_url: 'test.jpg',
        cooking_time: 30,
        average_rating: 0,
        username: 'Unknown',
      });
    });

    it('should handle missing optional fields', async () => {
      const mockData = {
        recipes: [
          {
            id: '1',
            title: 'Test',
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.getRecipes();

      expect(result[0]).toMatchObject({
        id: '1',
        title: 'Test',
        description: undefined,
        image_url: undefined,
        cooking_time: undefined,
        servings: undefined,
        average_rating: 0,
        username: 'Unknown',
        tags: [],
      });
    });
  });
});



