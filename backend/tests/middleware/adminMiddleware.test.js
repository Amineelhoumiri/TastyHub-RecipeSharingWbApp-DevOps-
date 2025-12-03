const adminMiddleware = require('../../middleware/adminMiddleware');
const httpMocks = require('node-mocks-http');

describe('Admin Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  it('should call next if user is admin', () => {
    req.user = { isAdmin: true };
    adminMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if user is not admin', () => {
    req.user = { isAdmin: false };
    adminMiddleware(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user is missing', () => {
    req.user = undefined;
    adminMiddleware(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
