// This file runs before every test file
// We use it to set up API testing helpers and custom commands

// Helper function to register a user
Cypress.Commands.add('registerUser', (userData) => {
  return cy.request({
    method: 'POST',
    url: '/api/users/register',
    body: userData,
    failOnStatusCode: false, // Don't fail if user already exists
  });
});

// Helper function to login and store token
Cypress.Commands.add('login', (email, password) => {
  return cy.request({
    method: 'POST',
    url: '/api/users/login',
    body: {
      email: email,
      password: password,
    },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200) {
      expect(response.body).to.have.property('token');
      // Store token for future requests
      Cypress.env('authToken', response.body.token);
      return response.body;
    }
    return response;
  });
});

// Helper function to make authenticated requests
Cypress.Commands.add('authenticatedRequest', (method, url, body = null) => {
  const token = Cypress.env('authToken');
  
  if (!token) {
    throw new Error('No auth token found. Please login first using cy.login()');
  }
  
  const options = {
    method: method,
    url: url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  if (body) {
    options.body = body;
  }
  
  return cy.request(options);
});

// Helper to clear auth token
Cypress.Commands.add('clearAuth', () => {
  Cypress.env('authToken', null);
});


