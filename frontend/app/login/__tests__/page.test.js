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

// Mock Navbar and Footer components
jest.mock('../../components/Navbar', () => {
  return function Navbar() {
    return <nav>Navbar</nav>;
  };
});

jest.mock('../../components/Footer', () => {
  return function Footer() {
    return <footer>Footer</footer>;
  };
});

// Mock next/navigation
const mockPush = jest.fn();
const mockPathname = jest.fn(() => '/');
const mockGet = jest.fn(() => null);
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
  usePathname: () => mockPathname(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
    localStorage.clear();
    // Mock localStorage methods
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
  });

  it('should render login form', async () => {
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText('Login to TastyHub')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show error message when login fails', async () => {
    const user = userEvent.setup();
    api.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

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

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

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

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should show redirect message when redirectTo is /recipes/new', async () => {
    mockGet.mockReturnValue('/recipes/new');

    render(<LoginPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Please login to create a new recipe')
      ).toBeInTheDocument();
    });
  });

  it('should require email and password fields', async () => {
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});

