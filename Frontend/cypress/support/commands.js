// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to check if server is running
Cypress.Commands.add('checkServerHealth', () => {
  cy.request({
    url: Cypress.config('baseUrl'),
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 404) {
      cy.log('⚠️ Warning: Server returned 404. Make sure the frontend server is running with "npm run dev"');
    }
  });
});

// Custom command to visit a page and check for 404, returns true if page loaded successfully
Cypress.Commands.add('visitAndCheck', (url, options = {}) => {
  cy.visit(url, { failOnStatusCode: false, ...options });
  cy.wait(1000);
  return cy.get('body', { timeout: 5000 }).then(($body) => {
    const bodyText = $body.text();
    const is404 = bodyText.includes('404') || 
                  bodyText.includes('Not Found') || 
                  bodyText.includes('This page could not be found') ||
                  bodyText.includes('page could not be found');
    
    if (is404) {
      cy.log(`⚠️ Warning: ${url} returned 404 - server may need restart`);
      return false; // Page is 404
    }
    return true; // Page loaded successfully
  });
});
