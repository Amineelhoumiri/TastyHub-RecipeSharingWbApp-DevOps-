# Frontend E2E Testing with Cypress

This directory contains end-to-end tests for the TastyHub frontend application.

## Prerequisites

Before running tests, make sure:

1. **Backend server is running** on `http://localhost:5000`
   ```bash
   cd server
   npm run dev
   ```

2. **Frontend server is running** on `http://localhost:3000`
   ```bash
   npm run dev
   ```

3. **Cypress is installed**
   ```bash
   npm install
   ```

## Running Tests

### Interactive Mode (Recommended for Development)
```bash
npm run test:open
```
This opens the Cypress Test Runner GUI where you can:
- Select which tests to run
- Watch tests execute in real-time
- Debug test failures

### Headless Mode (For CI/CD)
```bash
npm test
```
Runs all tests in headless mode without opening a browser window.

### Run Specific Test File
```bash
npx cypress run --spec "cypress/e2e/home.cy.js"
```

## Test Files

- `home.cy.js` - Tests for the home page
- `login.cy.js` - Tests for user login functionality
- `register.cy.js` - Tests for user registration
- `recipes.cy.js` - Tests for recipes listing page
- `recipe-detail.cy.js` - Tests for recipe detail page
- `navigation.cy.js` - Tests for navigation between pages

## Custom Commands

Available in `cypress/support/e2e.js`:

- `cy.loginViaUI(email, password)` - Login through the UI
- `cy.registerViaUI(username, email, password)` - Register through the UI
- `cy.logoutViaUI()` - Logout through the UI
- `cy.clearStorage()` - Clear localStorage

## Test Data

Some tests require a test user. You can either:
1. Use the registration test to create a test user
2. Create a test user manually in your backend database

Default test credentials (if you create manually):
- Email: `test@example.com`
- Password: `test1234`

## Troubleshooting

### Tests failing because servers aren't running
Make sure both frontend and backend servers are running before starting tests.

### Cypress timeout errors
Increase timeout in `cypress.config.js`:
```javascript
defaultCommandTimeout: 20000, // increase from 10000
```

### Tests failing due to API errors
Check that:
- Backend server is accessible at `http://localhost:5000`
- Database is set up and running
- Backend API endpoints are working

## Writing New Tests

When adding new tests:

1. Create test file in `cypress/e2e/` with `.cy.js` extension
2. Use descriptive test names
3. Clean up state between tests using `beforeEach` hooks
4. Use custom commands from `support/e2e.js` when possible

Example:
```javascript
describe('My Feature', () => {
  beforeEach(() => {
    cy.clearStorage();
    cy.visit('/my-page');
  });

  it('should do something', () => {
    // test code here
  });
});
```

