const request = require('supertest');

// Define mocks first
jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 1, username: 'testuser' };
  next();
});

jest.mock('../../models', () => ({
  Recipe: {
    count: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    belongsTo: jest.fn(),
    hasMany: jest.fn(),
    belongsToMany: jest.fn()
  },
  User: {
    findByPk: jest.fn(),
    hasMany: jest.fn(),
    belongsToMany: jest.fn(),
    belongsTo: jest.fn()
  },
  sequelize: {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn()
    })),
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true)
  },
  RecipeIngredient: { create: jest.fn(), belongsTo: jest.fn() },
  RecipeStep: { create: jest.fn(), belongsTo: jest.fn() },
  Tag: { findOrCreate: jest.fn(), belongsToMany: jest.fn() },
  RecipeTag: { create: jest.fn(), destroy: jest.fn() },
  Review: { create: jest.fn(), belongsTo: jest.fn() },
  Like: { findOne: jest.fn(), findOrCreate: jest.fn(), destroy: jest.fn(), belongsTo: jest.fn() },
  Favorite: { findOne: jest.fn(), findOrCreate: jest.fn(), destroy: jest.fn(), belongsTo: jest.fn() },
  ActivityLog: { belongsTo: jest.fn() }
}));

// Import app after mocks are defined
const app = require('../../index');
const { Recipe } = require('../../models');

describe('Recipe Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // We don't need to close connection because it's mocked

  describe('GET /api/recipes', () => {
    it('should return empty list when no recipes exist', async () => {
      Recipe.count.mockResolvedValue(0);
      Recipe.findAll.mockResolvedValue([]);

      const res = await request(app).get('/api/recipes');

      expect(res.statusCode).toBe(200);
      expect(res.body.recipes).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('should return recipes when they exist', async () => {
      Recipe.count.mockResolvedValue(1);
      Recipe.findAll.mockResolvedValue([{
        id: 1,
        title: 'Test Pasta',
        description: 'Delicious pasta',
        userId: 1,
        User: { username: 'chef123' },
        toJSON: () => ({ id: 1, title: 'Test Pasta' })
      }]);

      const res = await request(app).get('/api/recipes');

      expect(res.statusCode).toBe(200);
      expect(res.body.recipes).toHaveLength(1);
      expect(res.body.recipes[0].title).toBe('Test Pasta');
    });
  });

  describe('POST /api/recipes', () => {
    it('should create a new recipe', async () => {
      const recipeData = {
        title: 'New Recipe',
        description: 'Test description',
        cookingTime: 45,
        servings: 2,
        ingredients: [{ name: 'Flour', quantity: 500, unit: 'g' }],
        steps: [{ instruction: 'Mix everything' }]
      };

      Recipe.create.mockResolvedValue({
        id: 1,
        ...recipeData,
        userId: 1
      });

      Recipe.findByPk.mockResolvedValue({
        id: 1,
        ...recipeData,
        User: { id: 1, username: 'testuser' },
        ingredients: [],
        steps: []
      });

      const res = await request(app)
        .post('/api/recipes')
        .send(recipeData);

      expect(res.statusCode).toBe(201);
      expect(res.body.recipe.title).toBe('New Recipe');
      expect(Recipe.create).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .send({ description: 'Missing title' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Title is required');
    });
  });

  describe('GET /api/recipes/:id', () => {
    it('should return 404 for non-existent recipe', async () => {
      Recipe.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/api/recipes/99999');
      expect(res.statusCode).toBe(404);
    });

    it('should return recipe details', async () => {
      Recipe.findByPk.mockResolvedValue({
        id: 1,
        title: 'Test Recipe',
        User: { username: 'chef123' },
        ingredients: [],
        steps: [],
        Reviews: []
      });

      const res = await request(app).get('/api/recipes/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.recipe.title).toBe('Test Recipe');
    });
  });
});
