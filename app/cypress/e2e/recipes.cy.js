// recipes listing page tests
describe('Recipes Page', () => {
  beforeEach(() => {
    cy.visit('/recipes');
  });

  it('should display recipes page', () => {
    cy.contains('All Recipes').should('be.visible');
  });

  it('should display recipe cards if recipes exist', () => {
    // check if recipes are loaded
    cy.wait(2000);
    
    // if recipes exist, they should be displayed
    cy.get('body').then(($body) => {
      if ($body.text().includes('No recipes available')) {
        cy.contains('No recipes available').should('be.visible');
      } else {
        // recipes should have links
        cy.get('a[href*="/recipes/"]').should('exist');
      }
    });
  });

  it('should navigate to recipe detail page when clicking a recipe', () => {
    cy.wait(2000);
    
    cy.get('body').then(($body) => {
      if (!$body.text().includes('No recipes available')) {
        cy.get('a[href*="/recipes/"]').first().click();
        cy.url().should('match', /\/recipes\/\d+/);
      }
    });
  });

  it('should have navigation back to home', () => {
    cy.get('nav').contains('Home').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });
});

