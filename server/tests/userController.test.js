const mockStatus = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock('../models', () => {
  const User = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn()
  };

  return {
    User,
    Recipe: {},
    Favorite: {},
    Like: {}
  };
});

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(() => Promise.resolve('test-salt')),
  hash: jest.fn(() => Promise.resolve('hashed-pass')),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-jwt-token')
}));

const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser } = require('../controllers/userController');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'super-secret';
});

describe('registerUser', () => {
  it('returns 400 when required fields are missing', async () => {
    const req = { body: { email: '', password: '' } };
    const res = mockStatus();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Please fill in all fields' })
    );
  });

  it('creates a user and returns a token when data is valid', async () => {
    User.findOne
      .mockResolvedValueOnce(null) // email check
      .mockResolvedValueOnce(null); // username check
    User.create.mockResolvedValue({
      id: 1,
      username: 'chefSam',
      email: 'chef@example.com'
    });

    const req = {
      body: { username: 'chefSam', email: 'chef@example.com', password: 'supersecret' }
    };
    const res = mockStatus();

    await registerUser(req, res);

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('supersecret', 'test-salt');
    expect(User.create).toHaveBeenCalledWith({
      username: 'chefSam',
      email: 'chef@example.com',
      password: 'hashed-pass'
    });
    expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, 'super-secret', { expiresIn: '30d' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User registered successfully!',
        token: 'fake-jwt-token',
        user: expect.objectContaining({
          id: 1,
          username: 'chefSam',
          email: 'chef@example.com'
        })
      })
    );
  });
});

describe('loginUser', () => {
  it('rejects unknown emails', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { email: 'ghost@example.com', password: 'password123' } };
    const res = mockStatus();

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });
});



