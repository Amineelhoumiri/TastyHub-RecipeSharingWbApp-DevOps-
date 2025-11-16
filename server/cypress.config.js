const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    video: false, // Disable video recording for API tests
    screenshotOnRunFailure: false, // Disable screenshots for API tests
    defaultCommandTimeout: 10000, // Increase timeout for API requests
    requestTimeout: 10000,
  },
  env: {
    // Custom environment variables
    apiUrl: 'http://localhost:5000/api',
  },
});






