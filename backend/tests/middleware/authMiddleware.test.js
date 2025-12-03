const authMiddleware = require('../../middleware/authMiddleware');
const { User } = require('../../models');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');

jest.mock('../../models');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  it('should call next if token is valid', async () => {
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify.mockReturnValue({ id: 1 });
    User.findByPk.mockResolvedValue({ id: 1, username: 'user', isAdmin: false });

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
  });

  it('should return 401 if no token provided', async () => {
    req.headers.authorization = '';

    await authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalidtoken';
    jwt.verify.mockImplementation(() => {
      throw { name: 'JsonWebTokenError' };
    });

    await authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData().message).toMatch(/Invalid token/);
  });

  it('should return 401 if token is expired', async () => {
    req.headers.authorization = 'Bearer expiredtoken';
    jwt.verify.mockImplementation(() => {
      throw { name: 'TokenExpiredError' };
    });

    await authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData().message).toMatch(/Token has expired/);
  });

  it('should return 401 if user not found', async () => {
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify.mockReturnValue({ id: 1 });
    User.findByPk.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData().message).toMatch(/User not found/);
  });

  it.skip('should return 500 if JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;
    req.headers.authorization = 'Bearer token';

    await authMiddleware(req, res, next);

    expect(res.statusCode).toBe(500);
  });
});
