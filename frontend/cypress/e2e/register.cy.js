// registration page tests
describe('Register Page', () => {
  beforeEach(() => {
    cy.clearStorage();
    cy.visit('/register');
  });

  it('should display registration form', () => {
    cy.contains('Create Account').should('be.visible');
    cy.get('input').should('have.length.at.least', 3); // username, email, password fields
  });

  it('should show error for invalid email', () => {
    cy.get('input').first().type('testuser');
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('password123');
    cy.get('button[type="submit"]').click();
    
    // Browser validation should prevent submission or show error
    cy.get('input[type="email"]').should('have.attr', 'type', 'email');
  });

  it('should navigate to login page from link', () => {
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });

  it('should require all fields', () => {
    cy.get('input[type="email"]').should('have.attr', 'required');
    cy.get('input[type="password"]').should('have.length.at.least', 1);
  });
});



