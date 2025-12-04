const httpMocks = require('node-mocks-http');


// Mock winston
jest.mock('winston', () => {
  const mFormat = {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    splat: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    printf: jest.fn(),
    simple: jest.fn()
  };
  const mTransports = {
    Console: jest.fn(),
    File: jest.fn()
  };
  const mLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    add: jest.fn()
  };
  return {
    format: mFormat,
    transports: mTransports,
    createLogger: jest.fn(() => mLogger)
  };
});

// Import middleware AFTER mocking winston
const { requestLogger, logger } = require('../../middleware/logger');

describe('Logger Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'jest-test'
      }
    });
    res = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter
    });
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should log info for success status codes', () => {
    requestLogger(req, res, next);

    // Simulate request finish
    res.statusCode = 200;
    res.emit('finish');

    expect(next).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('HTTP Request', expect.any(Object));
  });

  it('should log warn for error status codes', () => {
    requestLogger(req, res, next);

    // Simulate request finish
    res.statusCode = 404;
    res.emit('finish');

    expect(next).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('HTTP Request', expect.any(Object));
  });
});
