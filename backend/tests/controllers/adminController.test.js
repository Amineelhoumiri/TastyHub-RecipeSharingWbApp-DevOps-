const adminController = require('../../controllers/adminController');
const { User } = require('../../models');
const httpMocks = require('node-mocks-http');
const bcrypt = require('bcryptjs');

jest.mock('../../models');
jest.mock('bcryptjs');

describe('Admin Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' }
      ];
      User.findAll.mockResolvedValue(mockUsers);

      await adminController.getAllUsers(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().users).toHaveLength(2);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      req.params.userId = 2;
      req.user = { id: 1 }; // Admin ID

      const mockUser = { id: 2, destroy: jest.fn() };
      User.findByPk.mockResolvedValue(mockUser);

      await adminController.deleteUser(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockUser.destroy).toHaveBeenCalled();
    });

    it('should prevent deleting self', async () => {
      req.params.userId = 1;
      req.user = { id: 1 };

      await adminController.deleteUser(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toMatch(/cannot delete your own/);
    });

    it('should return 404 if user not found', async () => {
      req.params.userId = 999;
      req.user = { id: 1 };
      User.findByPk.mockResolvedValue(null);

      await adminController.deleteUser(req, res);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      req.params.userId = 2;
      req.body = { username: 'newname' };

      const mockUser = {
        id: 2,
        update: jest.fn(),
        username: 'oldname'
      };
      User.findByPk.mockResolvedValueOnce(mockUser).mockResolvedValueOnce({ ...mockUser, username: 'newname' });

      await adminController.updateUser(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockUser.update).toHaveBeenCalledWith(expect.objectContaining({ username: 'newname' }));
    });

    it('should update password if provided', async () => {
      req.params.userId = 2;
      req.body = { password: 'newpassword123' };

      const mockUser = { id: 2, update: jest.fn() };
      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');

      await adminController.updateUser(req, res);

      expect(mockUser.update).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed' }));
    });
  });
});
