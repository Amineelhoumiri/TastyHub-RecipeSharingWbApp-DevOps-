const userController = require('../../controllers/userController');
const { User, Recipe } = require('../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');

// Mock dependencies
jest.mock('../../models');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
    jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null); // No existing user
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      jwt.sign.mockReturnValue('test_token');

      await userController.registerUser(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual({
        message: 'User registered successfully!',
        token: 'test_token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      });
    });

    it('should return 400 if fields are missing', async () => {
      req.body = { username: 'testuser' }; // Missing email/password

      await userController.registerUser(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: 'Please fill in all fields'
      });
    });

    it('should return 400 if user already exists', async () => {
      req.body = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await userController.registerUser(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: 'User with this email already exists'
      });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('test_token');

      await userController.loginUser(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: 'User logged in successfully!',
        token: 'test_token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      });
    });

    it('should return 400 for invalid credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await userController.loginUser(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: 'Invalid email or password'
      });
    });

    it('should return 400 if user not found', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);

      await userController.loginUser(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: 'Invalid email or password'
      });
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      req.user = { id: 1 };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        profilePicture: null,
        createdAt: new Date(),
        isAdmin: false
      };

      User.findByPk.mockResolvedValue(mockUser);

      await userController.getUserProfile(req, res);

      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data.user.username).toBe('testuser');
    });

    it('should return 404 if user not found', async () => {
      req.user = { id: 999 };
      User.findByPk.mockResolvedValue(null);

      await userController.getUserProfile(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: 'User not found'
      });
    });
  });

  describe('getUserById', () => {
    it('should return user public profile', async () => {
      req.params.userId = 1;
      const mockUser = { id: 1, username: 'testuser', profilePicture: 'pic.jpg' };
      User.findByPk.mockResolvedValue(mockUser);

      await userController.getUserById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().user.username).toBe('testuser');
    });

    it('should return 404 if user not found', async () => {
      req.params.userId = 999;
      User.findByPk.mockResolvedValue(null);

      await userController.getUserById(req, res);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      req.user = { id: 1 };
      req.body = { username: 'newname' };

      User.findOne.mockResolvedValue(null); // No conflict
      User.update.mockResolvedValue([1]);
      User.findByPk.mockResolvedValue({ id: 1, username: 'newname' });

      await userController.updateUserProfile(req, res);

      expect(res.statusCode).toBe(200);
      expect(User.update).toHaveBeenCalled();
    });

    it('should return 400 if username taken', async () => {
      req.user = { id: 1 };
      req.body = { username: 'taken' };

      User.findOne.mockResolvedValue({ id: 2 }); // Conflict

      await userController.updateUserProfile(req, res);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('updateProfilePicture', () => {
    it('should update profile picture', async () => {
      req.user = { id: 1 };
      req.file = { filename: 'newpic.jpg' };
      const mockUser = { id: 1, update: jest.fn() };
      User.findByPk.mockResolvedValue(mockUser);

      await userController.updateProfilePicture(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockUser.update).toHaveBeenCalled();
    });

    it('should return 400 if no file uploaded', async () => {
      req.user = { id: 1 };
      req.file = undefined;

      await userController.updateProfilePicture(req, res);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update preferences', async () => {
      req.user = { id: 1 };
      req.body = { darkMode: true, units: 'metric' };
      const mockUser = { id: 1 };
      User.findByPk.mockResolvedValue(mockUser);

      await userController.updateUserPreferences(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().preferences).toEqual({ darkMode: true, units: 'metric' });
    });
  });

  describe('getUserFavorites', () => {
    it('should return user favorites', async () => {
      req.user = { id: 1 };
      const { Favorite } = require('../../models');
      Favorite.findAll.mockResolvedValue([{ Recipe: { id: 1, title: 'Fav Recipe' } }]);

      await userController.getUserFavorites(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().recipes).toHaveLength(1);
    });
  });

  describe('getUserLikedRecipes', () => {
    it('should return user liked recipes', async () => {
      req.user = { id: 1 };
      const { Like } = require('../../models');
      Like.findAll.mockResolvedValue([{ Recipe: { id: 1, title: 'Liked Recipe' } }]);

      await userController.getUserLikedRecipes(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().recipes).toHaveLength(1);
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      req.user = { id: 1 };
      req.body = { currentPassword: 'old', newPassword: 'newpassword' };

      const mockUser = { id: 1, password: 'hashed', update: jest.fn() };
      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('newhashed');

      await userController.changePassword(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockUser.update).toHaveBeenCalled();
    });
  });

  describe('getUserRecipes', () => {
    it('should return user recipes', async () => {
      req.user = { id: 1 };
      Recipe.findAll.mockResolvedValue([{ id: 1, title: 'Recipe 1' }]);

      await userController.getUserRecipes(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().recipes).toHaveLength(1);
    });
  });

  describe('googleLogin', () => {
    it('should login existing google user', async () => {
      req.body = { token: 'google_token' };
      const mockUser = { id: 1, email: 'google_user@example.com' };
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('jwt_token');

      await userController.googleLogin(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().token).toBe('jwt_token');
    });

    it('should create new google user if not exists', async () => {
      req.body = { token: 'google_token' };
      User.findOne.mockResolvedValue(null); // Not found
      User.create.mockResolvedValue({ id: 1, email: 'google_user@example.com' });
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      jwt.sign.mockReturnValue('jwt_token');

      await userController.googleLogin(req, res);

      expect(res.statusCode).toBe(200);
      expect(User.create).toHaveBeenCalled();
    });
  });
});
