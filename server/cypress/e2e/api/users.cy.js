// Integration tests for User endpoints
describe('User Registration', () => {
  it('POST /api/users/register - should register a new user', () => {
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
    };

    cy.request({
      method: 'POST',
      url: '/api/users/register',
      body: userData,
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('id');
      expect(response.body.user.email).to.eq(userData.email);
      expect(response.body.user.username).to.eq(userData.username);
    });
  });

  it('POST /api/users/register - should reject duplicate email', () => {
    const userData = {
      username: `testuser2_${Date.now()}`,
      email: `duplicate_${Date.now()}@example.com`,
      password: 'password123',
    };

    // Register first time
    cy.request({
      method: 'POST',
      url: '/api/users/register',
      body: userData,
    }).then(() => {
      // Try to register again with same email
      cy.request({
        method: 'POST',
        url: '/api/users/register',
        body: userData,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.include('already exists');
      });
    });
  });

  it('POST /api/users/register - should reject invalid email', () => {
    const userData = {
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123',
    };

    cy.request({
      method: 'POST',
      url: '/api/users/register',
      body: userData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include('valid email');
    });
  });

  it('POST /api/users/register - should reject short password', () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'short',
    };

    cy.request({
      method: 'POST',
      url: '/api/users/register',
      body: userData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include('at least 8 characters');
    });
  });
});

describe('User Login', () => {
  let registeredEmail;
  let registeredPassword;

  before(() => {
    // Register a user for login tests
    registeredEmail = `login_test_${Date.now()}@example.com`;
    registeredPassword = 'password123';

    cy.registerUser({
      username: `logintest_${Date.now()}`,
      email: registeredEmail,
      password: registeredPassword,
    });
  });

  it('POST /api/users/login - should login with valid credentials', () => {
    cy.login(registeredEmail, registeredPassword).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.token).to.be.a('string');
      expect(response.user).to.have.property('id');
      expect(response.user.email).to.eq(registeredEmail);
    });
  });

  it('POST /api/users/login - should reject invalid password', () => {
    cy.request({
      method: 'POST',
      url: '/api/users/login',
      body: {
        email: registeredEmail,
        password: 'wrongpassword',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include('Invalid email or password');
    });
  });

  it('POST /api/users/login - should reject non-existent user', () => {
    cy.request({
      method: 'POST',
      url: '/api/users/login',
      body: {
        email: 'nonexistent@example.com',
        password: 'password123',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include('Invalid email or password');
    });
  });
});

describe('Protected User Endpoints', () => {
  let testUser;

  before(() => {
    // Register and login to get token
    const email = `protected_test_${Date.now()}@example.com`;
    cy.registerUser({
      username: `protected_${Date.now()}`,
      email: email,
      password: 'password123',
    }).then((response) => {
      testUser = response.body.user;
      cy.login(email, 'password123');
    });
  });

  beforeEach(() => {
    // Ensure we have a valid token before each test
    if (!Cypress.env('authToken')) {
      const email = `protected_test_${Date.now()}@example.com`;
      cy.registerUser({
        username: `protected_${Date.now()}`,
        email: email,
        password: 'password123',
      }).then(() => {
        cy.login(email, 'password123');
      });
    }
  });

  it('GET /api/users/profile - should get user profile with valid token', () => {
    cy.authenticatedRequest('GET', '/api/users/profile').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('id');
      expect(response.body.user).to.have.property('email');
    });
  });

  it('GET /api/users/profile - should reject request without token', () => {
    cy.request({
      method: 'GET',
      url: '/api/users/profile',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.include('token');
    });
  });

  it('PUT /api/users/profile - should update user profile', () => {
    const newUsername = `updated_${Date.now()}`;

    cy.authenticatedRequest('PUT', '/api/users/profile', {
      username: newUsername,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.user.username).to.eq(newUsername);
    });
  });
});

describe('User Collection Endpoints', () => {
  let testRecipeId;

  before(() => {
    // Register and login to get token
    const email = `collection_test_${Date.now()}@example.com`;
    cy.registerUser({
      username: `collection_${Date.now()}`,
      email: email,
      password: 'password123',
    }).then(() => {
      cy.login(email, 'password123').then(() => {
        // Create a recipe for this user
        cy.authenticatedRequest('POST', '/api/recipes', {
          title: `My Recipe ${Date.now()}`,
          description: 'A recipe I created',
        }).then((response) => {
          testRecipeId = response.body.recipe.id;

          // Like and favorite the recipe
          cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/like`);
          cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/favourite`);
        });
      });
    });
  });

  it("GET /api/users/recipes - should get user's own recipes", () => {
    cy.authenticatedRequest('GET', '/api/users/recipes').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('recipes');
      expect(response.body).to.have.property('count');
      expect(response.body.recipes).to.be.an('array');
      expect(response.body.recipes.length).to.be.greaterThan(0);
    });
  });

  it("GET /api/users/favorites - should get user's favorite recipes", () => {
    cy.authenticatedRequest('GET', '/api/users/favorites').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('recipes');
      expect(response.body).to.have.property('count');
      expect(response.body.recipes).to.be.an('array');
    });
  });

  it("GET /api/users/liked - should get user's liked recipes", () => {
    cy.authenticatedRequest('GET', '/api/users/liked').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('recipes');
      expect(response.body).to.have.property('count');
      expect(response.body.recipes).to.be.an('array');
    });
  });

  it('PUT /api/users/preferences - should update user preferences', () => {
    const preferences = {
      darkMode: true,
      units: 'metric',
    };

    cy.authenticatedRequest('PUT', '/api/users/preferences', preferences).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('preferences');
      expect(response.body.preferences.darkMode).to.eq(true);
      expect(response.body.preferences.units).to.eq('metric');
    });
  });

  it('PUT /api/users/preferences - should reject invalid units', () => {
    cy.request({
      method: 'PUT',
      url: '/api/users/preferences',
      headers: {
        Authorization: `Bearer ${Cypress.env('authToken')}`,
      },
      body: {
        units: 'invalid_unit',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      // Check that the error message mentions the valid units
      expect(response.body.message).to.match(/metric|imperial/i);
    });
  });

  it('PUT /api/users/preferences - should reject invalid darkMode type', () => {
    cy.request({
      method: 'PUT',
      url: '/api/users/preferences',
      headers: {
        Authorization: `Bearer ${Cypress.env('authToken')}`,
      },
      body: {
        darkMode: 'yes', // Should be boolean
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include('boolean');
    });
  });
});

