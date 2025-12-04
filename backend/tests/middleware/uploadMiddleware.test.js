const uploadMiddleware = require('../../middleware/uploadMiddleware');
const multer = require('multer');


jest.mock('multer', () => {
  const multerMock = jest.fn(() => ({
    single: jest.fn(() => 'middleware_function')
  }));
  multerMock.diskStorage = jest.fn(() => 'storage_config');
  return multerMock;
});

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn()
}));

describe('Upload Middleware', () => {
  it('should export upload middlewares', () => {
    expect(uploadMiddleware.uploadProfilePicture).toBeDefined();
    expect(uploadMiddleware.uploadRecipeImage).toBeDefined();
  });

  it('should configure storage correctly', () => {
    // Access the storage configuration function passed to multer
    const storageConfig = multer.diskStorage.mock.calls[0][0];

    const req = { user: { id: 1 } };
    const file = { originalname: 'test.jpg' };
    const cb = jest.fn();

    // Test destination
    storageConfig.destination(req, file, cb);
    expect(cb).toHaveBeenCalledWith(null, expect.stringContaining('uploads'));

    // Test filename
    storageConfig.filename(req, file, cb);
    expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/1-\d+\.jpg/));
  });

  it('should filter files correctly', () => {
    // Access the fileFilter function passed to multer
    const multerConfig = multer.mock.calls[0][0];
    const fileFilter = multerConfig.fileFilter;

    const req = {};
    const cb = jest.fn();

    // Valid file
    fileFilter(req, { originalname: 'test.jpg', mimetype: 'image/jpeg' }, cb);
    expect(cb).toHaveBeenCalledWith(null, true);

    // Invalid file
    fileFilter(req, { originalname: 'test.txt', mimetype: 'text/plain' }, cb);
    expect(cb).toHaveBeenCalledWith(expect.any(Error));
  });
});
