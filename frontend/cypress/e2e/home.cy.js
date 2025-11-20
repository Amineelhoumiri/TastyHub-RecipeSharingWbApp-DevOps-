// home page tests
describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
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
    cy.url().should('include', '/recipes');
  });

  it('should navigate to register page when clicking Join Now', () => {
    cy.contains('Join Now').click();
    cy.url().should('include', '/register');
  });

  it('should display featured recipes section', () => {
    cy.contains('Featured Recipes').should('be.visible');
  });

  it('should navigate to login from navbar when not authenticated', () => {
    cy.contains('Login').should('be.visible');
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });
});



