// user workflow integration test
describe('User Workflow Test', () => {
  beforeEach(() => {
    cy.clearStorage();
  });

  it('should complete full user workflow from registration to recipe interaction', () => {
    const timestamp = Date.now();
    const username = `user${timestamp}`;
    const email = `user${timestamp}@example.com`;
    const password = 'test1234';

    // step 1: register new user
    cy.visit('/register');
    cy.get('input[id="username"]').should('be.visible').type(username);
    cy.get('input[id="email"]').should('be.visible').type(email);
    cy.get('input[id="password"]').should('be.visible').type(password);
    cy.get('input[id="confirmPassword"]').should('be.visible').type(password);
    cy.get('button[type="submit"]').should('be.visible').click();

    // verify registration success
    cy.url({ timeout: 10000 }).should('eq', Cypress.config('baseUrl') + '/');
    cy.contains('Welcome').should('be.visible');

    // step 2: navigate to recipes page
    cy.contains('Recipes').click();
    cy.url().should('include', '/recipes');
    cy.contains('All Recipes').should('be.visible');

    // step 3: check if recipes exist and interact
    cy.wait(2000);
    cy.get('body').then(($body) => {
      if (!$body.text().includes('No recipes available')) {
        // click on first recipe
        cy.get('a[href*="/recipes/"]').first().click();
        cy.url().should('match', /\/recipes\/\d+/);
        
        // verify recipe page elements
        cy.get('h1').should('be.visible');
        cy.contains('Back to Recipes').should('be.visible');
        cy.contains('Comments').should('be.visible');
        
        // try to like recipe (should work when logged in)
        cy.contains('Like').should('exist');
      }
    });

    // step 4: logout
    cy.visit('/');
    cy.contains('Logout').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
    cy.contains('Login').should('be.visible');
    cy.contains('Sign Up').should('be.visible');
  });

  it('should handle login workflow', () => {
    const timestamp = Date.now();
    const username = `loginuser${timestamp}`;
    const email = `login${timestamp}@example.com`;
    const password = 'test1234';

    // create user first
    cy.registerViaUI(username, email, password);
    cy.contains('Welcome').should('be.visible');

    // logout
    cy.contains('Logout').click();

    // login with same credentials
    cy.loginViaUI(email, password);
    cy.contains('Welcome').should('be.visible');
    cy.contains('Logout').should('be.visible');
  });
});


