// custom commands for frontend testing

// login through UI
Cypress.Commands.add('loginViaUI', (email, password) => {
  cy.visit('/login');
  cy.get('input[id="email"]').should('be.visible').type(email);
  cy.get('input[id="password"]').should('be.visible').type(password);
  cy.get('button[type="submit"]').should('be.visible').click();
  // wait for redirect after login
  cy.url({ timeout: 10000 }).should('not.include', '/login');
});

// register through UI
Cypress.Commands.add('registerViaUI', (username, email, password) => {
  cy.visit('/register');
  cy.get('input[id="username"]').should('be.visible').type(username);
  cy.get('input[id="email"]').should('be.visible').type(email);
  cy.get('input[id="password"]').should('be.visible').type(password);
  cy.get('input[id="confirmPassword"]').should('be.visible').type(password);
  cy.get('button[type="submit"]').should('be.visible').click();
  // wait for redirect after registration
  cy.url({ timeout: 10000 }).should('not.include', '/register');
});

// logout through UI
Cypress.Commands.add('logoutViaUI', () => {
  cy.get('button').contains('Logout').click();
  cy.url().should('eq', Cypress.config('baseUrl') + '/');
});

// clear localStorage
Cypress.Commands.add('clearStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});

