// recipe detail page tests
describe('Recipe Detail Page', () => {
  let recipeId;

  before(() => {
    // get a recipe ID from the API or navigate to recipes page
    cy.request('GET', Cypress.env('apiUrl') + '/recipes?page=1&pageSize=1').then((response) => {
      if (response.body.recipes && response.body.recipes.length > 0) {
        recipeId = response.body.recipes[0].id;
      }
    });
  });

  beforeEach(() => {
    if (recipeId) {
      cy.visit(`/recipes/${recipeId}`);
    } else {
      // skip tests if no recipes available
      cy.visit('/recipes');
    }
  });

  it('should display recipe details if recipe exists', () => {
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Recipe not found')) {
        cy.get('h1').should('be.visible');
        cy.contains('Back to Recipes').should('be.visible');
      }
    });
  });

  it('should navigate back to recipes list', () => {
    cy.contains('Back to Recipes').click();
    cy.url().should('include', '/recipes');
  });

  it('should display ingredients section if available', () => {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Ingredients')) {
        cy.contains('Ingredients').should('be.visible');
      }
    });
  });

  it('should display instructions section if available', () => {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Instructions')) {
        cy.contains('Instructions').should('be.visible');
      }
    });
  });

  it('should display comments section', () => {
    cy.contains('Comments').should('be.visible');
  });

  it('should show login prompt for like button when not authenticated', () => {
    cy.clearStorage();
    cy.visit(`/recipes/${recipeId || 1}`);
    cy.contains('Like').should('exist');
    cy.contains('Like').click();
    // should redirect to login
    cy.url().should('include', '/login');
  });
});

