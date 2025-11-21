import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../page';
import { api } from '../../lib/api';

// Mock the API
jest.mock('../../lib/api', () => ({
  api: {
    login: jest.fn(),
  },
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Mock localStorage methods
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
  });

  it('should render login form', () => {
    render(<LoginPage />);

    expect(screen.getByText('Login to TastyHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show error message when login fails', async () => {
    const user = userEvent.setup();
    api.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should successfully login and redirect', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      token: 'test-token',
      user: { id: '1', username: 'testuser' },
    };
    api.login.mockResolvedValueOnce(mockResponse);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockResponse.user)
      );
      expect(mockPush).toHaveBeenCalledWith('/recipes');
    });
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    api.login.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ token: 'test' }), 100))
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should show redirect message when redirectTo is /recipes/new', () => {
    jest.spyOn(require('next/navigation'), 'useSearchParams').mockReturnValue({
      get: jest.fn(() => '/recipes/new'),
    });

    render(<LoginPage />);

    expect(
      screen.getByText('Please login to create a new recipe')
    ).toBeInTheDocument();
  });

  it('should require email and password fields', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});
