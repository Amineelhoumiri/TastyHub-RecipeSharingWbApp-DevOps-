const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: [
      'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/tests/**/*.cy.{js,jsx,ts,tsx}'
    ],
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    viewportWidth: 1280,
    viewportHeight: 720,
    // Retry failed tests once
    retries: {
      runMode: 1,
      openMode: 0
    }
  },
  env: {
    apiUrl: 'http://localhost:5000/api',
  },
});


