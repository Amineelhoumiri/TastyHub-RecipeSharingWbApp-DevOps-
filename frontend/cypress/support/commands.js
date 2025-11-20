// custom commands for frontend testing

// login through UI
Cypress.Commands.add('loginViaUI', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').should('be.visible').type(email);
  cy.get('input[type="password"]').should('be.visible').type(password);
  cy.get('button[type="submit"]').should('be.visible').click();
  // wait for redirect after login
  cy.url({ timeout: 10000 }).should('not.include', '/login');
});

// register through UI
Cypress.Commands.add('registerViaUI', (username, email, password) => {
  cy.visit('/register');
  cy.get('input').then(($inputs) => {
    // Find username input (usually first)
    cy.get('input').first().type(username);
    // Find email input
    cy.get('input[type="email"]').type(email);
    // Find password inputs
    cy.get('input[type="password"]').first().type(password);
    cy.get('input[type="password"]').last().type(password);
  });
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

// wait for API response
Cypress.Commands.add('waitForAPI', (alias) => {
  cy.wait(alias, { timeout: 10000 });
});



