const optionalAuthMiddleware = require('../../middleware/optionalAuthMiddleware');
const { User } = require('../../models');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');

jest.mock('../../models');
jest.mock('jsonwebtoken');

describe('Optional Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
    jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  it('should continue without user if no token', async () => {
    req.headers.authorization = '';
    await optionalAuthMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it('should attach user if token is valid', async () => {
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify.mockReturnValue({ id: 1 });
    User.findByPk.mockResolvedValue({ id: 1, username: 'user' });

    await optionalAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
  });

  it('should continue without user if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalidtoken';
    jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

    await optionalAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it('should continue without user if user not found', async () => {
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify.mockReturnValue({ id: 1 });
    User.findByPk.mockResolvedValue(null);

    await optionalAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it('should continue if JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;
    req.headers.authorization = 'Bearer token';

    await optionalAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });
});
