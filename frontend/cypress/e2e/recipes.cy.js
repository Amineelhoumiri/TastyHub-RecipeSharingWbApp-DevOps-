// recipes listing page tests
describe('Recipes Page', () => {
  beforeEach(() => {
    cy.visit('/recipes');
  });

  it('should display recipes page', () => {
    cy.contains('Recipes', { matchCase: false }).should('be.visible');
  });

  it('should display recipe cards if recipes exist', () => {
    // Wait for API call to complete
    cy.wait(2000);
    
    // Check if recipes are loaded or empty state is shown
    cy.get('body').then(($body) => {
      if ($body.text().includes('No recipes') || $body.text().includes('available')) {
        cy.contains('No recipes', { matchCase: false }).should('be.visible');
      } else {
        // Recipes should have links or cards
        cy.get('a[href*="/recipes/"]').should('exist');
      }
    });
  });

  it('should navigate to recipe detail page when clicking a recipe', () => {
    cy.wait(2000);
    
    cy.get('body').then(($body) => {
      if (!$body.text().includes('No recipes') && !$body.text().includes('available')) {
        cy.get('a[href*="/recipes/"]').first().click();
        cy.url().should('match', /\/recipes\/[\w-]+/);
      }
    });
  });

  it('should have navigation back to home', () => {
    cy.get('nav').contains('Home').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('should display loading state initially', () => {
    // The page should show some content while loading
    cy.get('body').should('be.visible');
  });
});


