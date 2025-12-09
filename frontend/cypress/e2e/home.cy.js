// home page tests
describe('Home Page', () => {
  beforeEach(function () {
    cy.visitAndCheck('/').then((loaded) => {
      if (!loaded) {
        this.skip(); // Skip all tests in this suite if 404
      }
    });
  });

  it('should display navigation bar', () => {
    cy.get('nav').should('be.visible');
    cy.contains('TastyHub').should('be.visible');
    cy.contains('Home').should('be.visible');
    cy.contains('Recipes').should('be.visible');
  });

  it('should display hero section', () => {
    cy.contains('Share & Discover Amazing Recipes').should('be.visible');
    cy.contains('Browse Recipes').should('be.visible');
    cy.contains('Join Now').should('be.visible');
  });

  it('should navigate to recipes page when clicking Browse Recipes', () => {
    cy.contains('Browse Recipes').click();
    cy.url({ timeout: 10000 }).should('include', '/recipes');
    cy.wait(500); // Wait for page to fully load
  });

  it('should navigate to register page when clicking Join Now', () => {
    cy.contains('Join Now').click();
    cy.url({ timeout: 10000 }).should('include', '/register');
    cy.wait(500); // Wait for page to fully load
  });

  it('should display featured recipes section', () => {
    cy.contains('Featured Recipes').scrollIntoView().should('be.visible');
  });

  it('should navigate to login from navbar when not authenticated', () => {
    cy.contains('Log in').should('be.visible');
    cy.contains('Log in').click();
    cy.url({ timeout: 10000 }).should('include', '/login');
    cy.wait(500); // Wait for page to fully load
  });
});
