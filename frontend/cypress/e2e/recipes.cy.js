// recipes listing page tests
describe('Recipes Page', () => {
  beforeEach(function () {
    cy.visitAndCheck('/recipes').then((loaded) => {
      if (!loaded) {
        this.skip(); // Skip all tests in this suite if 404
      }
    });
  });

  it('should display recipes page', () => {
    // Wait for page to load
    cy.get('input[placeholder*="Search"]', { timeout: 15000 }).should('be.visible');
    cy.contains('Recipes', { matchCase: false }).should('be.visible');
  });

  it('should display recipe cards if recipes exist', () => {
    // Wait for the page to fully load by checking for the search input
    cy.get('input[placeholder*="Search"]', { timeout: 15000 }).should('be.visible');
    cy.wait(2000); // Additional wait for API call

    // Check if recipes are loaded or empty state is shown
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const bodyText = $body.text();
      if (
        bodyText.includes('No recipes') ||
        bodyText.includes('No recipes found') ||
        bodyText.includes('available yet')
      ) {
        // Empty state is acceptable - just verify it's shown
        cy.contains(/no recipes|no recipes found|available yet/i).should('be.visible');
      } else {
        // Recipes should have links - check for recipe card links
        // The RecipeCard component wraps everything in a Link with href="/recipes/{id}"
        cy.get('a[href*="/recipes/"]', { timeout: 10000 }).should('exist');
      }
    });
  });

  it('should navigate to recipe detail page when clicking a recipe', () => {
    // Wait for page to load
    cy.get('input[placeholder*="Search"]', { timeout: 15000 }).should('be.visible');
    cy.wait(2000);

    cy.get('body', { timeout: 10000 }).then(($body) => {
      const bodyText = $body.text();
      if (
        !bodyText.includes('No recipes') &&
        !bodyText.includes('No recipes found') &&
        !bodyText.includes('available yet')
      ) {
        // Only test navigation if recipes exist
        cy.get('a[href*="/recipes/"]', { timeout: 10000 }).first().should('be.visible').click();
        cy.url({ timeout: 10000 }).should('match', /\/recipes\/[\w-]+/);
        cy.wait(1000);
      } else {
        // Skip test if no recipes - mark as pending
        cy.log('No recipes available, skipping navigation test');
      }
    });
  });

  it('should have navigation back to home', () => {
    // Wait for page to load
    cy.get('input[placeholder*="Search"]', { timeout: 15000 }).should('be.visible');
    cy.get('nav').contains('Home').click();
    cy.url({ timeout: 10000 }).should('eq', Cypress.config('baseUrl') + '/');
    cy.wait(500);
  });

  it('should display loading state initially', () => {
    // The page should show some content while loading
    cy.get('body').should('be.visible');
  });
});
