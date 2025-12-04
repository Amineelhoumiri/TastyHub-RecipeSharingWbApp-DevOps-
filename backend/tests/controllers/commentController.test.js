const commentController = require('../../controllers/commentController');
const { Review, Recipe } = require('../../models');
const httpMocks = require('node-mocks-http');

jest.mock('../../models', () => ({
  Review: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  },
  Recipe: {
    findByPk: jest.fn()
  },
  User: {},
  sequelize: {
    fn: jest.fn(),
    col: jest.fn()
  }
}));

describe('Comment Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('updateComment', () => {
    it('should update a comment', async () => {
      req.params.commentId = 1;
      req.user = { id: 1 };
      req.body = { comment: 'Updated comment', rating: 4 };

      const mockReview = {
        id: 1,
        userId: 1,
        recipeId: 1,
        update: jest.fn()
      };
      Review.findByPk.mockResolvedValueOnce(mockReview).mockResolvedValueOnce(mockReview);
      Recipe.findByPk.mockResolvedValue({ update: jest.fn() });
      Review.findOne.mockResolvedValue({ averageRating: 4.5 });

      await commentController.updateComment(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockReview.update).toHaveBeenCalled();
    });

    it('should prevent non-owners from updating', async () => {
      req.params.commentId = 1;
      req.user = { id: 2 }; // Different user

      const mockReview = { id: 1, userId: 1 };
      Review.findByPk.mockResolvedValue(mockReview);

      await commentController.updateComment(req, res);

      expect(res.statusCode).toBe(403);
    });

    it('should return 404 if comment not found', async () => {
      req.params.commentId = 999;
      Review.findByPk.mockResolvedValue(null);

      await commentController.updateComment(req, res);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment by owner', async () => {
      req.params.commentId = 1;
      req.user = { id: 1 };

      const mockReview = {
        id: 1,
        userId: 1,
        recipeId: 1,
        rating: 5,
        destroy: jest.fn()
      };
      Review.findByPk.mockResolvedValue(mockReview);
      Recipe.findByPk.mockResolvedValue({ update: jest.fn() });
      Review.findOne.mockResolvedValue({ averageRating: 4.0 });

      await commentController.deleteComment(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockReview.destroy).toHaveBeenCalled();
    });

    it('should allow admin to delete any comment', async () => {
      req.params.commentId = 1;
      req.user = { id: 2, isAdmin: true }; // Admin user

      const mockReview = {
        id: 1,
        userId: 1, // Different owner
        destroy: jest.fn()
      };
      Review.findByPk.mockResolvedValue(mockReview);

      await commentController.deleteComment(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockReview.destroy).toHaveBeenCalled();
    });

    it('should prevent non-owners from deleting', async () => {
      req.params.commentId = 1;
      req.user = { id: 2, isAdmin: false };

      const mockReview = { id: 1, userId: 1 };
      Review.findByPk.mockResolvedValue(mockReview);

      await commentController.deleteComment(req, res);

      expect(res.statusCode).toBe(403);
    });
  });
});
