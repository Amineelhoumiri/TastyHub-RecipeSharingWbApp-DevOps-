// navigation tests
describe('Navigation', () => {
  beforeEach(() => {
    cy.clearStorage();
    cy.visit('/');
  });

  it('should navigate between pages using navbar', () => {
    // test Home link
    cy.contains('Home').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');

    // test Recipes link
    cy.contains('Recipes').click();
    cy.url().should('include', '/recipes');

    // test Login link when not authenticated
    cy.visit('/');
    cy.contains('Login').click();
    cy.url().should('include', '/login');

    // test Sign Up link
    cy.visit('/');
    cy.contains('Sign Up').click();
    cy.url().should('include', '/register');
  });

  it('should show logged in state after login', () => {
    // this test will create a new user first, then login
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const email = `test${timestamp}@example.com`;
    const password = 'test1234';

    // register first
    cy.registerViaUI(username, email, password);
    
    // clear and login again to test login flow
    cy.clearStorage();
    cy.loginViaUI(email, password);
    
    // should show welcome message
    cy.contains('Welcome', { timeout: 5000 }).should('be.visible');
    cy.contains('Logout').should('be.visible');
    cy.contains('Profile').should('be.visible');
    cy.contains('Login').should('not.exist');
  });

  it('should logout and show login button', () => {
    // create a new user and login first
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const email = `test${timestamp}@example.com`;
    const password = 'test1234';
    
    cy.registerViaUI(username, email, password);
    cy.logoutViaUI();
    
    // should show login and sign up buttons
    cy.contains('Login').should('be.visible');
    cy.contains('Sign Up').should('be.visible');
    cy.contains('Logout').should('not.exist');
  });
});

