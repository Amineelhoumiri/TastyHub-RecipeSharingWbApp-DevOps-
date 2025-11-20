# Frontend Testing Guide

This document describes the testing setup and how to run tests for the TastyHub frontend.

## Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: For testing React components
- **@testing-library/user-event**: For simulating user interactions
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing

## Running Tests

### Run all tests
```bash
cd frontend
npm test
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run tests from root directory
```bash
npm run test:frontend
npm run test:frontend:watch
npm run test:frontend:coverage
```

## Test Structure

Tests are located next to the files they test, following the pattern:
```
app/
  lib/
    api.js
    __tests__/
      api.test.js
  login/
    page.js
    __tests__/
      page.test.js
```

## Writing Tests

### Example: Testing API utilities

```javascript
import { api } from '../api';

global.fetch = jest.fn();

describe('API Utility', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should fetch recipes successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ recipes: [] }),
    });

    const result = await api.getRecipes();
    expect(result).toBeDefined();
  });
});
```

### Example: Testing React Components

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

## Test Coverage

The project aims for good test coverage of:
- **API utilities** (`app/lib/api.js`): All API functions
- **Component logic**: Form validation, state management, user interactions
- **Helper functions**: Data transformation, error handling

**Note**: Page components (`page.js` files) are primarily tested via E2E tests with Cypress, not unit tests.

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`
- Only when frontend files are changed (path-based triggers)

See `.github/workflows/frontend-ci.yml` for the CI configuration.

## Mocking

### Next.js Router
The router is automatically mocked in `jest.setup.js`. You can access it via:
```javascript
import { useRouter } from 'next/navigation';
```

### localStorage
localStorage is automatically mocked. Use it normally in tests:
```javascript
localStorage.setItem('token', 'test-token');
```

### fetch API
Mock `fetch` globally for API tests:
```javascript
global.fetch = jest.fn();
fetch.mockResolvedValueOnce({ ok: true, json: async () => data });
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what users see and do
2. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test user flows**: Simulate real user interactions
4. **Keep tests isolated**: Each test should be independent
5. **Mock external dependencies**: API calls, router, localStorage, etc.

## Troubleshooting

### Tests fail with "Cannot find module"
- Ensure you're running tests from the `frontend` directory
- Check that `node_modules` is installed: `npm install`

### Tests timeout
- Increase timeout for slow tests: `jest.setTimeout(10000)`
- Check for unhandled promises or missing `await`

### Module resolution errors
- Check `jest.config.js` for correct `moduleNameMapper` settings
- Ensure imports use correct paths (relative or aliased)



