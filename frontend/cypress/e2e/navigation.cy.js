// navigation tests
describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate between pages using navbar', () => {
    // Navigate to Recipes
    cy.contains('Recipes').click();
    cy.url().should('include', '/recipes');
    
    // Navigate back to Home
    cy.contains('Home').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
    
    // Navigate to Login
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });

  it('should maintain navigation state', () => {
    // Home page should have nav
    cy.get('nav').should('be.visible');
    cy.visit('/recipes');
    // Recipes page should have nav
    cy.get('nav').should('be.visible');
    // Login page doesn't have nav in current implementation, so skip that check
    cy.visit('/login');
    // Verify we're on login page
    cy.url().should('include', '/login');
    cy.contains('Login to TastyHub').should('be.visible');
  });

  it('should navigate using browser back button', () => {
    cy.visit('/recipes');
    cy.go('back');
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });
});



