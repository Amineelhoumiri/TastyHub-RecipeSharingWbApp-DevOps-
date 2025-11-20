// registration page tests
describe('Register Page', () => {
  beforeEach(() => {
    cy.clearStorage();
    cy.visit('/register');
  });

  it('should display registration form', () => {
    cy.contains('Join TastyHub').should('be.visible');
    cy.get('input[id="username"]').should('be.visible');
    cy.get('input[id="email"]').should('be.visible');
    cy.get('input[id="password"]').should('be.visible');
    cy.get('input[id="confirmPassword"]').should('be.visible');
  });

  it('should show error when fields are empty', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Please fill in all fields').should('be.visible');
  });

  it('should show error for short password', () => {
    cy.get('input[id="username"]').type('testuser');
    cy.get('input[id="email"]').type('test@example.com');
    cy.get('input[id="password"]').type('12345');
    cy.get('input[id="confirmPassword"]').type('12345');
    cy.get('button[type="submit"]').click();
    cy.contains('at least 6 characters').should('be.visible');
  });

  it('should show error when passwords do not match', () => {
    cy.get('input[id="username"]').type('testuser');
    cy.get('input[id="email"]').type('test@example.com');
    cy.get('input[id="password"]').type('password123');
    cy.get('input[id="confirmPassword"]').type('different123');
    cy.get('button[type="submit"]').click();
    cy.contains('Passwords do not match').should('be.visible');
  });

  it('should navigate to login page from link', () => {
    cy.contains('Sign in here').click();
    cy.url().should('include', '/login');
  });

  it('should successfully register a new user', () => {
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const email = `test${timestamp}@example.com`;
    const password = 'test1234';

    cy.get('input[id="username"]').type(username);
    cy.get('input[id="email"]').type(email);
    cy.get('input[id="password"]').type(password);
    cy.get('input[id="confirmPassword"]').type(password);
    cy.get('button[type="submit"]').click();

    // should redirect to home page after successful registration
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
    cy.contains('Welcome').should('be.visible');
  });
});

